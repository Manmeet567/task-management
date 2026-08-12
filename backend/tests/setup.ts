import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, inject } from "vitest";

const mongoUri = inject("MONGO_URI");

beforeAll(async () => {
  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  const collections = Object.values(mongoose.connection.collections);

  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
});
