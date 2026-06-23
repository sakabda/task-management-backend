import { Router } from "express";

import auth from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validate.middleware";

import { DepartmentControllers } from "./department.controller";
import {
  createDepartmentValidationSchema,
  updateDepartmentValidationSchema,
} from "./department.validation";

const router = Router();

// Nested under the workspace path so the service can resolve membership
// from req.params.workspaceId. Mounted at /workspaces in routes/index.ts.
router.get(
  "/:workspaceId/departments",
  auth("USER", "ADMIN"),
  DepartmentControllers.getDepartments,
);

router.post(
  "/:workspaceId/departments",
  auth("USER", "ADMIN"),
  validateRequest(createDepartmentValidationSchema),
  DepartmentControllers.createDepartment,
);

router.patch(
  "/departments/:id",
  auth("USER", "ADMIN"),
  validateRequest(updateDepartmentValidationSchema),
  DepartmentControllers.updateDepartment,
);

router.delete(
  "/departments/:id",
  auth("USER", "ADMIN"),
  DepartmentControllers.deleteDepartment,
);

export default router;
