import "dotenv/config";
import app from "./app.js";
import { env } from "./config/env.js";
import { disconnectPrisma } from "./lib/prisma.js";
import { ensureMinioBucket } from "./lib/minio.js";
import { logger } from "./lib/logger.js";

async function startServer(): Promise<void> {
  await ensureMinioBucket();

  const server = app.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, env: env.NODE_ENV, apiPrefix: env.API_PREFIX },
      "Server started",
    );
  });

  function shutdown(signal: string): void {
    logger.info({ signal }, "Shutting down gracefully");

    server.close(async () => {
      await disconnectPrisma();
      logger.info("Server closed");
      process.exit(0);
    });

    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000).unref();
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch((error) => {
  logger.fatal({ err: error }, "Failed to start server");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception");
  process.exit(1);
});
