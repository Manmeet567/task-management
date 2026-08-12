import { apiRequest } from "../../api/client";

import type {
  CreateTaskInput,
  Task,
  TaskFilters,
  UpdateTaskInput,
} from "./task.types";

export function getTasks(filters: TaskFilters): Promise<Task[]> {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.priority) {
    params.set("priority", filters.priority);
  }

  if (filters.sort_by) {
    params.set("sort_by", filters.sort_by);
  }

  if (filters.sort_order) {
    params.set("sort_order", filters.sort_order);
  }

  const queryString = params.toString();

  const path = queryString ? `/tasks?${queryString}` : "/tasks";

  return apiRequest<Task[]>(path, {
    authenticated: true,
  });
}

export function createTask(input: CreateTaskInput): Promise<Task> {
  return apiRequest<Task>("/tasks", {
    method: "POST",
    authenticated: true,
    body: input,
  });
}

export function updateTask(
  taskId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  return apiRequest<Task>(`/tasks/${taskId}`, {
    method: "PATCH",
    authenticated: true,
    body: input,
  });
}

export function deleteTask(taskId: string): Promise<null> {
  return apiRequest<null>(`/tasks/${taskId}`, {
    method: "DELETE",
    authenticated: true,
  });
}
