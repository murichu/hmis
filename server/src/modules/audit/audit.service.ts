import { type Prisma } from "@prisma/client";
import type { Request } from "express";

import { logger } from "../../logger.js";
import { createAuditLog } from "./audit.repository.js";

export type AuditEvent = {
  action: string;
  resource?: string;
  facilityId?: string | undefined;
  userId?: string | undefined;
  metadata?: Prisma.InputJsonValue;
};

function createAuditData(
  event: AuditEvent,
  request?: Request,
): Prisma.AuditLogUncheckedCreateInput {
  const data: Prisma.AuditLogUncheckedCreateInput = { action: event.action };

  if (event.resource) data.resource = event.resource;
  if (event.facilityId) data.facilityId = event.facilityId;
  if (event.userId) data.userId = event.userId;
  if (event.metadata) data.metadata = event.metadata;
  if (request?.ip) data.ipAddress = request.ip;

  const userAgent = request?.get("user-agent");
  if (userAgent) data.userAgent = userAgent;

  return data;
}

export async function writeAuditLog(
  event: AuditEvent,
  request?: Request,
): Promise<void> {
  try {
    await createAuditLog(createAuditData(event, request));
  } catch (error) {
    logger.error("Failed to write audit log", {
      action: event.action,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
