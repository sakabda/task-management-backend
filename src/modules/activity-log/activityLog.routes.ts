import express from "express";

import auth from "../../middlewares/auth.middleware";

import { ActivityLogControllers } from "./activityLog.controller";

const router = express.Router();

router.get("/", auth("ADMIN"), ActivityLogControllers.getAllActivityLogs);

export const ActivityLogRoutes = router;
