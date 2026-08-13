import { AlertTriangle } from "lucide-react";

import Modal from "@/components/ui/Modal";
import type { Task } from "../../task.types";

interface DeleteTaskModalProps {
  task: Task | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteTaskModal({
  task,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteTaskModalProps) {
  return (
    <Modal
      isOpen={Boolean(task)}
      title="Delete task"
      onClose={onClose}
      closeDisabled={isDeleting}
    >
      <div className="p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300">
          <AlertTriangle size={22} />
        </div>

        <p className="mt-5 text-sm leading-6 text-text-muted">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-text">{task?.title}</span>? This
          action cannot be undone.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-medium text-text-muted transition hover:bg-surface-muted hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="cursor-pointer rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete task"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
