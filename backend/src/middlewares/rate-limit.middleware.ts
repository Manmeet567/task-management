import { rateLimit } from "express-rate-limit";
import { getEnv } from "../config/env.js";

const env = getEnv();

import type { ApiResponse } from "../types/api-response.types.js";

const MINUTE_IN_MS = 60 * 1000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;

function createRateLimitResponse(message: string): ApiResponse<null> {
  return {
    success: false,
    message,
    data: null,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
    },
  };
}

export const apiRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_IN_MS,
  limit: 100,

  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "test",

  message: createRateLimitResponse(
    "Too many requests. Please try again later.",
  ),
});

export const loginRateLimiter = rateLimit({
  windowMs: 15 * MINUTE_IN_MS,
  limit: 10,

  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "test",

  skipSuccessfulRequests: true,

  message: createRateLimitResponse(
    "Too many login attempts. Please try again later.",
  ),
});

export const registerRateLimiter = rateLimit({
  windowMs: HOUR_IN_MS,
  limit: 5,

  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "test",

  message: createRateLimitResponse(
    "Too many registration attempts. Please try again later.",
  ),
});
