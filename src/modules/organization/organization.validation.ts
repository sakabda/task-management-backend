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
    status: z.enum(["ACTIVE", "PENDING", "SUSPENDED", "DELETED"]).optional(),
    logoUrl: z.url().optional(),
    owner: z.object({
      name: z
        .string()
        .min(2, "Owner name must be at least 2 characters")
        .max(80),
      email: z.string().email("Invalid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
    }),
  }),
});



export const updateOrganizationValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(["ACTIVE", "PENDING", "SUSPENDED", "DELETED"]).optional(),
    logoUrl: z.string().optional(),
    plan: z.enum(["FREE", "STARTER", "PROFESSIONAL", "ENTERPRISE"]).optional(),
    owner: z
      .object({
        name: z.string().optional(),
        email: z.string().email().optional(),
      })
      .optional(),
  }),
});
