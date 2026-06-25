import crypto from "crypto";

import prisma from "../../prisma/prisma";
import AppError from "../../errors/AppError";
import config from "../../config";

import { TJwtPayload } from "../auth/auth.interface";
import { ActivityLogServices } from "../activity-log/activityLog.service";
import { NotificationServices } from "../notification/notification.service";

import { resolveMembership, assertPermission } from "../../lib/tenant-guards";
import { TRole } from "../../lib/permissions";

import { TCreateInvitation } from "./invitation.interface";

// Cryptographically random invitation token (URL-safe).
const generateToken = () => crypto.randomBytes(24).toString("hex");

const expirationDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + config.invitationExpiresInDays);
  return d;
};

// Create an invitation. The inviter must have permission over the target
// scope — workspace.invite for a workspace invite, org manage for org.
const createInvitationIntoDB = async (
  user: TJwtPayload,
  payload: TCreateInvitation,
) => {
  // Resolve + authorize against whichever scope was provided.
  if (payload.workspaceId) {
    const membership = await resolveMembership(payload.workspaceId, user.id);
    assertPermission(membership, "workspace.members.invite");
  } else if (payload.organizationId) {
    const org = await prisma.organization.findUnique({
      where: { id: payload.organizationId },
      select: { id: true, ownerId: true },
    });
    if (!org) throw new AppError(404, "Organization not found");
    if (org.ownerId !== user.id && user.role !== "ADMIN") {
      throw new AppError(403, "Only the organization owner can invite");
    }
  }

  // De-dup: one pending invitation per (email, target) at a time.
  const existing = await prisma.invitation.findFirst({
    where: {
      email: payload.email,
      status: "PENDING",
      OR: [
        { workspaceId: payload.workspaceId ?? null },
        { organizationId: payload.organizationId ?? null },
      ],
    },
    select: { id: true },
  });
  if (existing) {
    throw new AppError(409, "A pending invitation already exists for this email");
  }

  const invitation = await prisma.invitation.create({
    data: {
      email: payload.email,
      token: generateToken(),
      role: payload.role ?? ("DEVELOPER" as TRole),
      inviterId: user.id,
      organizationId: payload.organizationId,
      workspaceId: payload.workspaceId,
      expiresAt: expirationDate(),
    },
  });

  await ActivityLogServices.createActivityLog({
    action: "INVITATION_CREATED",
    entity: "INVITATION",
    entityId: invitation.id,
    userId: user.id,
    details: { email: payload.email, role: invitation.role },
  });

  // If the invitee already has an account, surface an in-app notification.
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
    select: { id: true },
  });
  if (existingUser) {
    await NotificationServices.createNotification(
      existingUser.id,
      "New invitation",
      `You've been invited to join a workspace as ${invitation.role}.`,
    );
  }

  return invitation;
};

// Invitations the caller sent OR received (matched by their email).
const getInvitationsFromDB = async (user: TJwtPayload) => {
  return prisma.invitation.findMany({
    where: {
      OR: [{ inviterId: user.id }, { email: user.email }],
    },
    include: {
      inviter: { select: { id: true, name: true, email: true } },
      workspace: { select: { id: true, name: true, slug: true } },
      organization: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

// Accept an invitation by its token. The accepting user's email must match
// the invitation email. Creates the workspace membership + (optionally)
// a team membership, marks the invitation accepted, and returns nothing —
// the caller should call /auth/switch-workspace to obtain a scoped token.
const acceptInvitationIntoDB = async (token: string, user: TJwtPayload) => {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      workspace: { select: { id: true } },
    },
  });

  if (!invitation) {
    throw new AppError(404, "Invitation not found");
  }

  if (invitation.status !== "PENDING") {
    throw new AppError(400, `Invitation is already ${invitation.status.toLowerCase()}`);
  }

  if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
    throw new AppError(403, "This invitation was sent to a different email");
  }

  if (invitation.expiresAt && invitation.expiresAt < new Date()) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "EXPIRED" },
    });
    throw new AppError(410, "Invitation has expired");
  }

  return prisma.$transaction(async (tx) => {
    // Create workspace membership if a workspace was scoped.
    if (invitation.workspaceId) {
      const existingMembership = await tx.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: invitation.workspaceId,
            userId: user.id,
          },
        },
        select: { id: true },
      });

      if (!existingMembership) {
        await tx.workspaceMember.create({
          data: {
            workspaceId: invitation.workspaceId,
            userId: user.id,
            role: invitation.role,
          },
        });
      }

      // Default the user's active workspace if they have none.
      await tx.user.updateMany({
        where: { id: user.id, activeWorkspaceId: null },
        data: { activeWorkspaceId: invitation.workspaceId },
      });
    }

    const updated = await tx.invitation.update({
      where: { id: invitation.id },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
        inviteeId: user.id,
      },
    });

    await ActivityLogServices.createActivityLog({
      action: "INVITATION_ACCEPTED",
      entity: "INVITATION",
      entityId: updated.id,
      userId: user.id,
      details: { workspaceId: invitation.workspaceId, role: invitation.role },
    });

    return updated;
  });
};

const revokeInvitationIntoDB = async (token: string, user: TJwtPayload) => {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    select: { id: true, inviterId: true, status: true, workspaceId: true },
  });

  if (!invitation) {
    throw new AppError(404, "Invitation not found");
  }

  // Inviter can always revoke; workspace members with invite permission
  // can revoke for their workspace.
  if (invitation.inviterId !== user.id && invitation.workspaceId) {
    const membership = await resolveMembership(invitation.workspaceId, user.id);
    assertPermission(membership, "invitation.revoke");
  } else if (invitation.inviterId !== user.id) {
    throw new AppError(403, "Only the inviter can revoke this invitation");
  }

  if (invitation.status !== "PENDING") {
    throw new AppError(400, "Only pending invitations can be revoked");
  }

  return prisma.invitation.update({
    where: { id: invitation.id },
    data: { status: "REVOKED" },
  });
};

export const InvitationServices = {
  createInvitationIntoDB,
  getInvitationsFromDB,
  acceptInvitationIntoDB,
  revokeInvitationIntoDB,
};
