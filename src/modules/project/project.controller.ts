import { Request, Response } from "express";

import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";

import { ProjectServices } from "./project.service";

const createProject = catchAsync(async (req: Request, res: Response) => {
  const result = await ProjectServices.createProjectIntoDB(
    req.user!.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Project created successfully",
    data: result,
  });
});

const getProjects = catchAsync(async (req: Request, res: Response) => {
  const result = await ProjectServices.getProjectsFromDB(req.user!);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Projects retrieved successfully",
    data: result,
  });
});

const getSingleProject = catchAsync(async (req: Request, res: Response) => {
  const result = await ProjectServices.getSingleProjectFromDB(
    req.params.id as string,
    req.user!,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Project retrieved successfully",
    data: result,
  });
});

const updateProject = catchAsync(async (req: Request, res: Response) => {
  const result = await ProjectServices.updateProjectIntoDB(
    req.params.id as string,
    req.user!,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Project updated successfully",
    data: result,
  });
});

const deleteProject = catchAsync(async (req: Request, res: Response) => {
  await ProjectServices.deleteProjectFromDB(req.params.id as string, req.user!);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Project deleted successfully",
    data: null,
  });
});

export const ProjectControllers = {
  createProject,
  getProjects,
  getSingleProject,
  updateProject,
  deleteProject,
};
