import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import TaskBadge from "../shared/TaskBadge";
import type { Task } from "../../task.types";
import { isTaskOverdue } from "../../task.utils";

interface TaskCardProps {
  task: Task;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function formatDueDate(dueDate: string | null): string {
  if (!dueDate) {
    return "No due date";
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dueDate));
}

export default function TaskCard({
  task,
  onEdit,
  onView,
  onDelete,
}: TaskCardProps) {
  const overdue = isTaskOverdue(task);

  return (
    <article
      onClick={() => onView(task)}
      className="
        flex min-h-57.5 h-full
        cursor-pointer flex-col
        rounded-2xl
        border border-border
        bg-surface p-5 shadow-sm
        transition-[transform,box-shadow,border-color]
        duration-200 ease-out
        hover:-translate-y-0.5
        hover:border-indigo-200
        hover:shadow-md
        dark:hover:border-indigo-900
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-1 font-semibold text-text">{task.title}</h2>
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(task);
            }}
            className="
              flex h-9 w-9 cursor-pointer
              items-center justify-center
              rounded-lg text-text-muted
              transition
              hover:bg-surface-muted
              hover:text-text
            "
            aria-label={`Edit ${task.title}`}
          >
            <Pencil size={16} />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(task);
            }}
            className="
              flex h-9 w-9 cursor-pointer
              items-center justify-center
              rounded-lg text-text-muted
              transition
              hover:bg-red-50
              hover:text-red-600
              dark:hover:bg-red-950/30
            "
            aria-label={`Delete ${task.title}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="mt-3 min-h-12">
        {task.description ? (
          <p className="line-clamp-2 text-sm leading-6 text-text-muted">
            {task.description}
          </p>
        ) : (
          <p className="text-sm italic leading-6 text-text-muted/60">
            No description
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <TaskBadge type="priority" value={task.priority} />

        <TaskBadge type="status" value={task.status} />
      </div>

      <div
        className={[
          "flex items-center gap-2 border-t border-border pt-4 text-xs",
          overdue
            ? "font-medium text-red-500 dark:text-red-300"
            : "text-text-muted",
        ].join(" ")}
      >
        <CalendarDays size={15} />

        {formatDueDate(task.due_date)}

        {overdue && (
          <span className="ml-auto rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-300">
            Overdue
          </span>
        )}
      </div>
    </article>
  );
}
