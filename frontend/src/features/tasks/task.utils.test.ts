import { describe, expect, it, vi } from "vitest";

import { isTaskOverdue } from "./task.utils";

import type { Task } from "./task.types";

const baseTask: Task = {
  id: "task-1",
  title: "Example task",
  description: "",
  priority: "medium",
  status: "to_do",
  due_date: null,
  created_at: "2026-08-10T10:00:00.000Z",
  updated_at: "2026-08-10T10:00:00.000Z",
};

describe("isTaskOverdue", () => {
  it("returns false when the task has no due date", () => {
    expect(isTaskOverdue(baseTask)).toBe(false);
  });

  it("returns true when an incomplete task is past its due date", () => {
    vi.setSystemTime(new Date("2026-08-13T12:00:00.000Z"));

    const task: Task = {
      ...baseTask,
      due_date: "2026-08-12T23:59:59.999Z",
    };

    expect(isTaskOverdue(task)).toBe(true);

    vi.useRealTimers();
  });

  it("returns false when a completed task is past its due date", () => {
    vi.setSystemTime(new Date("2026-08-13T12:00:00.000Z"));

    const task: Task = {
      ...baseTask,
      status: "done",
      due_date: "2026-08-12T23:59:59.999Z",
    };

    expect(isTaskOverdue(task)).toBe(false);

    vi.useRealTimers();
  });

  it("returns false when the due date is in the future", () => {
    vi.setSystemTime(new Date("2026-08-13T12:00:00.000Z"));

    const task: Task = {
      ...baseTask,
      due_date: "2026-08-15T23:59:59.999Z",
    };

    expect(isTaskOverdue(task)).toBe(false);

    vi.useRealTimers();
  });
});
