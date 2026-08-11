import type {
  NextFunction,
  Request,
  Response,
} from "express";
import type { ZodType } from "zod";

import { AppError } from "../errors/AppError.js";

export function validateBody(schema: ZodType) {
  return (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      next(
        new AppError(
          "Validation failed",
          400,
          "VALIDATION_ERROR",
          details,
        ),
      );

      return;
    }

    req.body = result.data;

    next();
  };
}