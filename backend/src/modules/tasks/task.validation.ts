import { z } from "zod";

import {
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "../../constants/task.constants.js";

const dueDateSchema = z
  .union([z.iso.date(), z.iso.datetime({ offset: true }), z.null()])
  .transform((value) => {
    if (value === null) {
      return null;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return new Date(`${value}T23:59:59.999Z`);
    }

    return new Date(value);
  });

export const createTaskSchema = z.strictObject({
  title: z
    .string({
      error: "Title is required",
    })
    .trim()
    .min(1, {
      error: "Title is required",
    })
    .max(150, {
      error: "Title must not exceed 150 characters",
    }),

  description: z
    .string()
    .trim()
    .max(2000, {
      error: "Description must not exceed 2000 characters",
    })
    .optional(),

  priority: z.enum(TASK_PRIORITIES).optional(),

  due_date: dueDateSchema.optional(),

  status: z.enum(TASK_STATUSES).optional(),
});

export const updateTaskSchema = createTaskSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: "At least one field must be provided",
  });

export const taskParamsSchema = z.strictObject({
  task_id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid task ID"),
});

export const taskListQuerySchema = z.strictObject({
  status: z.enum(TASK_STATUSES).optional(),

  priority: z.enum(TASK_PRIORITIES).optional(),

  sort_by: z.enum(["due_date", "created_at"]).optional(),

  sort_order: z.enum(["asc", "desc"]).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export type TaskParams = z.infer<typeof taskParamsSchema>;

export type TaskListQuery = z.infer<typeof taskListQuerySchema>;
