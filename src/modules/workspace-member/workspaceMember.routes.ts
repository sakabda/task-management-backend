import { Router } from "express";

import auth from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validate.middleware";

import { WorkspaceMemberControllers } from "./workspaceMember.controller";
import {
  addWorkspaceMemberValidationSchema,
  updateWorkspaceMemberRoleValidationSchema,
} from "./workspaceMember.validation";

// Mounted under /workspaces in routes/index.ts — every route here is
// scoped by req.params.workspaceId.
const router = Router();



router.get(
  "/:workspaceId/members",
  auth("USER", "ADMIN"),
  WorkspaceMemberControllers.getMembers,
);

router.post(
  "/:workspaceId/members",
  auth("USER", "ADMIN"),
  validateRequest(addWorkspaceMemberValidationSchema),
  WorkspaceMemberControllers.addMember,
);

router.patch(
  "/:workspaceId/members/:memberId",
  auth("USER", "ADMIN"),
  validateRequest(updateWorkspaceMemberRoleValidationSchema),
  WorkspaceMemberControllers.updateMemberRole,
);

router.delete(
  "/:workspaceId/members/:memberId",
  auth("USER", "ADMIN"),
  WorkspaceMemberControllers.removeMember,
);

export default router;
