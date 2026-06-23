export interface TCreateWorkspace {
  name: string;
  slug?: string;
  description?: string;
  iconUrl?: string;
  organizationId: string;
}

export interface TUpdateWorkspace {
  name?: string;
  slug?: string;
  description?: string;
  iconUrl?: string;
}
