import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { logger } from "../logger.js";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  if (error instanceof ZodError) {
    return response.status(400).json({
      error: "Invalid request data",
      details: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  logger.error("Unhandled application error", {
    error: error instanceof Error ? error.message : String(error),
  });
  return response.status(500).json({ error: "Internal server error" });
};
