import { Request, Response } from "express";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { AuthServices } from "./auth.service";

const registerUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.registerUserIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUser(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

const logOutUser = catchAsync(async (req: Request, res: Response) => {
  await AuthServices.logOutUser(req.user!.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User logged out successfully",
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.getMe(req.user!);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

// Re-issue the access token against a different active workspace.
// The client replaces its stored token with the returned one.
const switchWorkspace = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.switchWorkspace(
    req.user!.id,
    req.body.workspaceId,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Active workspace updated",
    data: result,
  });
});

const allUsers = catchAsync(async (req: Request, res: Response) => {
  const alreadyAssignedUsers = await AuthServices.getAlreadyAssignedUsers(
    req.params.projectId as string,
  );

  const result = await AuthServices.getAllUsers(
    req.user!,
    alreadyAssignedUsers,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All users retrieved successfully",
    data: result,
  });
});


const allOrgUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.getAllOrgUsers(
    req.params.userId as string,
    req.params.workspaceId as string,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All organization users retrieved successfully",
    data: result,
  });
});

export const AuthControllers = {
  registerUser,
  loginUser,
  getMe,
  switchWorkspace,
  allUsers,
  allOrgUsers,
};
