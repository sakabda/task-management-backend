import { OrgStatus, WorkspacePlan } from "@prisma/client";
import type { TRole } from "../../lib/permissions";

type OrganizationStatus = OrgStatus;
type OrganizationPlan = WorkspacePlan;

interface BaseOrganization {
  name: string;
  slug?: string;
  description?: string;
  status?: OrganizationStatus;
  logoUrl?: string;
  plan?: OrganizationPlan;
}

export interface TCreateOrganization extends BaseOrganization {
  owner: {
    name: string;
    email: string;
    password: string;
  };
}

export interface TUpdateOrganization extends Partial<BaseOrganization> {
  owner?: {
    name?: string;
    email?: string;
  };
}

export type { TRole };
