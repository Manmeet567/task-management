import { MongoMemoryServer } from "mongodb-memory-server";

import type { TestProject } from "vitest/node";

declare module "vitest" {
  export interface ProvidedContext {
    MONGO_URI: string;
  }
}

export default async function setup({ provide }: TestProject) {
  const mongoServer = await MongoMemoryServer.create();

  provide("MONGO_URI", mongoServer.getUri());

  return async () => {
    await mongoServer.stop();
  };
}
