import { Request, Response } from "express";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { WorkspaceMemberServices } from "./workspaceMember.service";

const getMembers = catchAsync(async (req: Request, res: Response) => {
  const result = await WorkspaceMemberServices.getMembersFromDB(
    req.params.workspaceId as string,
    req.user!,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Workspace members retrieved successfully",
    data: result,
  });
});

const addMember = catchAsync(async (req: Request, res: Response) => {
  const result = await WorkspaceMemberServices.addMemberIntoDB(
    req.params.workspaceId as string,
    req.user!,
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Member added successfully",
    data: result,
  });
});

const updateMemberRole = catchAsync(async (req: Request, res: Response) => {
  const result = await WorkspaceMemberServices.updateMemberRoleIntoDB(
    req.params.workspaceId as string,
    req.params.memberId as string,
    req.user!,
    req.body.role,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Member role updated successfully",
    data: result,
  });
});

const removeMember = catchAsync(async (req: Request, res: Response) => {
  await WorkspaceMemberServices.removeMemberFromDB(
    req.params.workspaceId as string,
    req.params.memberId as string,
    req.user!,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Member removed successfully",
    data: null,
  });
});

export const WorkspaceMemberControllers = {
  getMembers,
  addMember,
  updateMemberRole,
  removeMember,
};
