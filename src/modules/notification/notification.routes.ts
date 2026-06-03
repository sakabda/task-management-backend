import { Router } from "express";

import auth from "../../middlewares/auth.middleware";

import { NotificationControllers } from "./notification.controller";

const router = Router();

router.get(
  "/",
  auth("USER", "ADMIN"),
  NotificationControllers.getNotifications,
);

router.patch(
  "/:id/read",
  auth("USER", "ADMIN"),
  NotificationControllers.markAsRead,
);

router.patch(
  "/read-all",
  auth("USER", "ADMIN"),
  NotificationControllers.markAllAsRead,
);

export const NotificationRoutes = router;
