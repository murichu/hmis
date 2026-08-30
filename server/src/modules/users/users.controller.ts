import { Prisma } from "@prisma/client";
import type { RequestHandler, Response } from "express";

import { writeAuditLog } from "../audit/index.js";
import { hashPassword } from "../../shared/security/password.js";
import {
  createUserWithRoles,
  findUserScoped,
  listUsersByFacility,
  updateUserAndRoles,
} from "./users.repository.js";
import { createUserSchema, updateUserSchema } from "./users.schema.js";

function handlePrismaWriteError(error: unknown, response: Response) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return response
        .status(409)
        .json({ error: "Email or phone already in use" });
    }
  }
  throw error;
}

function getUserIdParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}

function getScopedFacilityId(response: Response, facilityId: string | null) {
  if (!facilityId) {
    response.status(400).json({
      error: "Facility context is required for user management operations",
    });
    return null;
  }
  return facilityId;
}

export const listUsersHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const facilityId = getScopedFacilityId(response, request.auth!.facilityId);
    if (!facilityId) return;

    const users = await listUsersByFacility(facilityId);
    response.json({ data: users });
  } catch (error) {
    next(error);
  }
};

export const getUserHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const facilityId = getScopedFacilityId(response, request.auth!.facilityId);
    if (!facilityId) return;
    const userId = getUserIdParam(request.params.userId);
    if (!userId)
      return response.status(400).json({ error: "Invalid user id" });

    const user = await findUserScoped(userId, facilityId);
    if (!user) {
      return response
        .status(404)
        .json({ error: "User not found or not in your facility" });
    }

    return response.json({ data: user });
  } catch (error) {
    return next(error);
  }
};

export const createUserHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const facilityId = getScopedFacilityId(response, request.auth!.facilityId);
    const executorId = request.auth!.userId;
    if (!facilityId) return;

    const input = createUserSchema.parse(request.body);

    const passwordHash = await hashPassword(input.password ?? "Hospital*2026");

    const roleAssignments = input.roles.map((roleId) => ({
      roleId,
      facilityId,
      grantedBy: executorId,
      ...(input.departmentId ? { departmentId: input.departmentId } : {}),
    }));

    const user = await createUserWithRoles(
      {
        email: input.email?.toLowerCase() ?? null,
        phone: input.phone ?? null,
        fullName: input.fullName,
        passwordHash,
        facilityId,
        departmentId: input.departmentId ?? null,
      },
      roleAssignments,
    );

    await writeAuditLog(
      {
        action: "USER_CREATED",
        resource: "user",
        facilityId,
        userId: executorId,
        metadata: {
          targetUserId: user.id,
          roles: input.roles,
        },
      },
      request,
    );

    return response.status(201).json({ data: user });
  } catch (error) {
    try {
      return handlePrismaWriteError(error, response);
    } catch (unhandledError) {
      return next(unhandledError);
    }
  }
};

export const updateUserHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const facilityId = getScopedFacilityId(response, request.auth!.facilityId);
    const executorId = request.auth!.userId;
    if (!facilityId) return;

    const targetUserId = getUserIdParam(request.params.userId);
    if (!targetUserId)
      return response.status(400).json({ error: "Invalid user id" });

    const existingUser = await findUserScoped(targetUserId, facilityId);
    if (!existingUser) {
      return response
        .status(404)
        .json({ error: "User not found or not in your facility" });
    }

    const input = updateUserSchema.parse(request.body);
    const newRoleAssignments = input.roles?.map((roleId) => ({
      roleId,
      grantedBy: executorId,
      ...(input.departmentId ? { departmentId: input.departmentId } : {}),
    }));

    const user = await updateUserAndRoles(
      targetUserId,
      {
        ...(input.email !== undefined
          ? { email: input.email?.toLowerCase() }
          : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
        ...(input.departmentId !== undefined
          ? { departmentId: input.departmentId }
          : {}),
        ...(input.status !== undefined
          ? { status: input.status, statusReason: input.statusReason ?? null }
          : {}),
      },
      facilityId,
      newRoleAssignments,
    );

    await writeAuditLog(
      {
        action: "USER_UPDATED",
        resource: "user",
        facilityId,
        userId: executorId,
        metadata: {
          targetUserId: user.id,
          status: user.status,
          statusReason: user.statusReason,
          rolesChanged: input.roles !== undefined,
        },
      },
      request,
    );

    return response.json({ data: user });
  } catch (error) {
    try {
      return handlePrismaWriteError(error, response);
    } catch (unhandledError) {
      return next(unhandledError);
    }
  }
};
