import type { Response } from "express";

import type { ApiResponse } from "../types/api-response.types.js";

export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
): void {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    error: null,
  };

  res.status(statusCode).json(response);
}
