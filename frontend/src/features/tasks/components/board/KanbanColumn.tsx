import { useDroppable } from "@dnd-kit/react";
import KanbanCard from "./KanbanCard";
import type { Task, TaskStatus } from "../../task.types";

interface KanbanColumnProps {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  onViewTask: (task: Task) => void;
}

export default function KanbanColumn({
  status,
  label,
  tasks,
  onViewTask,
}: KanbanColumnProps) {
  const { ref, isDropTarget } = useDroppable({
    id: status,
    accept: "task",
  });

  return (
    <section
      ref={ref}
      className={[
        `
          flex min-h-130
          w-[320px] shrink-0
          flex-col rounded-2xl
          border bg-surface-muted/50
          p-3 transition
          xl:w-auto xl:min-w-0
        `,
        isDropTarget ? "border-primary bg-accent-soft/40" : "border-border",
      ].join(" ")}
    >
      <header className="flex items-center justify-between px-2 pb-3 pt-1">
        <div className="flex items-center gap-2">
          <span
            className={[
              "h-2.5 w-2.5 rounded-full",
              status === "to_do"
                ? "bg-slate-400"
                : status === "in_progress"
                  ? "bg-indigo-400"
                  : "bg-emerald-400",
            ].join(" ")}
          />

          <h2 className="text-sm font-semibold text-text">{label}</h2>
        </div>

        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-surface px-2 text-xs font-semibold text-text-muted">
          {tasks.length}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-3">
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} onView={onViewTask} />
        ))}

        {tasks.length === 0 && (
          <div
            className={[
              `
                flex flex-1 items-center
                justify-center rounded-xl
                border border-dashed
                px-5 py-10 text-center
                text-xs text-text-muted
                transition
              `,
              isDropTarget ? "border-primary" : "border-border",
            ].join(" ")}
          >
            Drop tasks here
          </div>
        )}
      </div>
    </section>
  );
}
