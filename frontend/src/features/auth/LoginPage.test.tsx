import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";

import { renderWithProviders } from "@/test/render";
import { useAuthStore } from "@/stores/auth.store";

import LoginPage from "./LoginPage";
import { login } from "./auth.api";

vi.mock("./auth.api", () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuthStore.setState({
      user: null,
      access_token: null,
      is_authenticated: false,
    });
  });

  it("shows validation errors and does not call the API for invalid input", async () => {
    const { user } = renderWithProviders(<LoginPage />, {
      route: "/login",
    });

    await user.type(screen.getByLabelText(/email address/i), "not-an-email");

    await user.type(screen.getByLabelText(/^password$/i), "password123");

    await user.click(
      screen.getByRole("button", {
        name: /sign in/i,
      }),
    );

    expect(
      await screen.findByText("Enter a valid email address"),
    ).toBeInTheDocument();

    expect(login).not.toHaveBeenCalled();
  });

  it("stores authentication after a successful login", async () => {
    vi.mocked(login).mockResolvedValue({
      id: "user-1",
      email: "test@example.com",
      created_at: "2026-08-13T10:00:00.000Z",
      updated_at: "2026-08-13T10:00:00.000Z",
      access_token: "test-token",
    });

    const { user } = renderWithProviders(<LoginPage />, {
      route: "/login",
    });

    await user.type(
      screen.getByLabelText(/email address/i),
      "test@example.com",
    );

    await user.type(screen.getByLabelText(/^password$/i), "password123");

    await user.click(
      screen.getByRole("button", {
        name: /sign in/i,
      }),
    );

    await waitFor(() => {
      expect(login).toHaveBeenCalledOnce();
    });

    expect(vi.mocked(login).mock.calls[0]?.[0]).toEqual({
      email: "test@example.com",
      password: "password123",
    });

    await waitFor(() => {
      expect(useAuthStore.getState().is_authenticated).toBe(true);
    });

    expect(useAuthStore.getState().access_token).toBe("test-token");

    expect(useAuthStore.getState().user?.email).toBe("test@example.com");
  });
});
