import { Router } from "express";

import auth from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validate.middleware";

import { TeamControllers } from "./team.controller";
import {
  addTeamMemberValidationSchema,
  createTeamValidationSchema,
  updateTeamValidationSchema,
} from "./team.validation";

const router = Router();

// List/create teams scoped to a workspace. Mounted under /workspaces.
router.get(
  "/:workspaceId/teams",
  auth("USER", "ADMIN"),
  TeamControllers.getTeams,
);

router.post(
  "/:workspaceId/teams",
  auth("USER", "ADMIN"),
  validateRequest(createTeamValidationSchema),
  TeamControllers.createTeam,
);

// Single-team operations (path carries the team id directly).
router.get("/teams/:id", auth("USER", "ADMIN"), TeamControllers.getSingleTeam);

router.patch(
  "/teams/:id",
  auth("USER", "ADMIN"),
  validateRequest(updateTeamValidationSchema),
  TeamControllers.updateTeam,
);

router.delete("/teams/:id", auth("USER", "ADMIN"), TeamControllers.deleteTeam);

// Team membership.
router.post(
  "/teams/:id/members",
  auth("USER", "ADMIN"),
  validateRequest(addTeamMemberValidationSchema),
  TeamControllers.addTeamMember,
);

router.delete(
  "/teams/:id/members/:memberId",
  auth("USER", "ADMIN"),
  TeamControllers.removeTeamMember,
);

export default router;
