import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";

import ThemeToggle from "@/components/ui/ThemeToggle";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function AuthLayout({
  title,
  description,
  children,
}: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-background px-4 py-6 text-text">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
        <div className="absolute right-5 top-5">
          <ThemeToggle />
        </div>

        <div className="motion-rise-in grid w-full overflow-hidden rounded-3xl border border-border bg-surface shadow-xl shadow-indigo-100/20 lg:grid-cols-2 dark:shadow-none">
          <section className="hidden bg-linear-to-br from-indigo-100 via-violet-100 to-purple-100 p-12 lg:flex lg:flex-col lg:justify-between dark:from-indigo-950/60 dark:via-violet-950/40 dark:to-purple-950/40">
            <div>
              <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-xl font-bold text-indigo-500 shadow-sm dark:bg-white/10 dark:text-indigo-300">
                T
              </div>

              <h1 className="max-w-md text-4xl font-semibold leading-tight text-slate-800 dark:text-violet-50">
                Organize your work.
                <br />
                Focus on what matters.
              </h1>

              <p className="mt-5 max-w-md text-base leading-7 text-slate-600 dark:text-violet-200/70">
                A simple workspace for planning, prioritising, and completing
                your daily tasks.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "Prioritise important work",
                "Track progress at a glance",
                "Never miss a due date",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-violet-100/80"
                >
                  <CheckCircle2
                    size={18}
                    className="text-indigo-500 dark:text-indigo-300"
                  />

                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16">
            <div className="w-full max-w-md">
              <div className="mb-8">
                <h2 className="text-3xl font-semibold tracking-tight">
                  {title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-text-muted">
                  {description}
                </p>
              </div>

              {children}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
