import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { getEnv } from "./config/env.js";

async function startServer(): Promise<void> {
  try {
    const env = getEnv();
    await connectDatabase(env.MONGODB_URI);

    app.listen(env.PORT, () => {
      console.log(`[Server] running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("[Failed] to start server:", error);
    process.exit(1);
  }
}

void startServer();
