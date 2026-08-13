import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "@/test/render";
import { useAuthStore } from "@/stores/auth.store";

import RegisterPage from "./RegisterPage";
import { register as registerUser } from "./auth.api";

vi.mock("./auth.api", () => ({
  login: vi.fn(),
  register: vi.fn(),
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuthStore.setState({
      user: null,
      access_token: null,
      is_authenticated: false,
    });
  });

  it("rejects mismatched passwords without calling the API", async () => {
    const { user } = renderWithProviders(<RegisterPage />, {
      route: "/register",
    });

    await user.type(
      screen.getByLabelText(/email address/i),
      "test@example.com",
    );

    await user.type(screen.getByLabelText(/^password$/i), "password123");

    await user.type(screen.getByLabelText(/confirm password/i), "password456");

    await user.click(
      screen.getByRole("button", {
        name: /create account/i,
      }),
    );

    expect(
      await screen.findByText("Passwords do not match"),
    ).toBeInTheDocument();

    expect(registerUser).not.toHaveBeenCalled();
  });
});
