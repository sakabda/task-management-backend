import { Request, Response } from "express";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { InvitationServices } from "./invitation.service";

const createInvitation = catchAsync(async (req: Request, res: Response) => {
  const result = await InvitationServices.createInvitationIntoDB(
    req.user!,
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Invitation sent successfully",
    data: result,
  });
});

const getInvitations = catchAsync(async (req: Request, res: Response) => {
  const result = await InvitationServices.getInvitationsFromDB(req.user!);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Invitations retrieved successfully",
    data: result,
  });
});

const acceptInvitation = catchAsync(async (req: Request, res: Response) => {
  const result = await InvitationServices.acceptInvitationIntoDB(
    req.params.token as string,
    req.user!,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Invitation accepted successfully",
    data: result,
  });
});

const revokeInvitation = catchAsync(async (req: Request, res: Response) => {
  const result = await InvitationServices.revokeInvitationIntoDB(
    req.params.token as string,
    req.user!,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Invitation revoked successfully",
    data: result,
  });
});

export const InvitationControllers = {
  createInvitation,
  getInvitations,
  acceptInvitation,
  revokeInvitation,
};
