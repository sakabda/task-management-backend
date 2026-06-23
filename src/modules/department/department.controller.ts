import { Request, Response } from "express";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { DepartmentServices } from "./department.service";

const getDepartments = catchAsync(async (req: Request, res: Response) => {
  const result = await DepartmentServices.getDepartmentsFromDB(
    req.params.workspaceId as string,
    req.user!,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Departments retrieved successfully",
    data: result,
  });
});

const createDepartment = catchAsync(async (req: Request, res: Response) => {
  const result = await DepartmentServices.createDepartmentIntoDB(
    req.params.workspaceId as string,
    req.user!,
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Department created successfully",
    data: result,
  });
});

const updateDepartment = catchAsync(async (req: Request, res: Response) => {
  const result = await DepartmentServices.updateDepartmentIntoDB(
    req.params.id as string,
    req.user!,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Department updated successfully",
    data: result,
  });
});

const deleteDepartment = catchAsync(async (req: Request, res: Response) => {
  await DepartmentServices.deleteDepartmentIntoDB(
    req.params.id as string,
    req.user!,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Department deleted successfully",
    data: null,
  });
});

export const DepartmentControllers = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
