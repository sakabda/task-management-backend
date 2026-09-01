import { Request, Response } from "express";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { OrganizationServices } from "./organization.service";

const createOrganization = catchAsync(async (req: Request, res: Response) => {
  const result = await OrganizationServices.createOrganizationIntoDB(
    req.user!,
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Organization created successfully",
    data: result,
  });
});

const getOrganizations = catchAsync(async (req: Request, res: Response) => {
  const result = await OrganizationServices.getOrganizationsFromDB(req.user!);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Organizations retrieved successfully",
    data: result,
  });
});

const getSingleOrganization = catchAsync(
  async (req: Request, res: Response) => {
    const result = await OrganizationServices.getSingleOrganizationFromDB(
      req.params.id as string,
      req.user!,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Organization retrieved successfully",
      data: result,
    });
  },
);

const updateOrganization = catchAsync(async (req: Request, res: Response) => {

  console.log("req.params.id", req.params.id);
  console.log("req.body", req.body);
  const result = await OrganizationServices.updateOrganizationIntoDB(
    req.params.id as string,
    req.user!,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Organization updated successfully",
    data: result,
  });
});

const deleteOrganization = catchAsync(async (req: Request, res: Response) => {
  await OrganizationServices.deleteOrganizationIntoDB(
    req.params.id as string,
    req.user!,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Organization deleted successfully",
    data: null,
  });
});

export const OrganizationControllers = {
  createOrganization,
  getOrganizations,
  getSingleOrganization,
  updateOrganization,
  deleteOrganization,
};
