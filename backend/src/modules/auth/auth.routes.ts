import { Router } from "express";

import { validateBody } from "../../middlewares/validate.middleware.js";
import { authController } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.validation.js";
import {
  loginRateLimiter,
  registerRateLimiter,
} from "../../middlewares/rate-limit.middleware.js";

const authRouter = Router();

authRouter.post(
  "/register",
  registerRateLimiter,
  validateBody(registerSchema),
  authController.register,
);

authRouter.post(
  "/login",
  loginRateLimiter,
  validateBody(loginSchema),
  authController.login,
);

export default authRouter;
