import { Router } from "express";

import auth from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validate.middleware";

import { OrganizationControllers } from "./organization.controller";
import {
  createOrganizationValidationSchema,
  updateOrganizationValidationSchema,
} from "./organization.validation";

const router = Router();

// Any authenticated user can create an org (they become its owner).
router.post(
  "/",
  auth("USER", "ADMIN", "SUPER_ADMIN"),
  validateRequest(createOrganizationValidationSchema),
  OrganizationControllers.createOrganization,
);

router.get(
  "/",
  auth("USER", "ADMIN", "SUPER_ADMIN"),
  OrganizationControllers.getOrganizations,
);

router.get(
  "/all",
  auth("ADMIN", "SUPER_ADMIN"),
  OrganizationControllers.getALlOrganizations,
);

router.get(
  "/:id",
  auth("USER", "ADMIN", "SUPER_ADMIN"),
  OrganizationControllers.getSingleOrganization,
);

router.patch(
  "/:id",
  auth("USER", "ADMIN", "SUPER_ADMIN"),
  validateRequest(updateOrganizationValidationSchema),
  OrganizationControllers.updateOrganization,
);

router.delete(
  "/:id",
  auth("USER", "ADMIN", "SUPER_ADMIN"),
  OrganizationControllers.deleteOrganization,
);

export default router;
