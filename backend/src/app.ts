import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { getEnv } from "./config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { notFound } from "./middlewares/notFound.middleware.js";
import { sendSuccess } from "./utils/api-response.js";

const env = getEnv();
const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
  }),
);

app.use(
  express.json({
    limit: "10kb",
  }),
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

app.get("/api/health", (_req, res) => {
  sendSuccess(res, 200, "API is running", null);
});

import authRouter from "./modules/auth/auth.routes.js";
app.use("/api/auth", authRouter);

import taskRouter from "./modules/tasks/task.routes.js";
app.use("/api/tasks", taskRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
