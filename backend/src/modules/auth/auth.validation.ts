import { Buffer } from "node:buffer";
import { z } from "zod";

function isWithinBcryptLimit(password: string): boolean {
  return Buffer.byteLength(password, "utf8") <= 72;
}

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
    .max(72, {
      error: "Password must not exceed 72 characters",
    })
    .refine(isWithinBcryptLimit, {
      error: "Password must not exceed 72 bytes",
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
    })
    .max(72, {
      error: "Password must not exceed 72 characters",
    })
    .refine(isWithinBcryptLimit, {
      error: "Password must not exceed 72 bytes",
    }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
