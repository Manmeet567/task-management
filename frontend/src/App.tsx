import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import Toast from "./components/ui/Toast";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/RegisterPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));
const TasksPage = lazy(() => import("@/features/tasks/pages/TasksPage"));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-primary" />

        <p className="text-sm text-text-muted">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/register" element={<RegisterPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />

            <Route path="tasks" element={<TasksPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <Toast />
    </>
  );
}
