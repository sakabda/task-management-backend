import { z } from "zod";

export const addMemberValidationSchema = z.object({
  body: z.object({
    projectId: z.string(),
    userId: z.string(),
    role: z.string().optional(),
  }),
});
