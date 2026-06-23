import { Request, Response } from "express";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { TeamServices } from "./team.service";

const getTeams = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamServices.getTeamsFromDB(
    req.params.workspaceId as string,
    req.user!,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Teams retrieved successfully",
    data: result,
  });
});

const getSingleTeam = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamServices.getSingleTeamFromDB(
    req.params.id as string,
    req.user!,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Team retrieved successfully",
    data: result,
  });
});

const createTeam = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamServices.createTeamIntoDB(
    req.params.workspaceId as string,
    req.user!,
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Team created successfully",
    data: result,
  });
});

const updateTeam = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamServices.updateTeamIntoDB(
    req.params.id as string,
    req.user!,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Team updated successfully",
    data: result,
  });
});

const deleteTeam = catchAsync(async (req: Request, res: Response) => {
  await TeamServices.deleteTeamIntoDB(req.params.id as string, req.user!);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Team deleted successfully",
    data: null,
  });
});

const addTeamMember = catchAsync(async (req: Request, res: Response) => {
  const result = await TeamServices.addTeamMemberIntoDB(
    req.params.id as string,
    req.user!,
    req.body.workspaceMemberId,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Member added to team",
    data: result,
  });
});

const removeTeamMember = catchAsync(async (req: Request, res: Response) => {
  await TeamServices.removeTeamMemberFromDB(
    req.params.id as string,
    req.params.memberId as string,
    req.user!,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Member removed from team",
    data: null,
  });
});

export const TeamControllers = {
  getTeams,
  getSingleTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
};
