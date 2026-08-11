import { z } from "zod";

export const registerSchema = z.strictObject({
  email: z.email({
    error: "Please provide a valid email address",
  }),

  password: z
    .string({
      error: "Password is required",
    })
    .min(8, {
      error: "Password must be at least 8 characters",
    })
    .max(20, {
      error: "Password must not exceed 20 characters",
    }),
});

export const loginSchema = z.strictObject({
  email: z.email({
    error: "Please provide a valid email address",
  }),

  password: z
    .string({
      error: "Password is required",
    })
    .min(1, {
      error: "Password is required",
    }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
