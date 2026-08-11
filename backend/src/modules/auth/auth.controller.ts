import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response.js";
import type { LoginInput, RegisterInput } from "./auth.validation.js";
import { AuthService, authService } from "./auth.service.js";

type RegisterRequest = Request<Record<string, never>, unknown, RegisterInput>;
type LoginRequest = Request<Record<string, never>, unknown, LoginInput>;

export class AuthController {
  constructor(private readonly service: AuthService) {}

  register = async (req: RegisterRequest, res: Response): Promise<void> => {
    const result = await this.service.register(req.body);

    sendSuccess(res, 201, "User registered successfully", result);
  };

  login = async (req: LoginRequest, res: Response): Promise<void> => {
    const result = await this.service.login(req.body);

    sendSuccess(res, 200, "Login successful", result);
  };
}

export const authController = new AuthController(authService);
