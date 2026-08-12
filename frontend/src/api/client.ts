import { useAuthStore } from "../stores/auth.store";
import type { ApiResponse } from "../types/api.types";

const API_URL = import.meta.env.VITE_API_URL;

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  authenticated?: boolean;
}

export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(
    message: string,
    code: string,
    status: number,
    details?: unknown,
  ) {
    super(message);

    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, authenticated = false, headers, ...requestOptions } = options;

  const requestHeaders = new Headers(headers);

  requestHeaders.set("Content-Type", "application/json");

  if (authenticated) {
    const token = useAuthStore.getState().access_token;

    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...requestOptions,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !result.success) {
    throw new ApiClientError(
      result.message,
      result.error?.code ?? "UNKNOWN_ERROR",
      response.status,
      result.error?.details,
    );
  }

  if (result.data === null) {
    return null as T;
  }

  return result.data;
}
