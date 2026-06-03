import { z } from "zod";

export const createCommentValidationSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Comment is required"),
  }),
});

export const updateCommentValidationSchema = z.object({
  body: z.object({
    content: z.string().min(1).optional(),
  }),
});
