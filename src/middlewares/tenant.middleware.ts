import { NextFunction, Request, Response } from "express";

import prisma from "../prisma/prisma";
import AppError from "../errors/AppError";
import { isSuperAdmin, getPermissions, TRole } from "../lib/permissions";

// Resolve the active workspace from the JWT's activeWorkspaceId into a
// concrete tenant context on req.tenant. Must run AFTER auth().
//
// Behavior:
//   - If the user is a global SUPER_ADMIN and has no workspace membership,
//     req.tenant is set with a wildcard role so RBAC passes — operators
//     can cross tenant boundaries.
//   - If activeWorkspaceId is set but the user isn't a member, 403.
//   - If activeWorkspaceId is unset, 400 ("no active workspace"). This is
//     a config error, not a normal user path — the switcher always sets it.
//
// `requireTenant` controls whether the route needs a tenant at all. Most
// workspace-scoped routes do; cross-tenant routes (list my orgs, accept
// an invitation) pass { requireTenant: false }.
type Options = { requireTenant?: boolean };

const resolveTenant = (options: Options = {}) => {
  const { requireTenant = true } = options;

  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError(401, "You are not authorized");
      }

      const workspaceId = user.activeWorkspaceId;

      // No active workspace — either reject or pass through.
      if (!workspaceId) {
        if (requireTenant) {
          throw new AppError(400, "No active workspace selected");
        }
        return next();
      }

      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: user.id,
          },
        },
        select: {
          id: true,
          role: true,
          workspace: {
            select: { id: true, name: true, slug: true },
          },
        },
      });

      // SUPER_ADMIN may operate inside any workspace even without a
      // WorkspaceMember row (system operator, support, migration tooling).
      if (!membership && isSuperAdmin(user.role)) {
        const workspace = await prisma.workspace.findUnique({
          where: { id: workspaceId },
          select: { id: true, name: true, slug: true },
        });
        if (!workspace) {
          throw new AppError(404, "Workspace not found");
        }
        req.tenant = {
          workspaceId: workspace.id,
          role: "ORG_ADMIN" as TRole, // treat as workspace owner
          permissions: getPermissions("ORG_ADMIN"),
          workspaceMemberId: "__super_admin__",
        };
        return next();
      }

      if (!membership) {
        throw new AppError(403, "You are not a member of this workspace");
      }

      req.tenant = {
        workspaceId: membership.workspace.id,
        role: membership.role,
        permissions: getPermissions(membership.role),
        workspaceMemberId: membership.id,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireTenant = resolveTenant({ requireTenant: true });
export const optionalTenant = resolveTenant({ requireTenant: false });

export default requireTenant;
