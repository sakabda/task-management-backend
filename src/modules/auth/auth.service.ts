import bcrypt from "bcryptjs";

import prisma from "../../prisma/prisma";
import AppError from "../../errors/AppError";
import config from "../../config";

import { createToken } from "../../utils/jwt";

import { TLoginUser, TRegisterUser, TJwtPayload } from "./auth.interface";
import { getPermissions, TRole } from "../../lib/permissions";
import { ActivityLogServices } from "../activity-log/activityLog.service";

// Build a JWT payload for a user, resolving their active workspace + the
// matching WorkspaceMember.role so the tenant context rides in the token.
// If the user has no active workspace, the workspace fields are simply
// omitted — the switcher / switch-workspace flow will set them.
const buildJwtPayload = async (
  userId: string,
  explicitWorkspaceId?: string,
): Promise<TJwtPayload> => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true, email: true, role: true, activeWorkspaceId: true },
  });

  const workspaceId = explicitWorkspaceId ?? user.activeWorkspaceId;

  if (!workspaceId) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId: user.id },
    },
    select: { role: true },
  });

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    activeWorkspaceId: workspaceId,
    workspaceRole: membership?.role,
  };
};

// Provision the default org + workspace for a brand-new self-registered
// user, making them the ORG_ADMIN of their own workspace. Runs in a
// transaction so a partial failure rolls back cleanly.
const provisionDefaultTenant = async (userId: string, userName: string) => {
  const slugBase = (userName || "workspace")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 8);

  return prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name: `${userName || "My"} Organization`,
        slug: `org-${slugBase}-${suffix}`,
        ownerId: userId,
      },
    });

    const workspace = await tx.workspace.create({
      data: {
        name: `${userName || "My"} Workspace`,
        slug: `ws-${slugBase}-${suffix}`,
        organizationId: org.id,
      },
    });

    await tx.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId,
        role: "ORG_ADMIN" as TRole,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { activeWorkspaceId: workspace.id },
    });

    return { org, workspace };
  });
};

const registerUserIntoDB = async (payload: TRegisterUser) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new AppError(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  // New users get their own org + workspace + ORG_ADMIN membership.
  const { workspace } = await provisionDefaultTenant(user.id, user.name);

  await ActivityLogServices.createActivityLog({
    action: "USER_REGISTERED",
    entity: "USER",
    entityId: user.id,
    userId: user.id,
    details: { workspaceId: workspace.id },
  });

  return user;
};

const loginUser = async (payload: TLoginUser) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(401, "Password does not match");
  }

  const jwtPayload = await buildJwtPayload(user.id);

  const accessToken = createToken(
    jwtPayload,
    config.jwt.secret,
    config.jwt.expiresIn,
  );

  return { accessToken };
};


const logOutUser = async (userId: string) => {
  // accessToken delete from local storage

  await ActivityLogServices.createActivityLog({
    action: "USER_LOGOUT",
    entity: "USER",
    entityId: userId,
    userId: userId,
    details: {},
  });
};

// Re-issue a JWT with a different activeWorkspaceId. Validates membership
// before minting so a user can't forge access to a workspace they don't
// belong to by hand-crafting a token request.
const switchWorkspace = async (userId: string, workspaceId: string) => {
  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });

  if (!membership) {
    throw new AppError(403, "You are not a member of this workspace");
  }

  // Persist as the user's last-active workspace so a fresh login returns
  // them to the same place.
  await prisma.user.update({
    where: { id: userId },
    data: { activeWorkspaceId: workspaceId },
  });

  const jwtPayload = await buildJwtPayload(userId, workspaceId);

  const accessToken = createToken(
    jwtPayload,
    config.jwt.secret,
    config.jwt.expiresIn,
  );

  return { accessToken };
};

// Enriched profile for /auth/me — includes the active workspace, the
// user's role in it, and the resolved permission list for the client.
const getMe = async (payload: TJwtPayload) => {
  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      activeWorkspaceId: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  let activeWorkspace: {
    id: string;
    name: string;
    slug: string;
    organizationId: string;
    role: TRole;
    permissions: ReturnType<typeof getPermissions>;
  } | null = null;

  if (user.activeWorkspaceId) {
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: user.activeWorkspaceId,
          userId: user.id,
        },
      },
      select: {
        role: true,
        workspace: { select: { id: true, name: true, slug: true, organizationId: true } },
      },
    });

    if (membership) {
      activeWorkspace = {
        ...membership.workspace,
        role: membership.role,
        permissions: getPermissions(membership.role),
      };
    }
  }

  return { ...user, activeWorkspace };
};

// Existing helper kept for the AssignTaskModal flow — lists users that
// are NOT already project members.
const getAlreadyAssignedUsers = async (projectId: string) => {
  return prisma.projectMember.findMany({
    where: { projectId },
    select: { userId: true },
  });
};

const getAllUsers = async (
  payload: TJwtPayload,
  alreadyAssignedUsers: { userId: string }[],
) => {
  const assignedUserIds = alreadyAssignedUsers.map((m) => m.userId);

  return prisma.user.findMany({
    where: {
      role: "USER",
      NOT: { id: payload.id },
      AND: [{ id: { notIn: assignedUserIds } }],
    },
    select: { id: true, name: true, email: true },
  });
};

const getAllOrgUsers = async (userId: string, workspaceId: string) => {
  return prisma.user.findMany({
    where: {
      role: "USER",

      // Don't return yourself
      id: {
        not: userId,
      },

      // Don't return users already in this workspace
      workspaceMembers: {
        none: {
          workspaceId: workspaceId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
};




export const AuthServices = {
  registerUserIntoDB,
  loginUser,
  logOutUser,
  switchWorkspace,
  getMe,
  getAllUsers,
  getAlreadyAssignedUsers,
  getAllOrgUsers,
};
