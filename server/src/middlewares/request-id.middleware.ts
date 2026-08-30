import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

import { logger } from "../logger.js";
import { runWithTraceId } from "../trace-context.js";

export const requestIdMiddleware: RequestHandler = (
  request,
  response,
  next,
) => {
  const traceId = randomUUID();
  const startedAt = performance.now();

  response.setHeader("X-Request-Id", traceId);
  response.setHeader("X-Trace-Id", traceId);
  response.on("finish", () => {
    logger.info("HTTP request completed", {
      method: request.method,
      path: request.originalUrl,
      statusCode: response.statusCode,
      durationMs: Math.round(performance.now() - startedAt),
    });
  });

  runWithTraceId(traceId, next);
};
