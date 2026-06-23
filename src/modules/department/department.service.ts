import prisma from "../../prisma/prisma";
import AppError from "../../errors/AppError";

import { TJwtPayload } from "../auth/auth.interface";
import { ActivityLogServices } from "../activity-log/activityLog.service";

import { resolveMembership, assertPermission } from "../../lib/tenant-guards";

import { TCreateDepartment, TUpdateDepartment } from "./department.interface";

const getDepartmentsFromDB = async (workspaceId: string, user: TJwtPayload) => {
  await resolveMembership(workspaceId, user.id);

  return prisma.department.findMany({
    where: { workspaceId },
    include: { _count: { select: { teams: true } } },
    orderBy: { name: "asc" },
  });
};

const createDepartmentIntoDB = async (
  workspaceId: string,
  user: TJwtPayload,
  payload: TCreateDepartment,
) => {
  const membership = await resolveMembership(workspaceId, user.id);
  assertPermission(membership, "department.manage");

  const department = await prisma.department.create({
    data: {
      name: payload.name,
      description: payload.description,
      workspaceId,
    },
  });

  await ActivityLogServices.createActivityLog({
    action: "DEPARTMENT_CREATED",
    entity: "DEPARTMENT",
    entityId: department.id,
    userId: user.id,
    details: { name: department.name, workspaceId },
  });

  return department;
};

const updateDepartmentIntoDB = async (
  departmentId: string,
  user: TJwtPayload,
  payload: TUpdateDepartment,
) => {
  const existing = await prisma.department.findUnique({
    where: { id: departmentId },
    select: { id: true, workspaceId: true },
  });

  if (!existing) {
    throw new AppError(404, "Department not found");
  }

  const membership = await resolveMembership(existing.workspaceId, user.id);
  assertPermission(membership, "department.manage");

  return prisma.department.update({
    where: { id: departmentId },
    data: payload,
  });
};

const deleteDepartmentIntoDB = async (
  departmentId: string,
  user: TJwtPayload,
) => {
  const existing = await prisma.department.findUnique({
    where: { id: departmentId },
    select: { id: true, workspaceId: true, name: true },
  });

  if (!existing) {
    throw new AppError(404, "Department not found");
  }

  const membership = await resolveMembership(existing.workspaceId, user.id);
  assertPermission(membership, "department.manage");

  // Teams in this department get departmentId set to NULL (SetNull in schema).
  await prisma.department.delete({ where: { id: departmentId } });

  await ActivityLogServices.createActivityLog({
    action: "DEPARTMENT_DELETED",
    entity: "DEPARTMENT",
    entityId: departmentId,
    userId: user.id,
    details: { name: existing.name, workspaceId: existing.workspaceId },
  });

  return null;
};

export const DepartmentServices = {
  getDepartmentsFromDB,
  createDepartmentIntoDB,
  updateDepartmentIntoDB,
  deleteDepartmentIntoDB,
};
