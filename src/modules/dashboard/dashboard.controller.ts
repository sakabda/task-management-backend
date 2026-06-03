import { Request, Response } from "express";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { DashboardServices } from "./dashboard.service";

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const result = await DashboardServices.getDashboardStatsFromDB(req.user);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dashboard statistics retrieved successfully",
    data: result,
  });
});

export const DashboardControllers = {
  getDashboardStats,
};
