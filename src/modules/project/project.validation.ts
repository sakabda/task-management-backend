import { z } from "zod";

export const createProjectValidationSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    description: z.string().optional(),
  }),
});

export const updateProjectValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
  }),
});
