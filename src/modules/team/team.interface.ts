export interface TCreateTeam {
  name: string;
  description?: string;
  departmentId?: string | null;
}

export interface TUpdateTeam {
  name?: string;
  description?: string;
  departmentId?: string | null;
}

export interface TAddTeamMember {
  workspaceMemberId: string;
}
