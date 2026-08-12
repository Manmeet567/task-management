import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";

import Modal from "../../components/ui/Modal";
import Select, { type SelectOption } from "../../components/ui/Select";

import { taskFormSchema, type TaskFormInput } from "./task.schema";

import type { Task, TaskPriority, TaskStatus } from "./task.types";

const priorityOptions: SelectOption<TaskPriority>[] = [
  {
    label: "Low",
    value: "low",
  },
  {
    label: "Medium",
    value: "medium",
  },
  {
    label: "High",
    value: "high",
  },
];

const statusOptions: SelectOption<TaskStatus>[] = [
  {
    label: "To do",
    value: "to_do",
  },
  {
    label: "In progress",
    value: "in_progress",
  },
  {
    label: "Done",
    value: "done",
  },
];

interface TaskFormModalProps {
  isOpen: boolean;
  task?: Task | null;
  isSubmitting: boolean;

  onClose: () => void;

  onSubmit: (data: TaskFormInput) => void;
}

function getDefaultValues(task?: Task | null): TaskFormInput {
  if (!task) {
    return {
      title: "",
      description: "",
      priority: "medium",
      status: "to_do",
      due_date: "",
    };
  }

  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    due_date: task.due_date?.slice(0, 10) ?? "",
  };
}

export default function TaskFormModal({
  isOpen,
  task,
  isSubmitting,
  onClose,
  onSubmit,
}: TaskFormModalProps) {
  const isEditing = Boolean(task);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormInput>({
    resolver: zodResolver(taskFormSchema),

    defaultValues: getDefaultValues(task),
  });

  useEffect(() => {
    if (isOpen) {
      reset(getDefaultValues(task));
    }
  }, [isOpen, task, reset]);

  return (
    <Modal
      isOpen={isOpen}
      title={isEditing ? "Edit task" : "Create new task"}
      onClose={onClose}
      closeDisabled={isSubmitting}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 p-6"
        noValidate
      >
        <div>
          <label
            htmlFor="task-title"
            className="mb-2 block text-sm font-medium"
          >
            Title
          </label>

          <input
            id="task-title"
            type="text"
            placeholder="What needs to be done?"
            {...register("title")}
            className="
              w-full rounded-xl
              border border-border
              bg-background px-4 py-3
              text-sm text-text outline-none
              transition
              placeholder:text-text-muted/60
              focus:border-primary
              focus:ring-4
              focus:ring-indigo-100
              dark:focus:ring-indigo-950
            "
          />

          {errors.title && (
            <p className="mt-1.5 text-sm text-red-500">
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="task-description"
            className="mb-2 block text-sm font-medium"
          >
            Description
          </label>

          <textarea
            id="task-description"
            rows={4}
            placeholder="Add some details..."
            {...register("description")}
            className="
              w-full resize-none
              rounded-xl
              border border-border
              bg-background px-4 py-3
              text-sm text-text outline-none
              transition
              placeholder:text-text-muted/60
              focus:border-primary
              focus:ring-4
              focus:ring-indigo-100
              dark:focus:ring-indigo-950
            "
          />

          {errors.description && (
            <p className="mt-1.5 text-sm text-red-500">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Priority</label>

            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  options={priorityOptions}
                  placeholder="Priority"
                  onChange={(value) => {
                    if (value) {
                      field.onChange(value);
                    }
                  }}
                />
              )}
            />

            {errors.priority && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.priority.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Status</label>

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  options={statusOptions}
                  placeholder="Status"
                  onChange={(value) => {
                    if (value) {
                      field.onChange(value);
                    }
                  }}
                />
              )}
            />

            {errors.status && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.status.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="task-due-date"
            className="mb-2 block text-sm font-medium"
          >
            Due date
          </label>

          <input
            id="task-due-date"
            type="date"
            {...register("due_date")}
            className="
              w-full rounded-xl
              border border-border
              bg-background px-4 py-3
              text-sm text-text
              outline-none transition
              focus:border-primary
              focus:ring-4
              focus:ring-indigo-100
              dark:focus:ring-indigo-950
            "
          />

          {errors.due_date && (
            <p className="mt-1.5 text-sm text-red-500">
              {errors.due_date.message}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="
              cursor-pointer rounded-xl
              border border-border
              bg-background px-5 py-2.5
              text-sm font-medium
              text-text-muted transition
              hover:bg-surface-muted
              hover:text-text
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="
              cursor-pointer rounded-xl
              bg-primary px-5 py-2.5
              text-sm font-semibold
              text-white transition
              hover:bg-primary-hover
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {isSubmitting
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
                ? "Save changes"
                : "Create task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
