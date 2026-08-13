import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { TaskViewMode } from "./task.types";

interface TaskViewState {
  viewMode: TaskViewMode;

  setViewMode: (viewMode: TaskViewMode) => void;
}

export const useTaskViewStore = create<TaskViewState>()(
  persist(
    (set) => ({
      viewMode: "list",

      setViewMode: (viewMode) => {
        set({
          viewMode,
        });
      },
    }),
    {
      name: "task-management-task-view",
    },
  ),
);
