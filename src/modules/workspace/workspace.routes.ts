import { Router } from "express";

import auth from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validate.middleware";

import { WorkspaceControllers } from "./workspace.controller";
import {
  createWorkspaceValidationSchema,
  updateWorkspaceValidationSchema,
} from "./workspace.validation";

const router = Router();

router.post(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(createWorkspaceValidationSchema),
  WorkspaceControllers.createWorkspace,
);

router.get("/", auth("USER", "ADMIN"), WorkspaceControllers.getWorkspaces);

router.get(
  "/:id",
  auth("USER", "ADMIN"),
  WorkspaceControllers.getSingleWorkspace,
);

router.patch(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(updateWorkspaceValidationSchema),
  WorkspaceControllers.updateWorkspace,
);

router.delete(
  "/:id",
  auth("USER", "ADMIN"),
  WorkspaceControllers.deleteWorkspace,
);

export default router;
