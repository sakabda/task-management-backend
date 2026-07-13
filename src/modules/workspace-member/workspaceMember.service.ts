import prisma from "../../prisma/prisma";
import AppError from "../../errors/AppError";

import { TJwtPayload } from "../auth/auth.interface";
import { ActivityLogServices } from "../activity-log/activityLog.service";
import { NotificationServices } from "../notification/notification.service";

import { resolveMembership, assertPermission } from "../../lib/tenant-guards";
import { TRole } from "../../lib/permissions";

import { TAddWorkspaceMember } from "./workspaceMember.interface";

// List members of a workspace with their public profile + role.
const getMembersFromDB = async (workspaceId: string, user: TJwtPayload) => {
  await resolveMembership(workspaceId, user.id);

  return prisma.workspaceMember.findMany({
    where: {
      workspaceId,
      user: {
        role: {
          not: "ADMIN",
        },
      },
    },

    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      teams: { include: { team: { select: { id: true, name: true } } } },
    },
    orderBy: { joinedAt: "asc" },
  });
};

// Add an existing user to a workspace with a role. Requires the
// workspace.members.invite permission (same gate as sending an invitation).
const addMemberIntoDB = async (
  workspaceId: string,
  user: TJwtPayload,
  payload: TAddWorkspaceMember,
) => {
  const membership = await resolveMembership(workspaceId, user.id);
  assertPermission(membership, "workspace.members.invite");

  const targetUser = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true },
  });

  if (!targetUser) {
    throw new AppError(404, "User not found");
  }

  try {
    const created = await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: payload.userId,
        role: payload.role ?? ("DEVELOPER" as TRole),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await ActivityLogServices.createActivityLog({
      action: "WORKSPACE_MEMBER_ADDED",
      entity: "WORKSPACE_MEMBER",
      entityId: created.id,
      userId: user.id,
      details: { workspaceId, addedUserId: payload.userId, role: created.role },
    });

    await NotificationServices.createNotification(
      payload.userId,
      "Added to workspace",
      `You were added to a workspace as ${created.role}.`,
    );

    return created;
  } catch (err: any) {
    if (err?.code === "P2002") {
      throw new AppError(409, "User is already a member of this workspace");
    }
    throw err;
  }
};

// Change a member's role. ORG_ADMIN can't be stripped from the last
// remaining admin — guard against locking the workspace out.
const updateMemberRoleIntoDB = async (
  workspaceId: string,
  memberId: string,
  user: TJwtPayload,
  role: TRole,
) => {
  const membership = await resolveMembership(workspaceId, user.id);
  assertPermission(membership, "workspace.members.update_role");

  const target = await prisma.workspaceMember.findUnique({
    where: { id: memberId },
    select: { id: true, role: true, userId: true },
  });

  if (!target) {
    throw new AppError(404, "Workspace member not found");
  }

  // Demote-away protection: don't remove the last ORG_ADMIN.
  if (target.role === "ORG_ADMIN" && role !== "ORG_ADMIN") {
    const orgAdminCount = await prisma.workspaceMember.count({
      where: { workspaceId, role: "ORG_ADMIN" },
    });
    if (orgAdminCount <= 1) {
      throw new AppError(
        400,
        "Cannot demote the last organization admin of this workspace",
      );
    }
  }

  const updated = await prisma.workspaceMember.update({
    where: { id: memberId },
    data: { role },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  await ActivityLogServices.createActivityLog({
    action: "WORKSPACE_MEMBER_ROLE_CHANGED",
    entity: "WORKSPACE_MEMBER",
    entityId: memberId,
    userId: user.id,
    details: { previousRole: target.role, newRole: role },
  });

  return updated;
};

const removeMemberFromDB = async (
  workspaceId: string,
  memberId: string,
  user: TJwtPayload,
) => {
  const membership = await resolveMembership(workspaceId, user.id);
  assertPermission(membership, "workspace.members.remove");

  const target = await prisma.workspaceMember.findUnique({
    where: { id: memberId },
    select: { id: true, role: true, userId: true },
  });

  if (!target) {
    throw new AppError(404, "Workspace member not found");
  }

  // A member may remove themselves; otherwise require remove permission
  // (already asserted above). Block removing the last ORG_ADMIN.
  if (target.role === "ORG_ADMIN") {
    const orgAdminCount = await prisma.workspaceMember.count({
      where: { workspaceId, role: "ORG_ADMIN" },
    });
    if (orgAdminCount <= 1) {
      throw new AppError(400, "Cannot remove the last organization admin");
    }
  }

  await prisma.workspaceMember.delete({ where: { id: memberId } });

  // Clear the removed user's activeWorkspaceId if it pointed here.
  if (target.userId) {
    await prisma.user.updateMany({
      where: { id: target.userId, activeWorkspaceId: workspaceId },
      data: { activeWorkspaceId: null },
    });
  }

  await ActivityLogServices.createActivityLog({
    action: "WORKSPACE_MEMBER_REMOVED",
    entity: "WORKSPACE_MEMBER",
    entityId: memberId,
    userId: user.id,
    details: { workspaceId, removedUserId: target.userId },
  });

  return null;
};

export const WorkspaceMemberServices = {
  getMembersFromDB,
  addMemberIntoDB,
  updateMemberRoleIntoDB,
  removeMemberFromDB,
};
