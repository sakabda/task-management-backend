import AppError from "../../errors/AppError";
import { resolveMembership } from "../../lib/tenant-guards";
import prisma from "../../prisma/prisma";

const addMemberIntoProject = async (
  projectId: string,
  payload: {
    userId: string;
    role?: string;
  },
) => {
  const project = await (prisma as any).project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const existingMember = await (prisma as any).projectMember.findFirst({
    where: {
      projectId,
      userId: payload.userId,
    },
  });

  if (existingMember) {
    throw new Error("User already a member");
  }

  return prisma.projectMember.create({
    data: {
      projectId,
      userId: payload.userId,
      role: payload.role || "MEMBER",
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
  });
};

const getProjectMembers = async (projectId: string) => {
  return (prisma as any).projectMember.findMany({
    where: {
      projectId,
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
  });
};

const getAvailableMembersForProject = async (projectId: string, user: any) => {
  // 1. Find project
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      id: true,
      workspaceId: true,
    },
  });

  if (!project) {
    throw new AppError(404, "Project not found");
  }

  if (!project.workspaceId) {
    throw new AppError(400, "Project is not associated with a workspace");
  }

  // 2. Ensure current user belongs to this workspace
  await resolveMembership(project.workspaceId, user.id);

  // 3. Get existing project members
  const projectMembers = await prisma.projectMember.findMany({
    where: {
      projectId,
    },
    select: {
      userId: true,
    },
  });

  const existingUserIds = projectMembers.map((member) => member.userId);

  // 4. Return workspace members not already in the project
  return prisma.workspaceMember.findMany({
    where: {
      workspaceId: project.workspaceId,

      userId: {
        notIn: existingUserIds,
      },

      user: {
        role: {
          not: "ADMIN",
        },
      },
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },

      teams: {
        include: {
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },

    orderBy: {
      joinedAt: "asc",
    },
  });
};

const removeProjectMember = async (memberId: string) => {
  return (prisma as any).projectMember.delete({
    where: {
      id: memberId,
    },
  });
};

const getAvailableMembersForAssignment = async (
  projectId: string,
  user: any,
  workspaceId: string,
) => {
  // 1. Find project
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      id: true,
      workspaceId: true,
    },
  });

  if (!project) {
    throw new AppError(404, "Project not found");
  }

  if (!project.workspaceId) {
    throw new AppError(400, "Project is not associated with a workspace");
  }

  // 2. Ensure current user belongs to this workspace
  await resolveMembership(workspaceId, user.id);

  // 3. Get users already assigned to tasks in this project
  const assignedTasks = await prisma.task.findMany({
    where: {
      projectId,
      assignedToId: {
        not: null,
      },
    },
    select: {
      assignedToId: true,
    },
  });

  const assignedUserIds = assignedTasks
    .map((task) => task.assignedToId)
    .filter((id): id is string => id !== null);

  // 4. Return project members who are not assigned
  return prisma.projectMember.findMany({
    where: {
      projectId,
      userId: {
        notIn: assignedUserIds,
      },
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },

    orderBy: {
      createdAt: "asc",
    },
  });
};

export const ProjectMemberServices = {
  addMemberIntoProject,
  getProjectMembers,
  getAvailableMembersForProject,
  removeProjectMember,
  getAvailableMembersForAssignment,
};
