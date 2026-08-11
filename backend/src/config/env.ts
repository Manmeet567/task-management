import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  CLIENT_ORIGIN: z.string().url("CLIENT_ORIGIN must be a valid URL"),
});

export function getEnv() {
  return envSchema.parse(process.env);
}
