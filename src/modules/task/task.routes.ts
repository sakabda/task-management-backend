import { Router } from "express";
import auth from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validate.middleware";
import { TaskControllers } from "./task.controller";
import {
  assignTaskValidationSchema,
  createTaskValidationSchema,
  updateTaskPriorityValidationSchema,
  updateTaskStatusValidationSchema,
  updateTaskValidationSchema,
} from "./task.validation";

const router = Router();

router.post(
  "/",
  auth("USER", "ADMIN"),
  validateRequest(createTaskValidationSchema),
  TaskControllers.createTask,
);

router.get(
  "/my-assigned",
  auth("USER", "ADMIN"),
  TaskControllers.getMyAssignedTasks,
);

router.get("/board", auth("USER", "ADMIN"), TaskControllers.getTaskBoard);

router.get("/overdue", auth("USER", "ADMIN"), TaskControllers.getOverdueTasks);

router.get(
  "/upcoming",
  auth("USER", "ADMIN"),
  TaskControllers.getUpcomingTasks,
);

router.get("/", auth("USER", "ADMIN"), TaskControllers.getTasks);

router.get("/:id", auth("USER", "ADMIN"), TaskControllers.getSingleTask);

router.patch(
  "/:id",
  auth("USER", "ADMIN"),
  validateRequest(updateTaskValidationSchema),
  TaskControllers.updateTask,
);

router.patch(
  "/:id/assign",
  auth("USER", "ADMIN"),
  validateRequest(assignTaskValidationSchema),
  TaskControllers.assignTask,
);

router.patch(
  "/:id/status",
  auth("USER", "ADMIN"),
  validateRequest(updateTaskStatusValidationSchema),
  TaskControllers.updateTaskStatus,
);
router.patch(
  "/:id/priority",
  auth("USER", "ADMIN"),
  validateRequest(updateTaskPriorityValidationSchema),
  TaskControllers.updateTaskPriority,
);

router.delete("/:id", auth("USER", "ADMIN"), TaskControllers.deleteTask);

export default router;
