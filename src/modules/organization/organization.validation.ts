import { z } from "zod";

// Slug: lowercase letters, numbers, hyphens; 3–40 chars.
const slugRegex = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

export const createOrganizationValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(80),
    slug: z
      .string()
      .regex(slugRegex, "Slug must be 3–40 lowercase chars, hyphens allowed")
      .optional(),
    description: z.string().max(500).optional(),
    logoUrl: z.url().optional(),
  }),
});

export const updateOrganizationValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    slug: z
      .string()
      .regex(slugRegex, "Slug must be 3–40 lowercase chars, hyphens allowed")
      .optional(),
    description: z.string().max(500).optional(),
    logoUrl: z.url().optional(),
  }),
});
