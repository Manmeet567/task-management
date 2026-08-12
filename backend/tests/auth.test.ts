import request from "supertest";
import { describe, expect, test } from "vitest";

import app from "../src/app.js";

describe("Auth API", () => {
  test("registers a new user", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe("User registered successfully");

    expect(response.body.data.email).toBe("test@example.com");

    expect(response.body.data.access_token).toEqual(expect.any(String));

    expect(response.body.data.password_hash).toBeUndefined();

    expect(response.body.error).toBeNull();
  });

  test("rejects duplicate email registration", async () => {
    const payload = {
      email: "test@example.com",
      password: "password123",
    };

    await request(app).post("/api/auth/register").send(payload);

    const response = await request(app)
      .post("/api/auth/register")
      .send(payload);

    expect(response.status).toBe(409);

    expect(response.body.success).toBe(false);

    expect(response.body.error.code).toBe("EMAIL_ALREADY_EXISTS");
  });

  test("logs in with valid credentials", async () => {
    await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "password123",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data.email).toBe("test@example.com");

    expect(response.body.data.access_token).toEqual(expect.any(String));
  });

  test("rejects invalid login credentials", async () => {
    await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "password123",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "wrong-password",
    });

    expect(response.status).toBe(401);

    expect(response.body.success).toBe(false);

    expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  test("rejects invalid registration data", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "not-an-email",
      password: "123",
    });

    expect(response.status).toBe(400);

    expect(response.body.success).toBe(false);

    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
