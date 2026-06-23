import prisma from "../../prisma/prisma";
import AppError from "../../errors/AppError";

import { TJwtPayload } from "../auth/auth.interface";
import { ActivityLogServices } from "../activity-log/activityLog.service";

import { TCreateOrganization, TUpdateOrganization } from "./organization.interface";

// Derive a unique slug when the caller doesn't supply one.
const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);

const ensureUniqueSlug = async (base: string): Promise<string> => {
  let candidate = base || "org";
  let n = 1;
  // Bound the loop — if we collide 50 times something is very wrong.
  while (n < 50) {
    const exists = await prisma.organization.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
    candidate = `${base}-${++n}`;
  }
  return `${base}-${Date.now().toString(36)}`;
};

const createOrganizationIntoDB = async (
  user: TJwtPayload,
  payload: TCreateOrganization,
) => {
  const baseSlug = payload.slug || slugify(payload.name);
  const slug = await ensureUniqueSlug(baseSlug);

  const organization = await prisma.organization.create({
    data: {
      name: payload.name,
      slug,
      description: payload.description,
      logoUrl: payload.logoUrl,
      ownerId: user.id,
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
    },
  });

  await ActivityLogServices.createActivityLog({
    action: "ORGANIZATION_CREATED",
    entity: "ORGANIZATION",
    entityId: organization.id,
    userId: user.id,
    details: { name: organization.name, slug: organization.slug },
  });

  return organization;
};

// Orgs the user can see: ones they own, or ones containing a workspace
// they're a member of.
const getOrganizationsFromDB = async (user: TJwtPayload) => {
  const [owned, viaMembership] = await Promise.all([
    prisma.organization.findMany({
      where: { ownerId: user.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { workspaces: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.organization.findMany({
      where: {
        workspaces: {
          some: { members: { some: { userId: user.id } } },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { workspaces: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // De-dupe (an owner who is also a member of their own workspace).
  const seen = new Set<string>();
  return [...owned, ...viaMembership].filter((org) => {
    if (seen.has(org.id)) return false;
    seen.add(org.id);
    return true;
  });
};

const getSingleOrganizationFromDB = async (
  organizationId: string,
  user: TJwtPayload,
) => {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      workspaces: {
        select: { id: true, name: true, slug: true },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { workspaces: true } },
    },
  });

  if (!organization) {
    throw new AppError(404, "Organization not found");
  }

  const isOwner = organization.ownerId === user.id;
  const isMember = await prisma.workspaceMember.findFirst({
    where: { workspace: { organizationId }, userId: user.id },
    select: { id: true },
  });

  if (!isOwner && !isMember && user.role !== "ADMIN") {
    throw new AppError(403, "You do not have access to this organization");
  }

  return organization;
};

const updateOrganizationIntoDB = async (
  organizationId: string,
  user: TJwtPayload,
  payload: TUpdateOrganization,
) => {
  const existing = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, ownerId: true, slug: true },
  });

  if (!existing) {
    throw new AppError(404, "Organization not found");
  }

  if (existing.ownerId !== user.id && user.role !== "ADMIN") {
    throw new AppError(403, "Only the organization owner can update it");
  }

  // Keep slugs unique if it's changing.
  if (payload.slug && payload.slug !== existing.slug) {
    const clash = await prisma.organization.findUnique({
      where: { slug: payload.slug },
      select: { id: true },
    });
    if (clash) {
      throw new AppError(409, "Slug is already taken");
    }
  }

  const organization = await prisma.organization.update({
    where: { id: organizationId },
    data: payload,
    include: {
      owner: { select: { id: true, name: true, email: true } },
    },
  });

  await ActivityLogServices.createActivityLog({
    action: "ORGANIZATION_UPDATED",
    entity: "ORGANIZATION",
    entityId: organization.id,
    userId: user.id,
    details: payload,
  });

  return organization;
};

const deleteOrganizationIntoDB = async (
  organizationId: string,
  user: TJwtPayload,
) => {
  const existing = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, ownerId: true, name: true },
  });

  if (!existing) {
    throw new AppError(404, "Organization not found");
  }

  if (existing.ownerId !== user.id && user.role !== "ADMIN") {
    throw new AppError(403, "Only the organization owner can delete it");
  }

  // Cascade-delete will remove workspaces, departments, teams, memberships.
  await prisma.organization.delete({ where: { id: organizationId } });

  await ActivityLogServices.createActivityLog({
    action: "ORGANIZATION_DELETED",
    entity: "ORGANIZATION",
    entityId: organizationId,
    userId: user.id,
    details: { name: existing.name },
  });

  return null;
};

export const OrganizationServices = {
  createOrganizationIntoDB,
  getOrganizationsFromDB,
  getSingleOrganizationFromDB,
  updateOrganizationIntoDB,
  deleteOrganizationIntoDB,
};
