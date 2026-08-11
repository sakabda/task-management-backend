import { z } from "zod";

export const createTaskValidationSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),

    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),

    projectId: z.string().optional(),
    assignedToId: z.string().optional(),
    dueDate: z.string().datetime().optional(),
  }),
});

export const updateTaskValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),

    description: z.string().optional(),

    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),

    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    dueDate: z.string().datetime().optional(),
  }),
});

export const updateTaskStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  }),
});

export const updateTaskPriorityValidationSchema = z.object({
  body: z.object({
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  }),
});


export const assignTaskValidationSchema = z.object({
  body: z.object({
    assignedToId: z.string({
      message: "assignedToId is required",
    }),
  }),
});
