import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { env } from "./config/index.js";
import {
  errorMiddleware,
  notFoundMiddleware,
  requestIdMiddleware,
} from "./middlewares/index.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(requestIdMiddleware);
  app.use(helmet());
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  app.use(cookieParser());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );

  app.use("/api/v1", apiRouter);
  app.get("/api/health", (_request, response) =>
    response.status(200).json({ status: "ok" }),
  );
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
