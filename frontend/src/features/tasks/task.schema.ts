import { z } from "zod";

export const taskFormSchema = z.strictObject({
  title: z
    .string()
    .trim()
    .min(1, {
      error: "Title is required",
    })
    .max(150, {
      error: "Title must not exceed 150 characters",
    }),

  description: z.string().trim().max(2000, {
    error: "Description must not exceed 2000 characters",
  }),

  priority: z.enum(["low", "medium", "high"]),

  status: z.enum(["to_do", "in_progress", "done"]),

  due_date: z.string(),
});

export type TaskFormInput = z.infer<typeof taskFormSchema>;
