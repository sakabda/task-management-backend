import prisma from "../../prisma/prisma";
import AppError from "../../errors/AppError";

import { TJwtPayload } from "../auth/auth.interface";
import { ActivityLogServices } from "../activity-log/activityLog.service";

import { resolveMembership, assertPermission } from "../../lib/tenant-guards";
import { TRole } from "../../lib/permissions";

import { TCreateWorkspace, TUpdateWorkspace } from "./workspace.interface";

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);

const ensureUniqueSlug = async (base: string): Promise<string> => {
  let candidate = base || "workspace";
  let n = 1;
  while (n < 50) {
    const exists = await prisma.workspace.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
    candidate = `${base}-${++n}`;
  }
  return `${base}-${Date.now().toString(36)}`;
};

// Create a workspace inside an organization. The caller must be the org
// owner (or ADMIN) — creating a workspace is an org-level action, not a
// per-workspace one, so we check organization ownership directly.
const createWorkspaceIntoDB = async (
  user: TJwtPayload,
  payload: TCreateWorkspace,
) => {
  const organization = await prisma.organization.findUnique({
    where: { id: payload.organizationId },
    select: { id: true, ownerId: true },
  });

  if (!organization) {
    throw new AppError(404, "Organization not found");
  }

  if (organization.ownerId !== user.id && user.role !== "ADMIN") {
    throw new AppError(403, "Only the organization owner can create workspaces");
  }

  const slug = await ensureUniqueSlug(payload.slug || slugify(payload.name));

  const workspace = await prisma.workspace.create({
    data: {
      name: payload.name,
      slug,
      description: payload.description,
      iconUrl: payload.iconUrl,
      organizationId: payload.organizationId,
    },
    include: {
      organization: { select: { id: true, name: true, slug: true } },
    },
  });

  // The org owner becomes ORG_ADMIN of the new workspace automatically.
  await prisma.workspaceMember.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      role: "ORG_ADMIN" as TRole,
    },
  });

  await ActivityLogServices.createActivityLog({
    action: "WORKSPACE_CREATED",
    entity: "WORKSPACE",
    entityId: workspace.id,
    userId: user.id,
    details: { name: workspace.name, slug: workspace.slug },
  });

  return workspace;
};

// Workspaces the caller belongs to.
const getWorkspacesFromDB = async (user: TJwtPayload) => {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: user.id },
    select: {
      role: true,
      workspace: {
        include: {
          organization: { select: { id: true, name: true, slug: true } },
          _count: { select: { members: true, projects: true, teams: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return memberships.map((m) => ({
    ...m.workspace,
    role: m.role,
  }));
};

const getSingleWorkspaceFromDB = async (
  workspaceId: string,
  user: TJwtPayload,
) => {
  const membership = await resolveMembership(workspaceId, user.id);

  const workspace = await prisma.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
    include: {
      organization: { select: { id: true, name: true, slug: true } },
      _count: { select: { members: true, projects: true, teams: true, departments: true } },
    },
  });

  return { ...workspace, role: membership.role };
};

const updateWorkspaceIntoDB = async (
  workspaceId: string,
  user: TJwtPayload,
  payload: TUpdateWorkspace,
) => {
  const membership = await resolveMembership(workspaceId, user.id);
  assertPermission(membership, "workspace.manage");

  if (payload.slug) {
    const clash = await prisma.workspace.findUnique({
      where: { slug: payload.slug },
      select: { id: true },
    });
    if (clash && clash.id !== workspaceId) {
      throw new AppError(409, "Slug is already taken");
    }
  }

  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: payload,
    include: {
      organization: { select: { id: true, name: true, slug: true } },
    },
  });

  await ActivityLogServices.createActivityLog({
    action: "WORKSPACE_UPDATED",
    entity: "WORKSPACE",
    entityId: workspace.id,
    userId: user.id,
    details: payload,
  });

  return workspace;
};

const deleteWorkspaceIntoDB = async (
  workspaceId: string,
  user: TJwtPayload,
) => {
  const membership = await resolveMembership(workspaceId, user.id);
  assertPermission(membership, "workspace.delete");

  await prisma.workspace.delete({ where: { id: workspaceId } });

  await ActivityLogServices.createActivityLog({
    action: "WORKSPACE_DELETED",
    entity: "WORKSPACE",
    entityId: workspaceId,
    userId: user.id,
  });

  return null;
};

export const WorkspaceServices = {
  createWorkspaceIntoDB,
  getWorkspacesFromDB,
  getSingleWorkspaceFromDB,
  updateWorkspaceIntoDB,
  deleteWorkspaceIntoDB,
};
