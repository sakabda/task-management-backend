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
  auth("USER", "ADMIN"),
  validateRequest(createOrganizationValidationSchema),
  OrganizationControllers.createOrganization,
);

router.get("/", auth("USER", "ADMIN"), OrganizationControllers.getOrganizations);

router.get(
  "/:id",
  auth("USER", "ADMIN"),
  OrganizationControllers.getSingleOrganization,
);

router.patch(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(updateOrganizationValidationSchema),
  OrganizationControllers.updateOrganization,
);

router.delete(
  "/:id",
  auth("USER", "ADMIN"),
  OrganizationControllers.deleteOrganization,
);

export default router;
