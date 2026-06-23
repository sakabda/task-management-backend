export {};

import type { Permission, TRole } from "../lib/permissions";

declare global {
  namespace Express {
    interface Request {
      // JWT payload — every field is carried by the token so the
      // tenant context survives across the wire. `workspaceRole` is
      // the per-workspace role in the matrix; `role` is the global
      // role ("USER" | "ADMIN" | "SUPER_ADMIN").
      user?: {
        id: string;
        email: string;
        role: string;
        activeWorkspaceId?: string;
        workspaceRole?: TRole;
      };
      // Resolved by tenant.middleware from the active workspace.
      tenant?: {
        workspaceId: string;
        role: TRole;
        permissions: Permission[];
        workspaceMemberId: string;
      };
    }
  }
}
