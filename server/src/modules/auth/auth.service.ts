import { randomUUID, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";

import { env } from "../../config/index.js";
import { writeAuditLog } from "../audit/index.js";
import { verifyPassword } from "../../shared/security/password.js";
import {
  createAccessToken,
  createTwoFactorChallenge,
  createRefreshToken,
  hashRefreshToken,
  verifyTwoFactorChallenge,
} from "../../shared/security/tokens.js";
import { verifyTotp } from "../../shared/security/totp.js";
import {
  createSession,
  findSessionByHash,
  findUserByEmail,
  findUserById,
  recordFailedLogin,
  recordSuccessfulLogin,
  revokeSession,
  revokeSessionFamily,
} from "./auth.repository.js";

const accessCookie = "access_token";
const csrfCookie = "csrf_token";
const refreshCookie = "refresh_token";

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: env.nodeEnv === "production",
  };
}

function setSessionCookies(
  response: Response,
  accessToken: string,
  refreshToken: string,
) {
  response.cookie(accessCookie, accessToken, {
    ...cookieOptions(),
    maxAge: 15 * 60 * 1000,
    path: "/",
  });
  response.cookie(refreshCookie, refreshToken, {
    ...cookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/v1/auth",
  });
  response.cookie(csrfCookie, createRefreshToken(), {
    httpOnly: false,
    sameSite: "strict",
    secure: env.nodeEnv === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearSessionCookies(response: Response) {
  response.clearCookie(accessCookie, { ...cookieOptions(), path: "/" });
  response.clearCookie(refreshCookie, {
    ...cookieOptions(),
    path: "/api/v1/auth",
  });
  response.clearCookie(csrfCookie, {
    httpOnly: false,
    sameSite: "strict",
    secure: env.nodeEnv === "production",
    path: "/",
  });
}

function validateCsrf(request: Request): boolean {
  const header = request.get("x-csrf-token");
  const cookie = request.cookies[csrfCookie] as string | undefined;
  if (!header || !cookie || header.length !== cookie.length) return false;
  return timingSafeEqual(Buffer.from(header), Buffer.from(cookie));
}

async function issueSession(
  response: Response,
  request: Request,
  user: { id: string; facilityId: string | null },
) {
  const refreshToken = createRefreshToken();
  await createSession({
    userId: user.id,
    refreshTokenHash: hashRefreshToken(refreshToken),
    familyId: randomUUID(),
    ipAddress: request.ip,
    userAgent: request.get("user-agent") ?? undefined,
  });
  setSessionCookies(
    response,
    await createAccessToken({ userId: user.id, facilityId: user.facilityId }),
    refreshToken,
  );
}

export async function login(
  email: string,
  password: string,
  request: Request,
  response: Response,
) {
  const user = await findUserByEmail(email.toLowerCase());
  const invalid =
    !user ||
    user.status !== "ACTIVE" ||
    (user.lockedUntil !== null && user.lockedUntil > new Date()) ||
    !(await verifyPassword(user.passwordHash, password));
  if (invalid) {
    if (user) {
      await recordFailedLogin(user.id, user.failedLoginCount + 1);
      await writeAuditLog(
        {
          action: "LOGIN_FAILED",
          facilityId: user.facilityId ?? undefined,
          userId: user.id,
        },
        request,
      );
    } else {
      await writeAuditLog({ action: "LOGIN_FAILED" }, request);
    }
    return { status: 401, body: { error: "Invalid credentials" } };
  }

  if (!user.mfaEnabled) {
    await writeAuditLog(
      {
        action: "TWO_FACTOR_ENROLLMENT_REQUIRED",
        facilityId: user.facilityId ?? undefined,
        userId: user.id,
      },
      request,
    );
    return {
      status: 403,
      body: { error: "Two-factor authentication enrollment is required" },
    };
  }

  if (user.mfaEnabled) {
    await writeAuditLog(
      {
        action: "TWO_FACTOR_CHALLENGE",
        facilityId: user.facilityId ?? undefined,
        userId: user.id,
      },
      request,
    );
    return {
      status: 200,
      body: {
        twoFactorRequired: true,
        challenge: await createTwoFactorChallenge(user.id),
      },
    };
  }

  await recordSuccessfulLogin(user.id);
  await issueSession(response, request, user);
  await writeAuditLog(
    {
      action: "LOGIN_SUCCESS",
      facilityId: user.facilityId ?? undefined,
      userId: user.id,
    },
    request,
  );
  return { status: 200, body: { twoFactorRequired: false } };
}

export async function verifyTwoFactor(
  challenge: string,
  code: string,
  request: Request,
  response: Response,
) {
  const { userId } = await verifyTwoFactorChallenge(challenge);
  const user = await findUserById(userId);
  if (
    user?.status !== "ACTIVE" ||
    !user.mfaEnabled ||
    !user.mfaSecretEncrypted ||
    !(await verifyTotp(user.mfaSecretEncrypted, code))
  ) {
    await writeAuditLog(
      {
        action: "TWO_FACTOR_FAILED",
        facilityId: user?.facilityId ?? undefined,
        userId,
      },
      request,
    );
    return { status: 401, body: { error: "Invalid two-factor code" } };
  }

  await recordSuccessfulLogin(user.id);
  await issueSession(response, request, user);
  await writeAuditLog(
    {
      action: "LOGIN_SUCCESS",
      facilityId: user.facilityId ?? undefined,
      userId: user.id,
    },
    request,
  );
  return { status: 200, body: { twoFactorRequired: false } };
}

export async function refresh(request: Request, response: Response) {
  if (!validateCsrf(request))
    return { status: 403, body: { error: "Invalid CSRF token" } };
  const refreshToken = request.cookies[refreshCookie] as string | undefined;
  if (!refreshToken)
    return { status: 401, body: { error: "Refresh token required" } };
  const session = await findSessionByHash(hashRefreshToken(refreshToken));
  if (
    !session ||
    session.revokedAt ||
    session.expiresAt <= new Date() ||
    session.user.status !== "ACTIVE"
  ) {
    if (session) await revokeSessionFamily(session.familyId);
    await writeAuditLog(
      {
        action: "TOKEN_REUSE_DETECTED",
        facilityId: session?.user.facilityId ?? undefined,
        userId: session?.userId,
      },
      request,
    );
    clearSessionCookies(response);
    return { status: 401, body: { error: "Invalid refresh token" } };
  }

  await revokeSession(session.id);
  await issueSession(response, request, session.user);
  await writeAuditLog(
    {
      action: "TOKEN_REFRESHED",
      facilityId: session.user.facilityId ?? undefined,
      userId: session.userId,
    },
    request,
  );
  return { status: 200, body: { success: true } };
}

export async function logout(request: Request, response: Response) {
  if (!validateCsrf(request))
    return { status: 403, body: { error: "Invalid CSRF token" } };
  const refreshToken = request.cookies[refreshCookie] as string | undefined;
  const session = refreshToken
    ? await findSessionByHash(hashRefreshToken(refreshToken))
    : null;
  if (session && !session.revokedAt) await revokeSession(session.id);
  clearSessionCookies(response);
  await writeAuditLog(
    {
      action: "LOGOUT",
      facilityId: session?.user.facilityId ?? undefined,
      userId: session?.userId,
    },
    request,
  );
  return { status: 204, body: undefined };
}
