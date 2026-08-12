import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";

import { ApiClientError } from "../../api/client";
import { useAuthStore } from "../../stores/auth.store";

import AuthLayout from "./AuthLayout";
import { register as registerUser } from "./auth.api";
import { registerSchema, type RegisterInput } from "./auth.schema";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.is_authenticated);

  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),

    defaultValues: {
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,

    onSuccess: (data) => {
      const { access_token, ...user } = data;

      setAuth(user, access_token);

      navigate("/", {
        replace: true,
      });
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data);
  };

  const serverError =
    registerMutation.error instanceof ApiClientError
      ? registerMutation.error.message
      : registerMutation.error
        ? "Something went wrong. Please try again."
        : null;

  const passwordInputType = showPassword ? "text" : "password";

  return (
    <AuthLayout
      title="Create your account"
      description="Start organising your tasks in just a few seconds."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {serverError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {serverError}
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email address
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
            className="
              w-full rounded-xl border border-border
              bg-background px-4 py-3 text-sm
              outline-none transition
              placeholder:text-text-muted/60
              focus:border-primary
              focus:ring-4 focus:ring-indigo-100
              dark:focus:ring-indigo-950
            "
          />

          {errors.email && (
            <p className="mt-1.5 text-sm text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              type={passwordInputType}
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              {...register("password")}
              className="
                w-full rounded-xl border border-border
                bg-background px-4 py-3 pr-12
                text-sm outline-none transition
                placeholder:text-text-muted/60
                focus:border-primary
                focus:ring-4 focus:ring-indigo-100
                dark:focus:ring-indigo-950
              "
            />

            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-muted hover:text-text"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.password && (
            <p className="mt-1.5 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirm_password"
            className="mb-2 block text-sm font-medium"
          >
            Confirm password
          </label>

          <input
            id="confirm_password"
            type={passwordInputType}
            autoComplete="new-password"
            placeholder="Enter password again"
            {...register("confirm_password")}
            className="
              w-full rounded-xl border border-border
              bg-background px-4 py-3 text-sm
              outline-none transition
              placeholder:text-text-muted/60
              focus:border-primary
              focus:ring-4 focus:ring-indigo-100
              dark:focus:ring-indigo-950
            "
          />

          {errors.confirm_password && (
            <p className="mt-1.5 text-sm text-red-500">
              {errors.confirm_password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="
            flex w-full cursor-pointer
            items-center justify-center
            rounded-xl bg-primary px-4 py-3
            text-sm font-semibold text-white
            transition
            hover:bg-primary-hover
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {registerMutation.isPending
            ? "Creating account..."
            : "Create account"}
        </button>

        <p className="text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-500 hover:text-violet-500 dark:text-indigo-300"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
