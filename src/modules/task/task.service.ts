import prisma from "../../prisma/prisma";
import AppError from "../../errors/AppError";

import { TCreateTask, TTaskQuery, TUpdateTask } from "./task.interface";
import { TJwtPayload } from "../auth/auth.interface";

import { ActivityLogServices } from "../activity-log/activityLog.service";
import { NotificationServices } from "../notification/notification.service";

const createTaskIntoDB = async (user: TJwtPayload, payload: TCreateTask) => {
  if (payload.projectId) {
    const project = await (prisma as any).project.findUnique({
      where: {
        id: payload.projectId,
      },
    });

    if (!project) {
      throw new AppError(404, "Project not found");
    }

    if (user.role !== "ADMIN") {
      const isOwner = project.createdById === user.id;

      const isMember = await (prisma as any).projectMember.findFirst({
        where: {
          projectId: payload.projectId,
          userId: user.id,
        },
      });

      if (!isOwner && !isMember) {
        throw new AppError(403, "You are not a project member");
      }
    }
  }

  const result = await (prisma as any).task.create({
    data: {
      title: payload.title,
      description: payload.description,
      priority: payload.priority,
      projectId: payload.projectId,
      createdById: user.id,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
    },
  });

  await ActivityLogServices.createActivityLog({
    action: "CREATE",
    entity: "TASK",
    entityId: result.id,
    userId: user.id,
    details: {
      taskTitle: result.title,
      taskPriority: result.priority,
      taskStatus: result.status,
    },
  });

  return result;
};

const getTasksFromDB = async (user: TJwtPayload, query: TTaskQuery) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    priority,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const whereConditions: any = {};

  if (user.role !== "ADMIN") {
    whereConditions.createdById = user.id;
  }

  if (status) {
    whereConditions.status = status;
  }

  if (priority) {
    whereConditions.priority = priority;
  }

  if (search) {
    whereConditions.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  const tasks = await (prisma as any).task.findMany({
    where: whereConditions,

    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },

    skip,
    take: Number(limit),

    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await (prisma as any).task.count({
    where: whereConditions,
  });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      totalItems: total,
      totalPages: Math.ceil(total / Number(limit)),
      hasNextPage: Number(page) < Math.ceil(total / Number(limit)),
      hasPreviousPage: Number(page) > 1,
    },

    data: tasks,
  };
};

const getSingleTaskFromDB = async (taskId: string, user: TJwtPayload) => {
  const task = await (prisma as any).task.findUnique({
    where: {
      id: taskId,
    },

    include: {
      createdBy: true,
      assignedTo: true,
      comments: true,
      project: true,
    },
  });

  if (!task) {
    throw new AppError(404, "Task not found");
  }

  if (user.role !== "ADMIN" && task.createdById !== user.id) {
    throw new AppError(403, "Forbidden access");
  }

  return task;
};

const updateTaskIntoDB = async (
  taskId: string,
  userId: string,
  payload: TUpdateTask,
) => {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!task) {
    throw new AppError(404, "Task not found");
  }

  if (task.createdById !== userId) {
    throw new AppError(403, "Forbidden access");
  }

  const result = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      ...payload,

      dueDate:
        payload.dueDate !== undefined ? new Date(payload.dueDate) : undefined,
    },
  });

  await ActivityLogServices.createActivityLog({
    action: "UPDATE",
    entity: "TASK",
    entityId: result.id,
    userId,
    details: {
      ...payload,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
    },
  });

  return result;
};

const deleteTaskFromDB = async (taskId: string, userId: string) => {
  const task = await (prisma as any).task.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!task) {
    throw new AppError(404, "Task not found");
  }

  if (task.createdById !== userId) {
    throw new AppError(403, "Forbidden access");
  }

  await (prisma as any).task.delete({
    where: {
      id: taskId,
    },
  });

  await ActivityLogServices.createActivityLog({
    action: "DELETE",
    entity: "TASK",
    entityId: taskId,
    userId,
    details: {
      taskTitle: task.title,
      taskPriority: task.priority,
      taskStatus: task.status,
    },
  });

  return null;
};

const assignTaskIntoDB = async (
  taskId: string,
  assignedToId: string,
  currentUser: TJwtPayload,
) => {
  const task = await (prisma as any).task.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!task) {
    throw new AppError(404, "Task not found");
  }

  const assignee = await prisma.user.findUnique({
    where: {
      id: assignedToId,
    },
  });

  if (!assignee) {
    throw new AppError(404, "User not found");
  }

  const result = await (prisma as any).task.update({
    where: {
      id: taskId,
    },
    data: {
      assignedToId,
    },
  });

  await ActivityLogServices.createActivityLog({
    action: "TASK_ASSIGNED",
    entity: "TASK",
    entityId: taskId,
    userId: currentUser.id,
    details: {
      assignedTo: assignee.email,
    },
  });

  await NotificationServices.createNotification(
    assignedToId,
    "Task Assigned",
    `You have been assigned task: ${task.title}`,
  );

  return result;
};

const getMyAssignedTasksFromDB = async (userId: string) => {
  return (prisma as any).task.findMany({
    where: {
      assignedToId: userId,
    },

    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      project: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

const getTaskBoardFromDB = async (user: TJwtPayload) => {
  const whereCondition: any = {};

  if (user.role !== "ADMIN") {
    whereCondition.OR = [{ createdById: user.id }, { assignedToId: user.id }];
  }

  const tasks = await prisma.task.findMany({
    where: whereCondition,

    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    todo: tasks.filter((t) => t.status === "TODO"),
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS"),
    done: tasks.filter((t) => t.status === "DONE"),
  };
};

const getOverdueTasksFromDB = async (user: TJwtPayload) => {
  const whereCondition: any = {
    dueDate: {
      lt: new Date(),
    },

    status: {
      not: "DONE",
    },
  };

  if (user.role !== "ADMIN") {
    whereCondition.OR = [
      {
        createdById: user.id,
      },
      {
        assignedToId: user.id,
      },
    ];
  }

  return prisma.task.findMany({
    where: whereCondition,

    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      project: true,
    },

    // orderBy: {
    //   dueDate?: "asc",
    // },
  });
};

const getUpcomingTasksFromDB = async (user: TJwtPayload) => {
  const today = new Date();

  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  const whereCondition: any = {
    dueDate: {
      gte: today,
      lte: nextWeek,
    },
  };

  if (user.role !== "ADMIN") {
    whereCondition.OR = [
      {
        createdById: user.id,
      },
      {
        assignedToId: user.id,
      },
    ];
  }

  return prisma.task.findMany({
    where: whereCondition,

    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      project: true,
    },

    // orderBy: {
    //   dueDate: "asc",
    // },
  });
};

const updateTaskStatusIntoDB = async (
  taskId: string,
  status: "TODO" | "IN_PROGRESS" | "DONE",
  userId: string,
) => {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!task) {
    throw new AppError(404, "Task not found");
  }

  const result = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      status,
    },
  });

  await ActivityLogServices.createActivityLog({
    action: "TASK_STATUS_CHANGED",
    entity: "TASK",
    entityId: result.id,
    userId,
    details: {
      previousStatus: task.status,
      newStatus: status,
    },
  });

  return result;
};

export const TaskServices = {
  createTaskIntoDB,
  getTasksFromDB,
  getSingleTaskFromDB,
  updateTaskIntoDB,
  deleteTaskFromDB,
  assignTaskIntoDB,
  getMyAssignedTasksFromDB,
  getTaskBoardFromDB,
  getOverdueTasksFromDB,
  getUpcomingTasksFromDB,
  updateTaskStatusIntoDB,
};
