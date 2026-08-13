import { CalendarDays, Clock3, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import Modal from "@/components/ui/Modal";
import TaskBadge from "../shared/TaskBadge";
import type { Task } from "../../task.types";

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function formatDate(value: string | null): string {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function TaskDetailModal({
  task,
  onClose,
  onEdit,
  onDelete,
}: TaskDetailModalProps) {
  const [displayTask, setDisplayTask] = useState(task);

  if (task && task !== displayTask) {
    setDisplayTask(task);
  }

  return (
    <Modal isOpen={Boolean(task)} title="Task details" onClose={onClose}>
      {displayTask && (
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            <TaskBadge type="priority" value={displayTask.priority} />

            <TaskBadge type="status" value={displayTask.status} />
          </div>

          <h3 className="mt-5 text-2xl font-semibold tracking-tight text-text">
            {displayTask.title}
          </h3>

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Description
            </p>

            {displayTask.description ? (
              <p className="whitespace-pre-wrap text-sm leading-7 text-text-muted">
                {displayTask.description}
              </p>
            ) : (
              <p className="text-sm italic text-text-muted/60">
                No description provided.
              </p>
            )}
          </div>

          <div className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
            <div className="flex gap-3">
              <CalendarDays size={18} className="mt-0.5 text-indigo-400" />

              <div>
                <p className="text-xs text-text-muted">Due date</p>

                <p className="mt-1 text-sm font-medium">
                  {formatDate(displayTask.due_date)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Clock3 size={18} className="mt-0.5 text-violet-400" />

              <div>
                <p className="text-xs text-text-muted">Created</p>

                <p className="mt-1 text-sm font-medium">
                  {formatDateTime(displayTask.created_at)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(displayTask);
              }}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30"
            >
              <Trash2 size={16} />
              Delete
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(displayTask);
              }}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              <Pencil size={16} />
              Edit task
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
