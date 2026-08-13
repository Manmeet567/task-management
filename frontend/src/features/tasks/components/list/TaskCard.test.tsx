import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "@/test/render";

import TaskCard from "./TaskCard";

import type { Task } from "../../task.types";

const task: Task = {
  id: "task-1",
  title: "Build dashboard",
  description: "Finish the dashboard interface",
  priority: "high",
  status: "in_progress",
  due_date: "2026-08-20T23:59:59.999Z",
  created_at: "2026-08-10T10:00:00.000Z",
  updated_at: "2026-08-10T10:00:00.000Z",
};

describe("TaskCard", () => {
  it("renders task information", () => {
    renderWithProviders(
      <TaskCard
        task={task}
        onView={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("Build dashboard")).toBeInTheDocument();

    expect(
      screen.getByText("Finish the dashboard interface"),
    ).toBeInTheDocument();

    expect(screen.getByText("High")).toBeInTheDocument();

    expect(screen.getByText("In progress")).toBeInTheDocument();
  });

  it("opens the task when the card is clicked", async () => {
    const onView = vi.fn();

    const { user } = renderWithProviders(
      <TaskCard
        task={task}
        onView={onView}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByText("Build dashboard"));

    expect(onView).toHaveBeenCalledOnce();

    expect(onView).toHaveBeenCalledWith(task);
  });

  it("edits the task without triggering the card view", async () => {
    const onView = vi.fn();
    const onEdit = vi.fn();

    const { user } = renderWithProviders(
      <TaskCard
        task={task}
        onView={onView}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: `Edit ${task.title}`,
      }),
    );

    expect(onEdit).toHaveBeenCalledWith(task);

    expect(onView).not.toHaveBeenCalled();
  });

  it("deletes the task without triggering the card view", async () => {
    const onView = vi.fn();
    const onDelete = vi.fn();

    const { user } = renderWithProviders(
      <TaskCard
        task={task}
        onView={onView}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: `Delete ${task.title}`,
      }),
    );

    expect(onDelete).toHaveBeenCalledWith(task);

    expect(onView).not.toHaveBeenCalled();
  });
});
