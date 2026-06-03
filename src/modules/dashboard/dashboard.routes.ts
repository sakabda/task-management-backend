import { Router } from "express";
import auth from "../../middlewares/auth.middleware";
import { DashboardControllers } from "./dashboard.controller";

const router = Router();

router.get(
  "/stats",
  auth("USER", "ADMIN"),
  DashboardControllers.getDashboardStats,
);

export const DashboardRoutes = router;
