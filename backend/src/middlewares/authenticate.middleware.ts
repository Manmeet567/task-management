import type { NextFunction, Request, Response } from "express";

import { getEnv } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";

const env = getEnv();

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    throw new AppError(
      "Authentication required",
      401,
      "AUTHENTICATION_REQUIRED",
    );
  }

  const token = authorizationHeader.slice(7).trim();

  if (!token) {
    throw new AppError(
      "Authentication required",
      401,
      "AUTHENTICATION_REQUIRED",
    );
  }

  try {
    const payload = await verifyAccessToken(token, env.JWT_SECRET);
    console.log("Payload:", payload); // Log the payload for debugging

    if (!payload.sub) {
      throw new Error("Token subject is missing");
    }

    req.auth = {
      user_id: payload.sub,
    };

    next();
  } catch {
    throw new AppError("Invalid or expired token", 401, "INVALID_TOKEN");
  }
}
