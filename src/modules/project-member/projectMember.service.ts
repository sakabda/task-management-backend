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

const removeProjectMember = async (memberId: string) => {
  return (prisma as any).projectMember.delete({
    where: {
      id: memberId,
    },
  });
};

export const ProjectMemberServices = {
  addMemberIntoProject,
  getProjectMembers,
  removeProjectMember,
};
