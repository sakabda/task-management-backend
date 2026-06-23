import { z } from "zod";

export const registerValidationSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    email: z.email(),
    password: z.string().min(6),
  }),
});

export const loginValidationSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(6),
  }),
});

export const switchWorkspaceValidationSchema = z.object({
  body: z.object({
    workspaceId: z.string().min(1, "workspaceId is required"),
  }),
});
