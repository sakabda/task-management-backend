import prisma from "../../prisma/prisma";

const createActivityLog = async ({
  action,
  entity,
  entityId,
  userId,
  details,
}: any) => {
  return (prisma as any).activityLog.create({
    data: {
      action,
      entity,
      entityId,
      userId,
      details,
    },
  });
};

const getAllActivityLogs = async () => {
  return (prisma as any).activityLog.findMany({
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
      createdAt: "desc",
    },
  });
};

export const ActivityLogServices = {
  createActivityLog,
  getAllActivityLogs,
};
