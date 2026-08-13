import type { TaskPriority, TaskStatus } from "../../task.types";

type BadgeType =
  | {
      type: "priority";
      value: TaskPriority;
    }
  | {
      type: "status";
      value: TaskStatus;
    };

const priorityConfig = {
  low: {
    label: "Low",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
  },
  medium: {
    label: "Medium",
    className:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
  },
  high: {
    label: "High",
    className: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
  },
};

const statusConfig = {
  to_do: {
    label: "To do",
    className:
      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  },
  in_progress: {
    label: "In progress",
    className:
      "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  },
  done: {
    label: "Done",
    className:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
  },
};

export default function TaskBadge(props: BadgeType) {
  const config =
    props.type === "priority"
      ? priorityConfig[props.value]
      : statusConfig[props.value];

  return (
    <span
      className={[
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        config.className,
      ].join(" ")}
    >
      {config.label}
    </span>
  );
}
