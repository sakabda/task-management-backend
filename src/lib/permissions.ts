// ─────────────────────────────────────────────────────────────
// RBAC permission matrix + helpers
//
// Roles (matrix) live on WorkspaceMember.role. SUPER_ADMIN is a global
// flag on User.role and bypasses all checks. The matrix below defines,
// per role, the permission strings a request may carry.
//
// Permission strings are dotted, hierarchical resources:
//   "<resource>.<action>", e.g. "task.create", "workspace.members.invite".
// A wildcard "*" grants everything; "workspace.*" grants every workspace
// permission (handled by hasPermission).
// ─────────────────────────────────────────────────────────────

export const ROLES = [
  "ORG_ADMIN",
  "WORKSPACE_ADMIN",
  "PROJECT_MANAGER",
  "TEAM_LEAD",
  "DEVELOPER",
  "QA",
  "CLIENT",
  "GUEST",
] as const;

export type TRole = (typeof ROLES)[number];

// Global role on User.role (string column kept for backward-compat).
export const SUPER_ADMIN = "SUPER_ADMIN";

// Every permission string the system knows about. Keeping this list
// explicit makes the matrix auditable and gives the frontend a mirror
// to render/can() against.
export const PERMISSIONS = [
  // Organization
  "org.view",
  "org.manage",
  "org.delete",
  // Workspace
  "workspace.view",
  "workspace.create",
  "workspace.manage",
  "workspace.delete",
  "workspace.members.invite",
  "workspace.members.update_role",
  "workspace.members.remove",
  // Department
  "department.view",
  "department.manage",
  // Team
  "team.view",
  "team.manage",
  // Project
  "project.view",
  "project.create",
  "project.update",
  "project.delete",
  "project.archive",
  // Task
  "task.view",
  "task.create",
  "task.update",
  "task.delete",
  "task.assign",
  "task.update_status",
  // Invitation
  "invitation.create",
  "invitation.revoke",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ALL: Permission[] = [...PERMISSIONS];

// ── Matrix ────────────────────────────────────────────────────
// ORG_ADMIN owns the workspace and everything in it. Each lower role
// narrows the surface. CLIENT is read-only; GUEST is read-only and
// restricted to their own assigned tasks at the service layer.
const MATRIX: Record<TRole, Permission[]> = {
  ORG_ADMIN: ALL,

  WORKSPACE_ADMIN: ALL.filter(
    (permission) => permission !== "org.manage" && permission !== "org.delete",
  ),

  PROJECT_MANAGER: [
    "org.view",
    "workspace.view",
    "workspace.members.invite",
    "department.view",
    "team.view",
    "team.manage",
    "project.view",
    "project.create",
    "project.update",
    "project.archive",
    "task.view",
    "task.create",
    "task.update",
    "task.delete",
    "task.assign",
    "task.update_status",
    "invitation.create",
    "invitation.revoke",
  ],

  TEAM_LEAD: [
    "org.view",
    "workspace.view",
    "department.view",
    "team.view",
    "team.manage",
    "project.view",
    "task.view",
    "task.create",
    "task.update",
    "task.update_status",
    "task.assign",
    "invitation.create",
  ],

  DEVELOPER: [
    "org.view",
    "workspace.view",
    "department.view",
    "team.view",
    "project.view",
    "task.view",
    "task.create",
    "task.update",
    "task.update_status",
  ],

  QA: [
    "org.view",
    "workspace.view",
    "department.view",
    "team.view",
    "project.view",
    "task.view",
    "task.update",
    "task.update_status",
  ],

  CLIENT: ["org.view", "workspace.view", "project.view", "task.view"],

  GUEST: ["task.view"],
};

// Resolve a role to its full permission list.
export const getPermissions = (role: TRole): Permission[] => {
  return MATRIX[role] ?? [];
};

// True if the granted set covers the required permission. Honors the
// "*" wildcard and "<resource>.*" wildcards inside `granted`.
export const hasPermission = (
  granted: readonly string[],
  required: string,
): boolean => {
  if (granted.includes("*")) return true;
  if (granted.includes(required)) return true;
  const resource = required.split(".")[0];
  return granted.includes(`${resource}.*`);
};

// Convenience for controllers that already hold the tenant role.
export const can = (
  role: TRole | undefined,
  permission: string,
): boolean => {
  if (!role) return false;
  return hasPermission(getPermissions(role), permission);
};

// True if the global role bypasses RBAC entirely.
export const isSuperAdmin = (globalRole: string | undefined): boolean =>
  globalRole === SUPER_ADMIN;
