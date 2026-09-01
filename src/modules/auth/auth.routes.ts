import { Router } from "express";

import { AuthControllers } from "./auth.controller";
import auth from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validate.middleware";
import {
  loginValidationSchema,
  registerValidationSchema,
  switchWorkspaceValidationSchema,
} from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(registerValidationSchema),
  AuthControllers.registerUser,
);
router.post(
  "/login",
  validateRequest(loginValidationSchema),
  AuthControllers.loginUser,
);
router.get("/me", auth("USER", "ADMIN", "SUPER_ADMIN"), AuthControllers.getMe);

// Re-issue the access token with a new active workspace.
router.post(
  "/switch-workspace",
  auth("USER", "ADMIN", "SUPER_ADMIN"),
  validateRequest(switchWorkspaceValidationSchema),
  AuthControllers.switchWorkspace,
);

router.get(
  "/users/:projectId",
  auth("USER", "ADMIN", "SUPER_ADMIN"),
  AuthControllers.allUsers,
);

router.get(
  "/users/:userId/org-users/:workspaceId",
  auth("USER", "ADMIN", "SUPER_ADMIN"),
  AuthControllers.allOrgUsers,
);

export default router;
