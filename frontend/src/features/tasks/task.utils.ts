import type { Task } from "./task.types";

export function isTaskOverdue(task: Task): boolean {
  if (!task.due_date || task.status === "done") {
    return false;
  }

  return new Date(task.due_date).getTime() < Date.now();
}
