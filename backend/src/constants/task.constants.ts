export const TASK_PRIORITIES = ["low", "medium", "high"] as const;

export const TASK_STATUSES = ["to_do", "in_progress", "done"] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export type TaskStatus = (typeof TASK_STATUSES)[number];
