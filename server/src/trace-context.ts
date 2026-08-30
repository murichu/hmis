import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

const traceStorage = new AsyncLocalStorage<string>();

export function getTraceId(): string {
  return traceStorage.getStore() ?? randomUUID();
}

export function runWithTraceId<T>(traceId: string, callback: () => T): T {
  return traceStorage.run(traceId, callback);
}
