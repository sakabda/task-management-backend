import express from "express";

import auth from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validate.middleware";

import {
  createProjectValidationSchema,
  updateProjectValidationSchema,
} from "./project.validation";

import { ProjectControllers } from "./project.controller";

const router = express.Router();

router.post(
  "/:workspaceId",
  auth("USER", "ADMIN"),
  validateRequest(createProjectValidationSchema),
  ProjectControllers.createProject,
);

router.get(
  "/:workspaceId",
  auth("USER", "ADMIN"),
  ProjectControllers.getProjects,
);

router.get("/:id", auth("USER", "ADMIN"), ProjectControllers.getSingleProject);

router.patch(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(updateProjectValidationSchema),
  ProjectControllers.updateProject,
);

router.delete("/:id", auth("USER", "ADMIN"), ProjectControllers.deleteProject);

export const ProjectRoutes = router;
