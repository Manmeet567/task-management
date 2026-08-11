import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";

import { AppError } from "../errors/AppError.js";
import type { ApiResponse } from "../types/api-response.types.js";

interface DuplicateKeyError extends Error {
  code: number;
  keyValue?: Record<string, unknown>;
}

function isDuplicateKeyError(error: unknown): error is DuplicateKeyError {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}

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

  if (isDuplicateKeyError(error)) {
    const isEmailDuplicate =
      error.keyValue &&
      Object.prototype.hasOwnProperty.call(error.keyValue, "email");

    const response: ApiResponse<null> = {
      success: false,
      message: isEmailDuplicate
        ? "An account with this email already exists"
        : "A resource with this value already exists",
      data: null,
      error: {
        code: isEmailDuplicate ? "EMAIL_ALREADY_EXISTS" : "DUPLICATE_RESOURCE",
      },
    };

    res.status(409).json(response);
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.values(error.errors).map((validationError) => ({
      field: validationError.path,
      message: validationError.message,
    }));

    const response: ApiResponse<null> = {
      success: false,
      message: "Validation failed",
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        details,
      },
    };

    res.status(400).json(response);
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    const response: ApiResponse<null> = {
      success: false,
      message: `Invalid value for ${error.path}`,
      data: null,
      error: {
        code: "INVALID_VALUE",
      },
    };

    res.status(400).json(response);
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
