import mongoose from "mongoose";

import { connectDatabase } from "../config/database.js";
import { getEnv } from "../config/env.js";
import { Task } from "../modules/tasks/task.model.js";
import { User } from "../modules/users/user.model.js";
import { hashPassword } from "../utils/password.js";

const DEMO_EMAIL = "demo@example.com";
const DEMO_PASSWORD = "DemoPassword123!";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

async function seed(): Promise<void> {
  const env = getEnv();

  if (env.NODE_ENV === "production") {
    throw new Error("Seeding is disabled in production");
  }

  await connectDatabase(env.MONGODB_URI);

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  let user = await User.findOne({
    email: DEMO_EMAIL,
  }).exec();

  if (!user) {
    user = await User.create({
      email: DEMO_EMAIL,
      password_hash: passwordHash,
    });
  } else {
    await User.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          password_hash: passwordHash,
        },
      },
    ).exec();
  }

  await Task.deleteMany({
    user_id: user._id,
  }).exec();

  const now = Date.now();

  await Task.insertMany([
    {
      user_id: user._id,
      title: "Finish project documentation",
      description: "Complete README and architecture notes",
      priority: "high",
      status: "in_progress",
      due_date: new Date(now + DAY_IN_MS),
    },
    {
      user_id: user._id,
      title: "Review task API",
      description: "Check CRUD endpoints and edge cases",
      priority: "medium",
      status: "to_do",
      due_date: new Date(now - DAY_IN_MS),
    },
    {
      user_id: user._id,
      title: "Prepare demo",
      description: "Prepare the application for demonstration",
      priority: "high",
      status: "to_do",
      due_date: new Date(now + 2 * DAY_IN_MS),
    },
    {
      user_id: user._id,
      title: "Configure database",
      description: "MongoDB configuration completed",
      priority: "low",
      status: "done",
      due_date: new Date(now - 2 * DAY_IN_MS),
    },
    {
      user_id: user._id,
      title: "Future improvements",
      description: "Keep track of optional improvements",
      priority: "low",
      status: "to_do",
      due_date: null,
    },
  ]);

  console.log("Database seeded successfully");
  console.log(`Demo user: ${DEMO_EMAIL}`);
  console.log(`Demo password: ${DEMO_PASSWORD}`);
}

void seed()
  .catch((error: unknown) => {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
