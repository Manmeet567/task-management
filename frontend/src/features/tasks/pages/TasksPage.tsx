import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ApiClientError } from "@/api/client";
import TaskCard from "../components/list/TaskCard";
import {
  ChevronDown,
  Columns3,
  LayoutGrid,
  ListFilter,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import KanbanBoard from "../components/board/KanbanBoard";
import Select, { type SelectOption } from "@/components/ui/Select";
import type { TaskFormInput } from "../task.schema";
import type {
  Task,
  TaskFilters,
  TaskPriority,
  TaskSortBy,
  TaskSortOrder,
  TaskStatus,
  TaskViewMode,
} from "../task.types";
import TaskFormModal from "../components/modals/TaskFormModal";
import DeleteTaskModal from "../components/modals/DeleteTaskModal";
import TaskDetailModal from "../components/modals/TaskDetailModal";
import { createTask, deleteTask, getTasks, updateTask } from "../api/task.api";
import { useToastStore } from "@/stores/toast.store";
import type { ReactNode } from "react";
import { useTaskViewStore } from "../task-view.store";

const defaultFilters: TaskFilters = {
  sort_by: "created_at",
  sort_order: "desc",
};

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

const sortByOptions: SelectOption<TaskSortBy>[] = [
  {
    label: "Creation date",
    value: "created_at",
  },
  {
    label: "Due date",
    value: "due_date",
  },
];

const sortOrderOptions: SelectOption<TaskSortOrder>[] = [
  {
    label: "Newest / Latest first",
    value: "desc",
  },
  {
    label: "Oldest / Earliest first",
    value: "asc",
  },
];

export default function TasksPage() {
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const queryClient = useQueryClient();
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const viewMode = useTaskViewStore((state) => state.viewMode);

  const setViewMode = useTaskViewStore((state) => state.setViewMode);

  const showToast = useToastStore((state) => state.showToast);

  const switchView = (mode: TaskViewMode) => {
    setViewMode(mode);

    if (mode === "board") {
      setFilters((current) => ({
        ...current,
        status: undefined,
      }));
    }
  };

  const tasksQueryKey = ["tasks", filters] as const;

  const {
    data: tasks,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: tasksQueryKey,

    queryFn: () => getTasks(filters),
  });

  const resetFilters = () => {
    setFilters({
      ...defaultFilters,
    });
  };

  const activeFilterCount =
    Number(Boolean(filters.status)) + Number(Boolean(filters.priority));

  const removeStatusFilter = () => {
    setFilters((current) => ({
      ...current,
      status: undefined,
    }));
  };

  const removePriorityFilter = () => {
    setFilters((current) => ({
      ...current,
      priority: undefined,
    }));
  };

  const refreshTaskData = async (): Promise<void> => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      }),
    ]);
  };

  const createMutation = useMutation({
    mutationFn: createTask,

    onSuccess: async () => {
      setTaskFormOpen(false);

      showToast("Task created successfully");

      await refreshTaskData();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: TaskFormInput }) =>
      updateTask(taskId, {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        due_date: data.due_date || null,
      }),

    onSuccess: async () => {
      setEditingTask(null);
      setTaskFormOpen(false);

      showToast("Task updated successfully");

      await refreshTaskData();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,

    onSuccess: async () => {
      setDeletingTask(null);

      showToast("Task deleted successfully");

      await refreshTaskData();
    },
  });

  const mutationError =
    createMutation.error ?? updateMutation.error ?? deleteMutation.error;

  const handleTaskSubmit = (data: TaskFormInput) => {
    if (editingTask) {
      updateMutation.mutate({
        taskId: editingTask.id,
        data,
      });

      return;
    }

    createMutation.mutate({
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      due_date: data.due_date || null,
    });
  };

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      updateTask(taskId, {
        status,
      }),

    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({
        queryKey: tasksQueryKey,
        exact: true,
      });

      const previousTasks = queryClient.getQueryData<Task[]>(tasksQueryKey);

      queryClient.setQueryData<Task[]>(tasksQueryKey, (currentTasks) => {
        if (!currentTasks) {
          return currentTasks;
        }

        return currentTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status,
              }
            : task,
        );
      });

      return {
        previousTasks,
        queryKey: tasksQueryKey,
      };
    },

    onError: (error, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(context.queryKey, context.previousTasks);
      }

      const statusLabel =
        variables.status === "to_do"
          ? "To do"
          : variables.status === "in_progress"
            ? "In progress"
            : "Done";

      showToast(
        error instanceof ApiClientError
          ? error.message
          : `Unable to move task to ${statusLabel}`,
        "error",
      );
    },

    onSuccess: () => {
      showToast("Task status updated");
    },

    onSettled: async () => {
      await refreshTaskData();
    },
  });

  const handleStatusChange = (task: Task, status: TaskStatus) => {
    statusMutation.mutate({
      taskId: task.id,
      status,
    });
  };

  let taskContent: ReactNode;

  if (error) {
    taskContent = (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
        <p className="font-medium text-red-700 dark:text-red-300">
          Unable to load tasks
        </p>

        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error instanceof ApiClientError
            ? error.message
            : "Something went wrong."}
        </p>

        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 cursor-pointer rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
      </div>
    );
  } else if (isPending) {
    taskContent = (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <div
            key={index}
            className="h-48 animate-pulse rounded-2xl border border-border bg-surface"
          />
        ))}
      </div>
    );
  } else if (!tasks?.length) {
    taskContent = (
      <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-indigo-600 dark:text-indigo-300">
          <ListFilter size={21} />
        </div>

        <h2 className="mt-4 font-semibold">No tasks found</h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-muted">
          Create your first task or adjust the current filters.
        </p>
      </div>
    );
  } else if (viewMode === "board") {
    taskContent = (
      <KanbanBoard
        tasks={tasks}
        onViewTask={setViewingTask}
        onStatusChange={handleStatusChange}
      />
    );
  } else {
    taskContent = (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onView={setViewingTask}
            onEdit={(taskToEdit) => {
              setEditingTask(taskToEdit);
              setTaskFormOpen(true);
            }}
            onDelete={setDeletingTask}
          />
        ))}
      </div>
    );
  }

  return (
    <section>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-500 dark:text-indigo-300">
            Workspace
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Tasks</h1>

          <p className="mt-2 text-sm text-text-muted">
            Manage and organise your work.
          </p>
        </div>

        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
          <div className="flex w-fit shrink-0 rounded-xl border border-border bg-surface p-1">
            <button
              type="button"
              onClick={() => switchView("list")}
              className={[
                "inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                viewMode === "list"
                  ? "bg-accent-soft text-indigo-700 dark:text-indigo-200"
                  : "text-text-muted hover:text-text",
              ].join(" ")}
            >
              <LayoutGrid size={15} />
              List
            </button>

            <button
              type="button"
              onClick={() => switchView("board")}
              className={[
                "inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                viewMode === "board"
                  ? "bg-accent-soft text-indigo-700 dark:text-indigo-200"
                  : "text-text-muted hover:text-text",
              ].join(" ")}
            >
              <Columns3 size={15} />
              Board
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingTask(null);
              setTaskFormOpen(true);
            }}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover sm:px-4"
          >
            <Plus size={17} />
            New task
          </button>
        </div>
      </div>

      {mutationError && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {mutationError instanceof ApiClientError
            ? mutationError.message
            : "Something went wrong. Please try again."}
        </div>
      )}

      <div className="mb-6 overflow-visible rounded-2xl border border-border bg-surface">
        {/* Mobile Filters Header */}
        <button
          type="button"
          onClick={() => setMobileFiltersOpen((current) => !current)}
          aria-expanded={mobileFiltersOpen}
          className="flex w-full cursor-pointer items-center justify-between gap-3 p-4 text-sm font-medium sm:hidden"
        >
          <span className="flex items-center gap-2">
            <ListFilter size={17} />
            Filters & sorting
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-soft px-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-200">
                {activeFilterCount}
              </span>
            )}
          </span>

          <ChevronDown
            size={17}
            className={[
              "shrink-0 text-text-muted transition-transform duration-200",
              mobileFiltersOpen ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>

        {/* Desktop Filters Header */}
        <div className="hidden items-center justify-between p-4 pb-0 sm:flex">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ListFilter size={17} />
            Filters & sorting
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-soft px-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-200">
                {activeFilterCount}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-text-muted transition hover:text-text"
          >
            <RotateCcw size={14} />
            Reset all
          </button>
        </div>

        {/* Filters Body */}
        <div
          className={[
            "border-t border-border p-4 sm:block sm:border-t-0",
            mobileFiltersOpen ? "block" : "hidden",
          ].join(" ")}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Status */}
            <Select
              value={filters.status ?? ""}
              options={statusOptions}
              placeholder="All statuses"
              onChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  status: value || undefined,
                }))
              }
            />

            {/* Priority */}
            <Select
              value={filters.priority ?? ""}
              options={priorityOptions}
              placeholder="All priorities"
              onChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  priority: value || undefined,
                }))
              }
            />

            {/* Sort By */}
            <Select
              value={filters.sort_by ?? "created_at"}
              options={sortByOptions}
              placeholder="Sort by"
              onChange={(value) => {
                if (!value) {
                  return;
                }

                setFilters((current) => ({
                  ...current,
                  sort_by: value,
                }));
              }}
            />

            {/* Sort Order */}
            <Select
              value={filters.sort_order ?? "desc"}
              options={sortOrderOptions}
              placeholder="Sort order"
              onChange={(value) => {
                if (!value) {
                  return;
                }

                setFilters((current) => ({
                  ...current,
                  sort_order: value,
                }));
              }}
            />
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <span className="mr-1 text-xs font-medium text-text-muted">
                Active:
              </span>

              {filters.status && (
                <button
                  type="button"
                  onClick={removeStatusFilter}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 dark:text-indigo-200 dark:hover:bg-indigo-900/50"
                >
                  Status:{" "}
                  {
                    statusOptions.find(
                      (option) => option.value === filters.status,
                    )?.label
                  }
                  <X size={13} />
                </button>
              )}

              {filters.priority && (
                <button
                  type="button"
                  onClick={removePriorityFilter}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 dark:text-indigo-200 dark:hover:bg-indigo-900/50"
                >
                  Priority:{" "}
                  {
                    priorityOptions.find(
                      (option) => option.value === filters.priority,
                    )?.label
                  }
                  <X size={13} />
                </button>
              )}
            </div>
          )}

          {/* Mobile Reset */}
          <div className="mt-4 flex justify-end sm:hidden">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-text-muted transition hover:text-text"
            >
              <RotateCcw size={14} />
              Reset all
            </button>
          </div>
        </div>
      </div>

      {taskContent}

      <TaskFormModal
        isOpen={taskFormOpen}
        task={editingTask}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          if (createMutation.isPending || updateMutation.isPending) {
            return;
          }

          setTaskFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
      />

      <TaskDetailModal
        task={viewingTask}
        onClose={() => setViewingTask(null)}
        onEdit={(taskToEdit) => {
          setEditingTask(taskToEdit);
          setTaskFormOpen(true);
        }}
        onDelete={(taskToDelete) => {
          setDeletingTask(taskToDelete);
        }}
      />

      <DeleteTaskModal
        task={deletingTask}
        isDeleting={deleteMutation.isPending}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setDeletingTask(null);
          }
        }}
        onConfirm={() => {
          if (deletingTask) {
            deleteMutation.mutate(deletingTask.id);
          }
        }}
      />
    </section>
  );
}
