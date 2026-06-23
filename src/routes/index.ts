import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes";
import taskRoutes from "../modules/task/task.routes";
import { ActivityLogRoutes } from "../modules/activity-log/activityLog.routes";
import { CommentRoutes } from "../modules/comment/comment.routes";
import { ProjectRoutes } from "../modules/project/project.routes";
import { ProjectMemberRoutes } from "../modules/project-member/projectMember.routes";
import { NotificationRoutes } from "../modules/notification/notification.routes";
import { DashboardRoutes } from "../modules/dashboard/dashboard.routes";
import workspaceRoutes from "../modules/workspace/workspace.routes";
import departmentRoutes from "../modules/department/department.routes";
import organizationRoutes from "../modules/organization/organization.routes";
import teamRoutes from "../modules/team/team.routes";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/tasks",
    route: taskRoutes,
  },
  {
    path: "/activity-logs",
    route: ActivityLogRoutes,
  },
  {
    path: "/comments",
    route: CommentRoutes,
  },
  { path: "/projects", route: ProjectRoutes },
  // Project Members
  {
    path: "/projects",
    route: ProjectMemberRoutes,
  },
  {
    path: "/workspaces",
    route: workspaceRoutes,
  },
  {
    path: "/workspaces",
    route: departmentRoutes,
  },
  {
    path: "/workspaces",
    route: teamRoutes,
  },
  {
    path: "/organizations",
    route: organizationRoutes,
  },
  {
    path: "/notifications",
    route: NotificationRoutes,
  },
  {
    path: "/dashboard",
    route: DashboardRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
