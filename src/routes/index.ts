import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes";
import taskRoutes from "../modules/task/task.routes";
import { ActivityLogRoutes } from "../modules/activity-log/activityLog.routes";
import { CommentRoutes } from "../modules/comment/comment.routes";
import { ProjectRoutes } from "../modules/project/project.routes";
import { ProjectMemberRoutes } from "../modules/project-member/projectMember.routes";
import { NotificationRoutes } from "../modules/notification/notification.routes";
import { DashboardRoutes } from "../modules/dashboard/dashboard.routes";

// Phase 1 — multi-tenant foundation
import organizationRoutes from "../modules/organization/organization.routes";
import workspaceRoutes from "../modules/workspace/workspace.routes";
import departmentRoutes from "../modules/department/department.routes";
import teamRoutes from "../modules/team/team.routes";
import workspaceMemberRoutes from "../modules/workspace-member/workspaceMember.routes";
import invitationRoutes from "../modules/invitation/invitation.routes";

const router = Router();

const moduleRoutes = [
  { path: "/auth", route: authRoutes },
  { path: "/tasks", route: taskRoutes },
  { path: "/activity-logs", route: ActivityLogRoutes },
  { path: "/comments", route: CommentRoutes },
  { path: "/projects", route: ProjectRoutes },
  // Project members (nested under /projects)
  { path: "/projects", route: ProjectMemberRoutes },
  { path: "/notifications", route: NotificationRoutes },
  { path: "/dashboard", route: DashboardRoutes },

  // Phase 1 — tenant hierarchy
  { path: "/organizations", route: organizationRoutes },
  { path: "/workspaces", route: workspaceRoutes },
  // Departments, teams and workspace-members are nested under /workspaces
  // (e.g. POST /workspaces/:workspaceId/departments) so each router reads
  // req.params.workspaceId for membership resolution.
  { path: "/workspaces", route: departmentRoutes },
  { path: "/workspaces", route: teamRoutes },
  { path: "/workspaces", route: workspaceMemberRoutes },
  { path: "/invitations", route: invitationRoutes },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
