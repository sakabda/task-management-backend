import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TaskServices } from "./task.service";

const createTask = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskServices.createTaskIntoDB(req.user!, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Task created successfully",
    data: result,
  });
});

const getTasks = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskServices.getTasksFromDB(req.user!, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tasks retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleTask = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskServices.getSingleTaskFromDB(
    req.params.id as string,
    req.user!,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Task retrieved successfully",
    data: result,
  });
});

const updateTask = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskServices.updateTaskIntoDB(
    req.params.id as string,
    req.user!.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Task updated successfully",
    data: result,
  });
});

const deleteTask = catchAsync(async (req: Request, res: Response) => {
  await TaskServices.deleteTaskFromDB(req.params.id as string, req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Task deleted successfully",
    data: null,
  });
});

const assignTask = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskServices.assignTaskIntoDB(
    req.params.id as string,
    req.body.assignedToId,
    req.user!,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Task assigned successfully",
    data: result,
  });
});

const getMyAssignedTasks = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskServices.getMyAssignedTasksFromDB(req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Assigned tasks retrieved successfully",
    data: result,
  });
});

const getTaskBoard = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskServices.getTaskBoardFromDB(req.user!);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Task board retrieved successfully",
    data: result,
  });
});
const getOverdueTasks = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskServices.getOverdueTasksFromDB(req.user!);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Overdue tasks retrieved successfully",
    data: result,
  });
});

const getUpcomingTasks = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskServices.getUpcomingTasksFromDB(req.user!);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Upcoming tasks retrieved successfully",
    data: result,
  });
});

const updateTaskStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskServices.updateTaskStatusIntoDB(
    req.params.id as string,
    req.body.status,
    req.user!.id,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Task status updated successfully",
    data: result,
  });
});

const updateTaskPriority = catchAsync(async (req: Request, res: Response) => {
  const result = await TaskServices.updateTaskPriorityIntoDB(
    req.params.id as string,
    req.body.priority,
    req.user!.id,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Task priority updated successfully",
    data: result,
  });
});

export const TaskControllers = {
  createTask,
  getTasks,
  getSingleTask,
  updateTask,
  deleteTask,
  assignTask,
  getMyAssignedTasks,
  getTaskBoard,
  getOverdueTasks,
  getUpcomingTasks,
  updateTaskStatus,
  updateTaskPriority,
};
