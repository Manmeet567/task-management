import type { ErrorRequestHandler } from "express";

import { AppError } from "../errors/AppError.js";
import type { ApiResponse } from "../types/api-response.types.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    const response: ApiResponse<null> = {
      success: false,
      message: error.message,
      data: null,
      error: {
        code: error.code,
        ...(error.details !== undefined && {
          details: error.details,
        }),
      },
    };

    res.status(error.statusCode).json(response);
    return;
  }

  console.error(error);

  const response: ApiResponse<null> = {
    success: false,
    message: "Internal server error",
    data: null,
    error: {
      code: "INTERNAL_SERVER_ERROR",
    },
  };

  res.status(500).json(response);
};
