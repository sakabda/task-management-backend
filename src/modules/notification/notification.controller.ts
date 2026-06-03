import { Request, Response } from "express";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { NotificationServices } from "./notification.service";

const getNotifications = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationServices.getNotificationsFromDB(
    req.user!.id,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notifications retrieved successfully",
    data: result,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  await NotificationServices.markAsReadIntoDB(
    req.params.id as string,
    req.user!.id,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification marked as read",
    data: null,
  });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  await NotificationServices.markAllAsReadIntoDB(req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All notifications marked as read",
    data: null,
  });
});

export const NotificationControllers = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
