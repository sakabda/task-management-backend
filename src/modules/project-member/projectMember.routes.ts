import express from "express";

import auth from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validate.middleware";

import { ProjectMemberControllers } from "./projectMember.controller";

import { addMemberValidationSchema } from "./projectMember.validation";

const router = express.Router();

router.get(
  "/:projectId/available-members",
  auth("USER", "ADMIN"),
  ProjectMemberControllers.getAvailableMembers,
);

router.post(
  "/:projectId/members",
  auth("USER", "ADMIN"),
  validateRequest(addMemberValidationSchema),
  ProjectMemberControllers.addMember,
);

router.get(
  "/:projectId/members",
  auth("USER", "ADMIN"),
  ProjectMemberControllers.getMembers,
);

router.get(
  "/:projectId/available-assign-members/:workspaceId",
  auth("USER", "ADMIN"),
  ProjectMemberControllers.getAvailableAssignMembers,
);

router.delete(
  "/members/:memberId",
  auth("USER", "ADMIN"),
  ProjectMemberControllers.removeMember,
);

export const ProjectMemberRoutes = router;
