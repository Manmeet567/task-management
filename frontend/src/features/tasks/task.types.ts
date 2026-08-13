export type TaskPriority = "low" | "medium" | "high";

export type TaskStatus = "to_do" | "in_progress" | "done";

export type TaskSortBy = "due_date" | "created_at";

export type TaskSortOrder = "asc" | "desc";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  due_date: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  sort_by?: TaskSortBy;
  sort_order?: TaskSortOrder;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string | null;
  status?: TaskStatus;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string | null;
  status?: TaskStatus;
}

export type TaskViewMode = "list" | "board";
