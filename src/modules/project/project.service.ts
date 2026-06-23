import { TJwtPayload } from "../auth/auth.interface";
import prisma from "../../prisma/prisma";

import { ActivityLogServices } from "../activity-log/activityLog.service";

import { TCreateProject, TUpdateProject } from "./project.interface";
import AppError from "../../errors/AppError";

const createProjectIntoDB = async (userId: string, payload: TCreateProject) => {
  const project = await (prisma as any).project.create({
    data: {
      name: payload.name,
      description: payload.description,
      createdById: userId,
    },
  });

  await ActivityLogServices.createActivityLog({
    action: "PROJECT_CREATED",
    entity: "PROJECT",
    entityId: project.id,
    userId,
    details: {
      projectName: project.name,
    },
  });

  return project;
};

const getProjectsFromDB = async (user: any) => {
  const whereCondition =
    user.role === "ADMIN" ?
      {}
    : {
        OR: [
          {
            createdById: user.id,
          },
          {
            members: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
      };

  return (prisma as any).project.findMany({
    where: whereCondition,

    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      _count: {
        select: {
          tasks: true,
          members: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

const getSingleProjectFromDB = async (projectId: string, user: any) => {
  const project = await (prisma as any).project.findUnique({
    where: {
      id: projectId,
    },

    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      tasks: true,

      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },

      _count: {
        select: {
          tasks: true,
          members: true,
        },
      },
    },
  });

  if (!project) {
    throw new AppError(404, "Project not found");
  }

  if (user.role !== "ADMIN") {
    const isMember = await (prisma as any).projectMember.findFirst({
      where: {
        projectId,
        userId: user.id,
      },
    });

    const isOwner = project.createdById === user.id;

    if (!isOwner && !isMember) {
      throw new AppError(403, "Forbidden access");
    }
  }

  return project;
};

const updateProjectIntoDB = async (
  projectId: string,
  user: TJwtPayload,
  payload: TUpdateProject,
) => {
  const existingProject = await (prisma as any).project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!existingProject) {
    throw new Error("Project not found");
  }

  if (user.role !== "ADMIN" && existingProject.createdById !== user.id) {
    throw new Error("Forbidden access");
  }

  const project = await (prisma as any).project.update({
    where: {
      id: projectId,
    },
    data: payload,
  });

  await ActivityLogServices.createActivityLog({
    action: "PROJECT_UPDATED",
    entity: "PROJECT",
    entityId: project.id,
    userId: user.id,
    details: payload,
  });

  return project;
};

const deleteProjectFromDB = async (projectId: string, user: TJwtPayload) => {
  const existingProject = await (prisma as any).project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!existingProject) {
    throw new Error("Project not found");
  }

  if (user.role !== "ADMIN" && existingProject.createdById !== user.id) {
    throw new Error("Forbidden access");
  }

  const project = await (prisma as any).project.delete({
    where: {
      id: projectId,
    },
  });

  await ActivityLogServices.createActivityLog({
    action: "PROJECT_DELETED",
    entity: "PROJECT",
    entityId: project.id,
    userId: user.id,
    details: {
      projectName: project.name,
    },
  });

  return null;
};

export const ProjectServices = {
  createProjectIntoDB,
  getProjectsFromDB,
  getSingleProjectFromDB,
  updateProjectIntoDB,
  deleteProjectFromDB,
};
