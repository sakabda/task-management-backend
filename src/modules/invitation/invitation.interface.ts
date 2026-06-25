import type { TRole } from "../../lib/permissions";

export interface TCreateInvitation {
  email: string;
  role?: TRole;
  organizationId?: string;
  workspaceId?: string;
  teamId?: string;
}
