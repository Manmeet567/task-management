import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  CLIENT_ORIGIN: z.url({
    error: "CLIENT_ORIGIN must be a valid URL",
  }),

  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),

  JWT_EXPIRES_IN: z.string().default("1h"),

  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).default(0),
});

export function getEnv() {
  return envSchema.parse(process.env);
}
