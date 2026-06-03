import prisma from "../../prisma/prisma";

const getDashboardStatsFromDB = async (user: any) => {
  const taskFilter =
    user.role === "ADMIN" ?
      {}
    : {
        OR: [{ createdById: user.id }, { assignedToId: user.id }],
      };

  const projectFilter =
    user.role === "ADMIN" ?
      {}
    : {
        OR: [
          { createdById: user.id },
          {
            members: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
      };

  const [
    totalUsers,
    totalProjects,
    totalTasks,

    todoTasks,
    inProgressTasks,
    doneTasks,

    lowPriorityTasks,
    mediumPriorityTasks,
    highPriorityTasks,

    recentActivities,
    recentNotifications,
    latestProjects,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.project.count({
      where: projectFilter,
    }),

    prisma.task.count({
      where: taskFilter,
    }),

    prisma.task.count({
      where: {
        ...taskFilter,
        status: "TODO",
      },
    }),

    prisma.task.count({
      where: {
        ...taskFilter,
        status: "IN_PROGRESS",
      },
    }),

    prisma.task.count({
      where: {
        ...taskFilter,
        status: "DONE",
      },
    }),

    prisma.task.count({
      where: {
        ...taskFilter,
        priority: "LOW",
      },
    }),

    prisma.task.count({
      where: {
        ...taskFilter,
        priority: "MEDIUM",
      },
    }),

    prisma.task.count({
      where: {
        ...taskFilter,
        priority: "HIGH",
      },
    }),

    prisma.activityLog.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
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
    }),

    prisma.notification.findMany({
      where:
        user.role === "ADMIN" ?
          {}
        : {
            userId: user.id,
          },

      take: 10,

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.project.findMany({
      where: projectFilter,

      take: 5,

      orderBy: {
        createdAt: "desc",
      },

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
    }),
  ]);

  return {
    overview: {
      totalUsers: user.role === "ADMIN" ? totalUsers : undefined,

      totalProjects,
      totalTasks,
    },

    tasksByStatus: {
      todo: todoTasks,
      inProgress: inProgressTasks,
      done: doneTasks,
    },

    tasksByPriority: {
      low: lowPriorityTasks,
      medium: mediumPriorityTasks,
      high: highPriorityTasks,
    },

    recentActivities,

    recentNotifications,

    latestProjects,
  };
};

export const DashboardServices = {
  getDashboardStatsFromDB,
};
