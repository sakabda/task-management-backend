import { z } from "zod";

const roleEnum = z.enum([
  "ORG_ADMIN",
  "PROJECT_MANAGER",
  "TEAM_LEAD",
  "DEVELOPER",
  "QA",
  "CLIENT",
  "GUEST",
]);

export const createInvitationValidationSchema = z
  .object({
    body: z.object({
      email: z.email(),
      role: roleEnum.optional(),
      // At least one target scope must be provided.
      organizationId: z.string().optional(),
      workspaceId: z.string().optional(),
      teamId: z.string().optional(),
    }),
  })
  .refine(
    (data) =>
      Boolean(data.body.organizationId || data.body.workspaceId || data.body.teamId),
    { message: "At least one of organizationId, workspaceId or teamId is required" },
  );
