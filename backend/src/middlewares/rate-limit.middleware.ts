import { rateLimit } from "express-rate-limit";

import type { ApiResponse } from "../types/api-response.types.js";

const MINUTE_IN_MS = 60 * 1000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;

function createRateLimitResponse(
  message: string,
): ApiResponse<null> {
  return {
    success: false,
    message,
    data: null,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
    },
  };
}

export const loginRateLimiter = rateLimit({
  windowMs: 15 * MINUTE_IN_MS,
  limit: 10,

  standardHeaders: "draft-8",
  legacyHeaders: false,

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

  message: createRateLimitResponse(
    "Too many registration attempts. Please try again later.",
  ),
});