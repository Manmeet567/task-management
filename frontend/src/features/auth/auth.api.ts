import { apiRequest } from "../../api/client";

import type { LoginInput, RegisterInput } from "./auth.schema";
import type { AuthResponseData } from "./auth.types";

export function login(input: LoginInput): Promise<AuthResponseData> {
  return apiRequest<AuthResponseData>("/auth/login", {
    method: "POST",
    body: input,
  });
}

export function register(input: RegisterInput): Promise<AuthResponseData> {
  return apiRequest<AuthResponseData>("/auth/register", {
    method: "POST",
    body: {
      email: input.email,
      password: input.password,
    },
  });
}
