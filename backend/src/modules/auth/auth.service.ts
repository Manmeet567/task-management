import type { HydratedDocument } from "mongoose";

import { getEnv } from "../../config/env.js";
import { AppError } from "../../errors/AppError.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import { generateAccessToken } from "../../utils/jwt.js";

import type { LoginInput, RegisterInput } from "./auth.validation.js";

import type { IUser } from "../users/user.model.js";
import { UserRepository, userRepository } from "../users/user.repository.js";

interface PublicUser {
  id: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

interface AuthResult {
  id: string;
  email: string;
  created_at: Date;
  updated_at: Date;
  access_token: string;
}

interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
}

function toPublicUser(user: HydratedDocument<IUser>): PublicUser {
  return {
    id: user._id.toString(),
    email: user.email,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

function toAuthResult(
  user: HydratedDocument<IUser>,
  accessToken: string,
): AuthResult {
  return {
    id: user._id.toString(),
    email: user.email,
    created_at: user.created_at,
    updated_at: user.updated_at,
    access_token: accessToken,
  };
}

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly config: AuthConfig,
  ) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();

    const existingUser = await this.users.findByEmail(email);

    if (existingUser) {
      throw new AppError(
        "An account with this email already exists",
        409,
        "EMAIL_ALREADY_EXISTS",
      );
    }

    const passwordHash = await hashPassword(input.password);

    const user = await this.users.create({
      email,
      password_hash: passwordHash,
    });

    const accessToken = await generateAccessToken(
      user._id.toString(),
      this.config.jwtSecret,
      this.config.jwtExpiresIn,
    );

    return toAuthResult(user, accessToken);
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();

    const user = await this.users.findByEmailWithPassword(email);

    if (!user) {
      throw new AppError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS",
      );
    }

    const passwordMatches = await comparePassword(
      input.password,
      user.password_hash,
    );

    if (!passwordMatches) {
      throw new AppError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS",
      );
    }

    const accessToken = await generateAccessToken(
      user._id.toString(),
      this.config.jwtSecret,
      this.config.jwtExpiresIn,
    );

    return toAuthResult(user, accessToken);
  }
}

const env = getEnv();

export const authService = new AuthService(userRepository, {
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
});
