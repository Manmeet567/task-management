import { beforeEach, describe, expect, it } from "vitest";
import { Route, Routes } from "react-router";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "@/test/render";
import { useAuthStore } from "@/stores/auth.store";

import ProtectedRoute from "./ProtectedRoute";

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();

    useAuthStore.setState({
      user: null,
      access_token: null,
      is_authenticated: false,
    });
  });

  it("redirects unauthenticated users to login", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />

        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <p>Protected content</p>
            </ProtectedRoute>
          }
        />
      </Routes>,
      {
        route: "/protected",
      },
    );

    expect(await screen.findByText("Login page")).toBeInTheDocument();

    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders protected content for authenticated users", () => {
    useAuthStore.setState({
      user: {
        id: "user-1",
        email: "test@example.com",
        created_at: "2026-08-10T10:00:00.000Z",
        updated_at: "2026-08-10T10:00:00.000Z",
      },

      access_token: "test-access-token",

      is_authenticated: true,
    });

    renderWithProviders(
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <p>Protected content</p>
            </ProtectedRoute>
          }
        />
      </Routes>,
      {
        route: "/protected",
      },
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });
});
