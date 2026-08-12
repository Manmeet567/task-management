import { apiRequest } from "../../api/client";
import type { DashboardData } from "./dashboard.types";

export function getDashboard(): Promise<DashboardData> {
  return apiRequest<DashboardData>("/tasks/dashboard", {
    authenticated: true,
  });
}
