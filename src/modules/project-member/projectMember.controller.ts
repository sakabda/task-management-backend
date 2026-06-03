import { Request, Response } from "express";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { ProjectMemberServices } from "./projectMember.service";
import { TAddMember } from "./projectMember.interface";

const addMember = catchAsync(async (req: Request, res: Response) => {
  const result = await ProjectMemberServices.addMemberIntoProject(
    req.params.projectId as string,
    req.body as TAddMember,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Member added successfully",
    data: result,
  });
});

const getMembers = catchAsync(async (req: Request, res: Response) => {
  const result = await ProjectMemberServices.getProjectMembers(
    req.params.projectId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Members retrieved successfully",
    data: result,
  });
});

const removeMember = catchAsync(async (req: Request, res: Response) => {
  await ProjectMemberServices.removeProjectMember(
    req.params.memberId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Member removed successfully",
    data: null,
  });
});

export const ProjectMemberControllers = {
  addMember,
  getMembers,
  removeMember,
};
