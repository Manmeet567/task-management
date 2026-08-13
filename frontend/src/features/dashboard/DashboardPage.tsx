import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  ListTodo,
  LoaderCircle,
} from "lucide-react";
import { Link } from "react-router";

import { ApiClientError } from "@/api/client";
import { getDashboard } from "./dashboard.api";

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: typeof ListTodo;
  iconClassName: string;
  iconBackgroundClassName: string;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  iconBackgroundClassName,
}: StatCardProps) {
  return (
    <div className="motion-rise-in rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text-muted">{title}</p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-text">
            {value}
          </p>
        </div>

        <div
          className={[
            "flex h-11 w-11 items-center justify-center rounded-xl",
            iconBackgroundClassName,
          ].join(" ")}
        >
          <Icon size={21} className={iconClassName} />
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-text-muted">{description}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {Array.from({
        length: 5,
      }).map((_, index) => (
        <div
          key={index}
          className="h-40 animate-pulse rounded-2xl border border-border bg-surface"
        />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  if (error) {
    const message =
      error instanceof ApiClientError
        ? error.message
        : "Unable to load dashboard.";

    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
        <h2 className="font-semibold text-red-700 dark:text-red-300">
          Unable to load dashboard
        </h2>

        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{message}</p>

        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 cursor-pointer rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-500 dark:text-indigo-300">
            Overview
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-text-muted">
            A quick look at your current workload.
          </p>
        </div>

        <Link
          to="/tasks"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          View all tasks
        </Link>
      </div>

      {isPending || !data ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total tasks"
            value={data.total_tasks}
            description="All tasks in your workspace"
            icon={ListTodo}
            iconClassName="text-indigo-600 dark:text-indigo-300"
            iconBackgroundClassName="bg-indigo-50 dark:bg-indigo-950/40"
          />

          <StatCard
            title="To do"
            value={data.by_status.to_do}
            description="Tasks waiting to be started"
            icon={CircleDot}
            iconClassName="text-slate-600 dark:text-slate-300"
            iconBackgroundClassName="bg-slate-100 dark:bg-slate-800"
          />

          <StatCard
            title="In progress"
            value={data.by_status.in_progress}
            description="Tasks you're currently working on"
            icon={LoaderCircle}
            iconClassName="text-violet-600 dark:text-violet-300"
            iconBackgroundClassName="bg-violet-50 dark:bg-violet-950/40"
          />

          <StatCard
            title="Completed"
            value={data.by_status.done}
            description="Tasks you've completed"
            icon={CheckCircle2}
            iconClassName="text-emerald-600 dark:text-emerald-300"
            iconBackgroundClassName="bg-emerald-50 dark:bg-emerald-950/30"
          />

          <StatCard
            title="Overdue"
            value={data.overdue_tasks}
            description="Incomplete tasks past their due date"
            icon={AlertTriangle}
            iconClassName="text-red-600 dark:text-red-300"
            iconBackgroundClassName="bg-red-50 dark:bg-red-950/30"
          />
        </div>
      )}
    </section>
  );
}
