import { describe, expect, it } from "vitest";

import { taskFormSchema } from "./task.schema";

describe("taskFormSchema", () => {
  it("rejects a task without a title", () => {
    const result = taskFormSchema.safeParse({
      title: "",
      description: "",
      priority: "medium",
      status: "to_do",
      due_date: "",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a valid task", () => {
    const result = taskFormSchema.safeParse({
      title: "Finish assignment",
      description: "Complete final frontend QA",
      priority: "high",
      status: "in_progress",
      due_date: "2026-08-13",
    });

    expect(result.success).toBe(true);
  });
});
