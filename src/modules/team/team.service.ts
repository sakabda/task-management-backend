import prisma from "../../prisma/prisma";
import AppError from "../../errors/AppError";

import { TJwtPayload } from "../auth/auth.interface";
import { ActivityLogServices } from "../activity-log/activityLog.service";

import { resolveMembership, assertPermission } from "../../lib/tenant-guards";

import { TCreateTeam, TUpdateTeam } from "./team.interface";

const getTeamsFromDB = async (workspaceId: string, user: TJwtPayload) => {
  await resolveMembership(workspaceId, user.id);

  return prisma.team.findMany({
    where: { workspaceId },
    include: {
      department: { select: { id: true, name: true } },
      _count: { select: { members: true } },
    },
    orderBy: { name: "asc" },
  });
};

const getSingleTeamFromDB = async (teamId: string, user: TJwtPayload) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      department: { select: { id: true, name: true } },
      members: {
        include: {
          workspaceMember: {
            select: {
              id: true,
              role: true,
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!team) {
    throw new AppError(404, "Team not found");
  }

  await resolveMembership(team.workspaceId, user.id);

  return team;
};

const createTeamIntoDB = async (
  workspaceId: string,
  user: TJwtPayload,
  payload: TCreateTeam,
) => {
  const membership = await resolveMembership(workspaceId, user.id);
  assertPermission(membership, "team.manage");

  // Optional department must belong to the same workspace.
  if (payload.departmentId) {
    const dept = await prisma.department.findUnique({
      where: { id: payload.departmentId },
      select: { id: true, workspaceId: true },
    });
    if (!dept || dept.workspaceId !== workspaceId) {
      throw new AppError(400, "Department does not belong to this workspace");
    }
  }

  const team = await prisma.team.create({
    data: {
      name: payload.name,
      description: payload.description,
      departmentId: payload.departmentId ?? null,
      workspaceId,
    },
    include: {
      department: { select: { id: true, name: true } },
    },
  });

  await ActivityLogServices.createActivityLog({
    action: "TEAM_CREATED",
    entity: "TEAM",
    entityId: team.id,
    userId: user.id,
    details: { name: team.name, workspaceId },
  });

  return team;
};

const updateTeamIntoDB = async (
  teamId: string,
  user: TJwtPayload,
  payload: TUpdateTeam,
) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true, workspaceId: true },
  });

  if (!team) {
    throw new AppError(404, "Team not found");
  }

  const membership = await resolveMembership(team.workspaceId, user.id);
  assertPermission(membership, "team.manage");

  if (payload.departmentId) {
    const dept = await prisma.department.findUnique({
      where: { id: payload.departmentId },
      select: { id: true, workspaceId: true },
    });
    if (!dept || dept.workspaceId !== team.workspaceId) {
      throw new AppError(400, "Department does not belong to this workspace");
    }
  }

  return prisma.team.update({
    where: { id: teamId },
    data: {
      name: payload.name,
      description: payload.description,
      // Allow clearing the department by sending null explicitly.
      departmentId:
        payload.departmentId === null ? null : payload.departmentId,
    },
  });
};

const deleteTeamIntoDB = async (teamId: string, user: TJwtPayload) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true, workspaceId: true, name: true },
  });

  if (!team) {
    throw new AppError(404, "Team not found");
  }

  const membership = await resolveMembership(team.workspaceId, user.id);
  assertPermission(membership, "team.manage");

  await prisma.team.delete({ where: { id: teamId } });

  await ActivityLogServices.createActivityLog({
    action: "TEAM_DELETED",
    entity: "TEAM",
    entityId: teamId,
    userId: user.id,
    details: { name: team.name, workspaceId: team.workspaceId },
  });

  return null;
};

// Add a workspace member to a team. The workspaceMember must belong to
// the same workspace as the team.
const addTeamMemberIntoDB = async (
  teamId: string,
  user: TJwtPayload,
  workspaceMemberId: string,
) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true, workspaceId: true, name: true },
  });

  if (!team) {
    throw new AppError(404, "Team not found");
  }

  const membership = await resolveMembership(team.workspaceId, user.id);
  assertPermission(membership, "team.manage");

  const targetMembership = await prisma.workspaceMember.findUnique({
    where: { id: workspaceMemberId },
    select: { id: true, workspaceId: true },
  });

  if (!targetMembership || targetMembership.workspaceId !== team.workspaceId) {
    throw new AppError(400, "Member does not belong to this workspace");
  }

  try {
    return await prisma.teamMember.create({
      data: { teamId, workspaceMemberId },
    });
  } catch (err: any) {
    // Unique constraint → already on the team.
    if (err?.code === "P2002") {
      throw new AppError(409, "User is already on this team");
    }
    throw err;
  }
};

const removeTeamMemberFromDB = async (
  teamId: string,
  teamMemberId: string,
  user: TJwtPayload,
) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { id: true, workspaceId: true },
  });

  if (!team) {
    throw new AppError(404, "Team not found");
  }

  const membership = await resolveMembership(team.workspaceId, user.id);
  assertPermission(membership, "team.manage");

  await prisma.teamMember.deleteMany({
    where: { id: teamMemberId, teamId },
  });

  return null;
};

export const TeamServices = {
  getTeamsFromDB,
  getSingleTeamFromDB,
  createTeamIntoDB,
  updateTeamIntoDB,
  deleteTeamIntoDB,
  addTeamMemberIntoDB,
  removeTeamMemberFromDB,
};
