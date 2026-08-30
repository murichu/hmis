import { type Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma.js";

export function createAuditLog(data: Prisma.AuditLogUncheckedCreateInput) {
  return prisma.auditLog.create({ data });
}
