import { prisma } from "../../database/prisma.js";

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
        },
      },
    },
  });
}

export function findUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
        },
      },
    },
  });
}

export function createSession(data: {
  userId: string;
  refreshTokenHash: string;
  familyId: string;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}) {
  return prisma.session.create({
    data: {
      userId: data.userId,
      refreshTokenHash: data.refreshTokenHash,
      familyId: data.familyId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ...(data.ipAddress ? { ipAddress: data.ipAddress } : {}),
      ...(data.userAgent ? { userAgent: data.userAgent } : {}),
    },
  });
}

export function findSessionByHash(refreshTokenHash: string) {
  return prisma.session.findUnique({
    where: { refreshTokenHash },
    include: { user: true },
  });
}

export function revokeSession(sessionId: string) {
  return prisma.session.update({
    where: { id: sessionId },
    data: { revokedAt: new Date() },
  });
}

export function revokeSessionFamily(familyId: string) {
  return prisma.session.updateMany({
    where: { familyId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export function recordFailedLogin(userId: string, failedLoginCount: number) {
  const lockedUntil =
    failedLoginCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : undefined;
  return prisma.user.update({
    where: { id: userId },
    data: { failedLoginCount, ...(lockedUntil ? { lockedUntil } : {}) },
  });
}

export function recordSuccessfulLogin(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
  });
}
