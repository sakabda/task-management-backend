import prisma from "../../prisma/prisma";

const createNotification = async (
  userId: string,
  title: string,
  message: string,
) => {
  return (prisma as any).notification.create({
    data: {
      userId,
      title,
      message,
    },
  });
};

const getNotificationsFromDB = async (userId: string) => {
  return (prisma as any).notification.findMany({
    where: {
      userId,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

const markAsReadIntoDB = async (notificationId: string, userId: string) => {
  return (prisma as any).notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },

    data: {
      isRead: true,
    },
  });
};

const markAllAsReadIntoDB = async (userId: string) => {
  return (prisma as any).notification.updateMany({
    where: {
      userId,
      isRead: false,
    },

    data: {
      isRead: true,
    },
  });
};

export const NotificationServices = {
  createNotification,
  getNotificationsFromDB,
  markAsReadIntoDB,
  markAllAsReadIntoDB,
};
