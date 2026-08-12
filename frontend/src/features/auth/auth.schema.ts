import { z } from "zod";

export const loginSchema = z.strictObject({
  email: z.email({
    error: "Enter a valid email address",
  }),

  password: z.string().min(1, {
    error: "Password is required",
  }),
});

export const registerSchema = z
  .strictObject({
    email: z.email({
      error: "Enter a valid email address",
    }),

    password: z
      .string()
      .min(8, {
        error: "Password must be at least 8 characters",
      })
      .max(72, {
        error: "Password must not exceed 72 characters",
      }),

    confirm_password: z.string().min(1, {
      error: "Please confirm your password",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    error: "Passwords do not match",
    path: ["confirm_password"],
  });

export type LoginInput = z.infer<typeof loginSchema>;

export type RegisterInput = z.infer<typeof registerSchema>;
