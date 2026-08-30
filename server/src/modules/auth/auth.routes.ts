import { Router, type RequestHandler } from "express";

import { requireAuth } from "../../middlewares/index.js";
import { loginSchema, twoFactorVerificationSchema } from "./auth.schema.js";
import { findUserById } from "./auth.repository.js";
import { login, logout, refresh, verifyTwoFactor } from "./auth.service.js";

export const authRouter = Router();

authRouter.post("/login", async (request, response, next) => {
  try {
    const input = loginSchema.parse(request.body);
    const result = await login(input.email, input.password, request, response);
    response.status(result.status).json(result.body);
  } catch (error) {
    return next(error);
  }
});

const verifyTwoFactorHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const input = twoFactorVerificationSchema.parse(request.body);
    const result = await verifyTwoFactor(
      input.challenge,
      input.code,
      request,
      response,
    );
    response.status(result.status).json(result.body);
  } catch (error) {
    return next(error);
  }
};

authRouter.post("/2fa/verify", verifyTwoFactorHandler);
authRouter.post("/mfa/verify", verifyTwoFactorHandler);

authRouter.post("/refresh", async (request, response, next) => {
  try {
    const result = await refresh(request, response);
    response.status(result.status).json(result.body);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", async (request, response, next) => {
  try {
    const result = await logout(request, response);
    response.status(result.status).send();
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAuth, async (request, response, next) => {
  try {
    const user = await findUserById(request.auth!.userId);
    if (user?.status !== "ACTIVE")
      return response.status(401).json({ error: "Session is no longer valid" });
    const roles = user.roles.filter(
      (role) => role.facilityId === request.auth!.facilityId,
    );
    return response.json({
      userId: user.id,
      facilityId: request.auth!.facilityId,
      name: user.fullName,
      roles: roles.map((role) => role.role.name),
      permissions: [
        ...new Set(
          roles.flatMap((role) =>
            role.role.permissions.map(
              (assignment) =>
                `${assignment.permission.resource}:${assignment.permission.action}`,
            ),
          ),
        ),
      ],
    });
  } catch (error) {
    return next(error);
  }
});
