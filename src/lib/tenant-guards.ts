import prisma from "../prisma/prisma";
import AppError from "../errors/AppError";

import { TRole, getPermissions, hasPermission } from "./permissions";

// Loaded once per request when a guard needs to inspect membership.
export type WorkspaceContext = {
  workspaceMemberId: string;
  role: TRole;
  permissions: readonly string[];
};

// Resolve the caller's membership in a workspace. Throws 404 if the
// workspace is missing, 403 if the caller isn't a member.
export const resolveMembership = async (
  workspaceId: string,
  userId: string,
): Promise<WorkspaceContext> => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true },
  });

  if (!workspace) {
    throw new AppError(404, "Workspace not found");
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
    select: { id: true, role: true },
  });

  if (!membership) {
    throw new AppError(403, "You are not a member of this workspace");
  }

  return {
    workspaceMemberId: membership.id,
    role: membership.role,
    permissions: getPermissions(membership.role),
  };
};

// Require a permission against the membership; throws 403 otherwise.
export const assertPermission = (
  ctx: WorkspaceContext,
  permission: string,
): void => {
  if (!hasPermission(ctx.permissions, permission)) {
    throw new AppError(403, `Missing permission: ${permission}`);
  }
};
