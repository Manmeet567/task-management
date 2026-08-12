import request from "supertest";
import { describe, expect, test } from "vitest";

import app from "../src/app.js";

const PASSWORD = "password123";

async function registerUser(email: string): Promise<string> {
  const response = await request(app).post("/api/auth/register").send({
    email,
    password: PASSWORD,
  });

  return response.body.data.access_token;
}

async function createTask(
  token: string,
  data: {
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high";
    due_date?: string | null;
    status?: "to_do" | "in_progress" | "done";
  },
) {
  return request(app)
    .post("/api/tasks")
    .set("Authorization", `Bearer ${token}`)
    .send(data);
}

describe("Task API", () => {
  test("rejects unauthenticated task access", async () => {
    const response = await request(app).get("/api/tasks");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);

    expect(response.body.error.code).toBe("AUTHENTICATION_REQUIRED");
  });

  test("creates a task for the authenticated user", async () => {
    const token = await registerUser("create@example.com");

    const response = await createTask(token, {
      title: "Finish backend",
      description: "Complete task APIs",
      priority: "high",
      status: "in_progress",
    });

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.data.title).toBe("Finish backend");

    expect(response.body.data.priority).toBe("high");

    expect(response.body.data.status).toBe("in_progress");

    expect(response.body.data.due_date).toBeNull();

    expect(response.body.data.id).toEqual(expect.any(String));

    expect(response.body.data.user_id).toBeUndefined();
  });

  test("returns only tasks belonging to the authenticated user", async () => {
    const firstToken = await registerUser("first@example.com");

    const secondToken = await registerUser("second@example.com");

    await createTask(firstToken, {
      title: "First user task",
    });

    await createTask(secondToken, {
      title: "Second user task",
    });

    const response = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${firstToken}`);

    expect(response.status).toBe(200);

    expect(response.body.data).toHaveLength(1);

    expect(response.body.data[0].title).toBe("First user task");
  });

  test("prevents a user from accessing another user's task", async () => {
    const ownerToken = await registerUser("owner@example.com");

    const otherToken = await registerUser("other@example.com");

    const created = await createTask(ownerToken, {
      title: "Private task",
    });

    const taskId = created.body.data.id;

    const response = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(response.status).toBe(404);

    expect(response.body.error.code).toBe("TASK_NOT_FOUND");
  });

  test("filters tasks by status and priority", async () => {
    const token = await registerUser("filter@example.com");

    await createTask(token, {
      title: "Matching task",
      priority: "high",
      status: "in_progress",
    });

    await createTask(token, {
      title: "Wrong priority",
      priority: "low",
      status: "in_progress",
    });

    await createTask(token, {
      title: "Wrong status",
      priority: "high",
      status: "done",
    });

    const response = await request(app)
      .get("/api/tasks?status=in_progress&priority=high")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data).toHaveLength(1);

    expect(response.body.data[0].title).toBe("Matching task");
  });

  test("sorts tasks by due date", async () => {
    const token = await registerUser("sort@example.com");

    await createTask(token, {
      title: "Later task",
      due_date: "2030-08-20",
    });

    await createTask(token, {
      title: "Earlier task",
      due_date: "2030-08-10",
    });

    const response = await request(app)
      .get("/api/tasks?sort_by=due_date&sort_order=asc")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data).toHaveLength(2);

    expect(response.body.data[0].title).toBe("Earlier task");

    expect(response.body.data[1].title).toBe("Later task");
  });

  test("updates a task partially", async () => {
    const token = await registerUser("update@example.com");

    const created = await createTask(token, {
      title: "Task to update",
      priority: "high",
      due_date: "2030-08-20",
      status: "to_do",
    });

    const taskId = created.body.data.id;

    const response = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        status: "done",
        priority: "low",
        due_date: null,
      });

    expect(response.status).toBe(200);

    expect(response.body.data.title).toBe("Task to update");

    expect(response.body.data.status).toBe("done");

    expect(response.body.data.priority).toBe("low");

    expect(response.body.data.due_date).toBeNull();
  });

  test("deletes a task", async () => {
    const token = await registerUser("delete@example.com");

    const created = await createTask(token, {
      title: "Delete me",
    });

    const taskId = created.body.data.id;

    const deleteResponse = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.success).toBe(true);
    expect(deleteResponse.body.data).toBeNull();

    const getResponse = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getResponse.status).toBe(404);

    expect(getResponse.body.error.code).toBe("TASK_NOT_FOUND");
  });

  test("returns correct dashboard statistics", async () => {
    const token = await registerUser("dashboard@example.com");

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await createTask(token, {
      title: "Overdue todo",
      status: "to_do",
      due_date: yesterday,
    });

    await createTask(token, {
      title: "Future task",
      status: "in_progress",
      due_date: tomorrow,
    });

    await createTask(token, {
      title: "Completed old task",
      status: "done",
      due_date: yesterday,
    });

    const response = await request(app)
      .get("/api/tasks/dashboard")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    expect(response.body.data).toEqual({
      total_tasks: 3,
      by_status: {
        to_do: 1,
        in_progress: 1,
        done: 1,
      },
      overdue_tasks: 1,
    });
  });
});
