import express from "express";
import cors from "cors";
import helmet from "helmet";
import { getEnv } from "./config/env.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { notFound } from "./middlewares/notFound.middleware.js";
import { sendSuccess } from "./utils/api-response.js";
import { apiRateLimiter } from "./middlewares/rate-limit.middleware.js";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./config/swagger.js";
import { requestLogger } from "./middlewares/logger.middleware.js";

const env = getEnv();
const app = express();

if (env.TRUST_PROXY_HOPS > 0) {
  app.set("trust proxy", env.TRUST_PROXY_HOPS);
}

app.use(requestLogger);
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

app.use("/api", apiRateLimiter);

app.get("/api/health", (_req, res) => {
  sendSuccess(res, 200, "API is running", null);
});

import authRouter from "./modules/auth/auth.routes.js";
app.use("/api/auth", authRouter);

import taskRouter from "./modules/tasks/task.routes.js";
app.use("/api/tasks", taskRouter);

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(notFound);
app.use(errorHandler);

export default app;
