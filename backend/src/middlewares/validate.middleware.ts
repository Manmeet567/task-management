import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

import { AppError } from "../errors/AppError.js";

type RequestSource = "body" | "params" | "query";

function validateSource(schema: ZodType, source: RequestSource) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      next(new AppError("Validation failed", 400, "VALIDATION_ERROR", details));

      return;
    }

    if (source === "body") {
      req.body = result.data;
    }

    next();
  };
}

export function validateBody(schema: ZodType) {
  return validateSource(schema, "body");
}

export function validateParams(schema: ZodType) {
  return validateSource(schema, "params");
}

export function validateQuery(schema: ZodType) {
  return validateSource(schema, "query");
}
