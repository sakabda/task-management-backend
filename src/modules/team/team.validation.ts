import { z } from "zod";

export const createTeamValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    description: z.string().max(500).optional(),
    departmentId: z.string().nullable().optional(),
  }),
});

export const updateTeamValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    description: z.string().max(500).optional(),
    departmentId: z.string().nullable().optional(),
  }),
});

export const addTeamMemberValidationSchema = z.object({
  body: z.object({
    workspaceMemberId: z.string().min(1, "workspaceMemberId is required"),
  }),
});
