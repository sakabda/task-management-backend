import type { TRole } from "../../lib/permissions";

export interface TRegisterUser {
  name: string;
  email: string;
  password: string;
}

export interface TLoginUser {
  email: string;
  password: string;
}

// JWT payload. The active-workspace context rides in the token so the
// tenant switcher is server-validated: switching re-issues a token with
// a new activeWorkspaceId (see /auth/switch-workspace).
export interface TJwtPayload {
  id: string;
  email: string;
  role: string; // global role: "USER" | "ADMIN" | "SUPER_ADMIN"
  activeWorkspaceId?: string;
  workspaceRole?: TRole;
}
