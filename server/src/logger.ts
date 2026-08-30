import pino from "pino";

import { env } from "./config/index.js";
import { getTraceId } from "./trace-context.js";

type LogContext = Record<string, unknown>;

const pinoLogger = pino({
  level: env.logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
});

function withTraceId(context?: LogContext): LogContext {
  return { ...context, traceId: getTraceId() };
}

export const logger = {
  error(message: string, context?: LogContext) {
    pinoLogger.error(withTraceId(context), message);
  },
  info(message: string, context?: LogContext) {
    pinoLogger.info(withTraceId(context), message);
  },
  warn(message: string, context?: LogContext) {
    pinoLogger.warn(withTraceId(context), message);
  },
};
