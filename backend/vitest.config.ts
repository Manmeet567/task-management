import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",

    globalSetup: ["./tests/global-setup.ts"],

    setupFiles: ["./tests/setup.ts"],

    fileParallelism: false,

    env: {
      NODE_ENV: "test",

      PORT: "5001",

      MONGODB_URI: "mongodb://127.0.0.1:27017/test-placeholder",

      CLIENT_ORIGIN: "http://localhost:5173",

      JWT_SECRET: "hNxDYzJrlsouumeFqiCQSufIZ8Pz0GhZ",

      JWT_EXPIRES_IN: "1h",
    },
  },
});
