import { z } from "zod";

const slugRegex = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

export const createWorkspaceValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    slug: z
      .string()
      .regex(slugRegex, "Slug must be 3–40 lowercase chars, hyphens allowed")
      .optional(),
    description: z.string().max(500).optional(),
    iconUrl: z.url().optional(),
    organizationId: z.string().min(1, "organizationId is required"),
  }),
});

export const updateWorkspaceValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    slug: z
      .string()
      .regex(slugRegex, "Slug must be 3–40 lowercase chars, hyphens allowed")
      .optional(),
    description: z.string().max(500).optional(),
    iconUrl: z.url().optional(),
  }),
});
