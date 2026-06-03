import { z } from "zod";

export const addMemberValidationSchema = z.object({
  body: z.object({
    userId: z.string(),
    role: z.string().optional(),
  }),
});
