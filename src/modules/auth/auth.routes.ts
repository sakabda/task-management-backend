import { Router } from "express";

import { AuthControllers } from "./auth.controller";
import auth from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validate.middleware";
import {
  loginValidationSchema,
  registerValidationSchema,
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
router.get("/me", auth("USER", "ADMIN"), AuthControllers.getMe);

export default router;
