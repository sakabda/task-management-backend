import type { TRole } from "../../lib/permissions";

export interface TAddWorkspaceMember {
  userId: string;
  role?: TRole;
}

export interface TUpdateWorkspaceMemberRole {
  role: TRole;
}
