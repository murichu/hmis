import { env } from "./config/index.js";
import { logger } from "./logger.js";
import { createApp } from "./app.js";

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info("HMIS API listening", {
    port: env.port,
    environment: env.nodeEnv,
  });
});

function shutdown(signal: string) {
  logger.info("Shutdown signal received", { signal });
  server.close((error?: Error) => {
    if (error) {
      logger.error("HTTP server shutdown failed", { error: error.message });
      process.exitCode = 1;
    } else {
      logger.info("HTTP server stopped");
    }
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
