import type { TRole } from "../../lib/permissions";

export interface TCreateOrganization {
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
}

export interface TUpdateOrganization {
  name?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
}

// Re-exported for the validation file to avoid a second import path.
export type { TRole };
