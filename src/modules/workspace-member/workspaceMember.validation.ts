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

export const addWorkspaceMemberValidationSchema = z.object({
  body: z.object({
    userId: z.string().min(1, "userId is required"),
    role: roleEnum.optional(),
  }),
});

export const updateWorkspaceMemberRoleValidationSchema = z.object({
  body: z.object({
    role: roleEnum,
  }),
});
