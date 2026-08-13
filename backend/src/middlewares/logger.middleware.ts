import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

import pino from "pino";
import { pinoHttp } from "pino-http";

import { getEnv } from "../config/env.js";

const env = getEnv();

const logger =
  env.NODE_ENV === "development"
    ? pino({
        level: "debug",

        transport: {
          target: "pino-pretty",

          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",

            singleLine: true,
          },
        },
      })
    : pino({
        level: "info",
      });

export const requestLogger = pinoHttp({
  logger,

  genReqId: (req: IncomingMessage, res: ServerResponse) => {
    const existingRequestId = req.headers["x-request-id"];

    if (typeof existingRequestId === "string" && existingRequestId.length > 0) {
      return existingRequestId;
    }

    const requestId = randomUUID();

    res.setHeader("X-Request-Id", requestId);

    return requestId;
  },

  customLogLevel: (
    _req: IncomingMessage,
    res: ServerResponse,
    error?: Error,
  ) => {
    if (error || res.statusCode >= 500) {
      return "error";
    }

    if (res.statusCode >= 400) {
      return "warn";
    }

    return "info";
  },

  customSuccessMessage: (req: IncomingMessage, res: ServerResponse) => {
    return `${req.method ?? "UNKNOWN"} ${req.url ?? ""} → ${res.statusCode}`;
  },

  customErrorMessage: (req: IncomingMessage, res: ServerResponse) => {
    return `${req.method ?? "UNKNOWN"} ${req.url ?? ""} → ${res.statusCode}`;
  },

  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie"],

    censor: "[REDACTED]",
  },
});
