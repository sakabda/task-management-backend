import { Request, Response } from "express";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { ActivityLogServices } from "./activityLog.service";

const getAllActivityLogs = catchAsync(async (req: Request, res: Response) => {
  const result = await ActivityLogServices.getAllActivityLogs();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Activity logs retrieved successfully",
    data: result,
  });
});

export const ActivityLogControllers = {
  getAllActivityLogs,
};
