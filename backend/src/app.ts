import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { getEnv } from "./config/env.js";

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
  res.status(200).json({
    status: "success",
    message: "API is running",
  });
});

export default app;
