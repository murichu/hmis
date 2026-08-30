import type { RequestHandler } from "express";

import { writeAuditLog } from "../modules/audit/index.js";
import { findUserById } from "../modules/auth/auth.repository.js";
import { verifyAccessToken } from "../shared/security/tokens.js";

export const requireAuth: RequestHandler = async (request, response, next) => {
  const token = request.cookies.access_token as string | undefined;
  if (!token)
    return response.status(401).json({ error: "Authentication required" });

  try {
    request.auth = await verifyAccessToken(token);
    return next();
  } catch {
    return response
      .status(401)
      .json({ error: "Invalid or expired access token" });
  }
};

export function requirePermission(
  resource: string,
  action: string,
): RequestHandler {
  return async (request, response, next) => {
    if (!request.auth)
      return response.status(401).json({ error: "Authentication required" });

    const user = await findUserById(request.auth.userId);
    const permissions =
      user?.roles
        .filter((userRole) => userRole.facilityId === request.auth?.facilityId)
        .flatMap((userRole) =>
          userRole.role.permissions.map((assignment) => assignment.permission),
        ) ?? [];
    const authorized = permissions.some(
      (permission) =>
        (permission.resource === resource || permission.resource === "*") &&
        (permission.action === action || permission.action === "*"),
    );

    if (authorized) return next();
    await writeAuditLog(
      {
        action: "AUTHZ_DENIED",
        resource: `${resource}:${action}`,
        facilityId: request.auth.facilityId ?? undefined,
        userId: request.auth.userId,
      },
      request,
    );
    return response.status(403).json({ error: "Permission denied" });
  };
}
