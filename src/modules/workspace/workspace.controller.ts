import { Request, Response } from "express";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { WorkspaceServices } from "./workspace.service";

const createWorkspace = catchAsync(async (req: Request, res: Response) => {
  const result = await WorkspaceServices.createWorkspaceIntoDB(
    req.user!,
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Workspace created successfully",
    data: result,
  });
});

const getWorkspaces = catchAsync(async (req: Request, res: Response) => {
  const result = await WorkspaceServices.getWorkspacesFromDB(req.user!);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Workspaces retrieved successfully",
    data: result,
  });
});

const getSingleWorkspace = catchAsync(async (req: Request, res: Response) => {
  const result = await WorkspaceServices.getSingleWorkspaceFromDB(
    req.params.id as string,
    req.user!,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Workspace retrieved successfully",
    data: result,
  });
});

const updateWorkspace = catchAsync(async (req: Request, res: Response) => {
  const result = await WorkspaceServices.updateWorkspaceIntoDB(
    req.params.id as string,
    req.user!,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Workspace updated successfully",
    data: result,
  });
});

const deleteWorkspace = catchAsync(async (req: Request, res: Response) => {
  await WorkspaceServices.deleteWorkspaceIntoDB(
    req.params.id as string,
    req.user!,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Workspace deleted successfully",
    data: null,
  });
});

export const WorkspaceControllers = {
  createWorkspace,
  getWorkspaces,
  getSingleWorkspace,
  updateWorkspace,
  deleteWorkspace,
};
