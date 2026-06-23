import { z } from "zod";

export const createDepartmentValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    description: z.string().max(500).optional(),
  }),
});

export const updateDepartmentValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    description: z.string().max(500).optional(),
  }),
});
