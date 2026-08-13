import { useDraggable } from "@dnd-kit/react";
import { CalendarDays, GripVertical } from "lucide-react";

import TaskBadge from "../shared/TaskBadge";
import { isTaskOverdue } from "../../task.utils";
import type { Task } from "../../task.types";

interface KanbanCardProps {
  task: Task;
  onView: (task: Task) => void;
}

function formatDueDate(dueDate: string | null): string {
  if (!dueDate) {
    return "No due date";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dueDate));
}

export default function KanbanCard({ task, onView }: KanbanCardProps) {
  const { ref, handleRef, isDragging } = useDraggable({
    id: task.id,
    type: "task",
  });

  const overdue = isTaskOverdue(task);

  return (
    <article
      ref={ref}
      tabIndex={0}
      onClick={() => onView(task)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onView(task);
        }
      }}
      className={[
        `
          cursor-pointer rounded-2xl
          border border-border
          bg-surface p-4 shadow-sm
          outline-none transition
          hover:border-indigo-200
          hover:shadow-md
          focus-visible:ring-4
          focus-visible:ring-indigo-100
          dark:hover:border-indigo-900
          dark:focus-visible:ring-indigo-950
        `,
        isDragging ? "opacity-40" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <TaskBadge type="priority" value={task.priority} />

        <button
          ref={handleRef}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
          }}
          aria-label={`Drag ${task.title}`}
          title="Drag task"
          className="
            flex h-8 w-8
            cursor-grab items-center
            justify-center rounded-lg
            text-text-muted
            transition
            hover:bg-surface-muted
            hover:text-text
            active:cursor-grabbing
            touch-none
          "
        >
          <GripVertical size={17} />
        </button>
      </div>

      <h3 className="mt-4 line-clamp-2 font-semibold leading-6 text-text">
        {task.title}
      </h3>

      <div className="mt-2 min-h-11">
        {task.description ? (
          <p className="line-clamp-2 text-sm leading-5.5 text-text-muted">
            {task.description}
          </p>
        ) : (
          <p className="text-sm italic text-text-muted/50">No description</p>
        )}
      </div>

      <div
        className={[
          "mt-4 flex items-center gap-2 border-t border-border pt-3 text-xs",
          overdue
            ? "font-medium text-red-500 dark:text-red-300"
            : "text-text-muted",
        ].join(" ")}
      >
        <CalendarDays size={14} />

        {formatDueDate(task.due_date)}

        {overdue && (
          <span className="ml-auto rounded-full bg-red-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:bg-red-950/30 dark:text-red-300">
            Overdue
          </span>
        )}
      </div>
    </article>
  );
}
