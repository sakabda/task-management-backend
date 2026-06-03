import AppError from "../../errors/AppError";
import prisma from "../../prisma/prisma";

import { ActivityLogServices } from "../activity-log/activityLog.service";
import { NotificationServices } from "../notification/notification.service";

const createCommentIntoDB = async (
  taskId: string,
  userId: string,
  payload: { content: string },
) => {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!task) {
    throw new AppError(404, "Task not found");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const comment = await (prisma as any).comment.create({
    data: {
      content: payload.content,
      taskId,
      userId,
    },
  });

  await ActivityLogServices.createActivityLog({
    action: "COMMENT_CREATED",
    entity: "COMMENT",
    entityId: comment.id,
    userId,
    details: {
      taskId,
      content: payload.content,
    },
  });

  const recipients = new Set<string>();

  if (task.createdById !== userId) {
    recipients.add(task.createdById);
  }

  if (task.assignedToId && task.assignedToId !== userId) {
    recipients.add(task.assignedToId);
  }

  await Promise.all(
    Array.from(recipients).map((recipientId) =>
      NotificationServices.createNotification(
        recipientId,
        "New Comment",
        `${user.name} commented on task "${task.title}"`,
      ),
    ),
  );

  return comment;
};

const getCommentsByTaskId = async (taskId: string) => {
  const comments = await (prisma as any).comment.findMany({
    where: {
      taskId,
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },

    orderBy: {
      createdAt: "asc",
    },
  });

  return comments;
};

const updateCommentIntoDB = async (
  commentId: string,
  userId: string,
  payload: {
    content?: string;
  },
) => {
  const existingComment = await (prisma as any).comment.findUnique({
    where: {
      id: commentId,
    },
  });

  if (!existingComment) {
    throw new Error("Comment not found");
  }

  if (existingComment.userId !== userId) {
    throw new Error("You can update only your own comments");
  }

  const comment = await (prisma as any).comment.update({
    where: {
      id: commentId,
    },
    data: payload,
  });

  await ActivityLogServices.createActivityLog({
    action: "COMMENT_UPDATED",
    entity: "COMMENT",
    entityId: comment.id,
    userId,
    details: {
      oldContent: existingComment.content,
      newContent: comment.content,
    },
  });

  return comment;
};

const deleteCommentFromDB = async (commentId: string, userId: string) => {
  const existingComment = await (prisma as any).comment.findUnique({
    where: {
      id: commentId,
    },
  });

  if (!existingComment) {
    throw new Error("Comment not found");
  }

  if (existingComment.userId !== userId) {
    throw new Error("You can delete only your own comments");
  }

  const comment = await (prisma as any).comment.delete({
    where: {
      id: commentId,
    },
  });

  await ActivityLogServices.createActivityLog({
    action: "COMMENT_DELETED",
    entity: "COMMENT",
    entityId: comment.id,
    userId,
    details: {
      deletedContent: comment.content,
    },
  });

  return comment;
};

export const CommentServices = {
  createCommentIntoDB,
  getCommentsByTaskId,
  updateCommentIntoDB,
  deleteCommentFromDB,
};
