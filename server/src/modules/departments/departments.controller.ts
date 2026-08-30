import { Prisma } from "@prisma/client";
import type { RequestHandler, Response } from "express";

import { writeAuditLog } from "../audit/index.js";
import {
  createDepartment,
  deleteDepartment,
  findDepartmentById,
  listDepartments,
  updateDepartment,
} from "./departments.repository.js";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from "./departments.schema.js";

function handlePrismaWriteError(error: unknown, response: Response) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return response.status(409).json({ error: "Department already exists" });
    }

    if (error.code === "P2003" || error.code === "P2014") {
      return response.status(409).json({
        error: "Department has related records and cannot be deleted",
      });
    }
  }

  throw error;
}

function getDepartmentIdParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}

function getScopedFacilityId(response: Response, facilityId: string | null) {
  if (!facilityId) {
    response.status(400).json({
      error: "Facility context is required for department operations",
    });
    return null;
  }

  return facilityId;
}

export const listDepartmentsHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const facilityId = getScopedFacilityId(response, request.auth!.facilityId);
    if (!facilityId) return;

    const departments = await listDepartments(facilityId);
    response.json({ data: departments });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const facilityId = getScopedFacilityId(response, request.auth!.facilityId);
    if (!facilityId) return;

    const departmentId = getDepartmentIdParam(request.params.departmentId);
    if (!departmentId) {
      return response.status(400).json({ error: "Invalid department id" });
    }

    const department = await findDepartmentById(departmentId, facilityId);
    if (!department) {
      return response.status(404).json({ error: "Department not found" });
    }

    return response.json({ data: department });
  } catch (error) {
    return next(error);
  }
};

export const createDepartmentHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const facilityId = getScopedFacilityId(response, request.auth!.facilityId);
    if (!facilityId) return;

    const input = createDepartmentSchema.parse(request.body);
    const department = await createDepartment({
      facilityId,
      name: input.name,
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    });

    await writeAuditLog(
      {
        action: "DEPARTMENT_CREATED",
        resource: "department",
        facilityId,
        userId: request.auth!.userId,
        metadata: {
          departmentId: department.id,
          name: department.name,
        },
      },
      request,
    );

    return response.status(201).json({ data: department });
  } catch (error) {
    try {
      return handlePrismaWriteError(error, response);
    } catch (unhandledError) {
      return next(unhandledError);
    }
  }
};

export const updateDepartmentHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const facilityId = getScopedFacilityId(response, request.auth!.facilityId);
    if (!facilityId) return;

    const departmentId = getDepartmentIdParam(request.params.departmentId);
    if (!departmentId) {
      return response.status(400).json({ error: "Invalid department id" });
    }

    const existingDepartment = await findDepartmentById(
      departmentId,
      facilityId,
    );
    if (!existingDepartment) {
      return response.status(404).json({ error: "Department not found" });
    }

    const input = updateDepartmentSchema.parse(request.body);
    const department = await updateDepartment(departmentId, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    });

    await writeAuditLog(
      {
        action: "DEPARTMENT_UPDATED",
        resource: "department",
        facilityId,
        userId: request.auth!.userId,
        metadata: {
          departmentId: department.id,
          isActive: department.isActive,
          name: department.name,
        },
      },
      request,
    );

    return response.json({ data: department });
  } catch (error) {
    try {
      return handlePrismaWriteError(error, response);
    } catch (unhandledError) {
      return next(unhandledError);
    }
  }
};

export const deleteDepartmentHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const facilityId = getScopedFacilityId(response, request.auth!.facilityId);
    if (!facilityId) return;

    const departmentId = getDepartmentIdParam(request.params.departmentId);
    if (!departmentId) {
      return response.status(400).json({ error: "Invalid department id" });
    }

    const existingDepartment = await findDepartmentById(
      departmentId,
      facilityId,
    );
    if (!existingDepartment) {
      return response.status(404).json({ error: "Department not found" });
    }

    await deleteDepartment(departmentId);

    await writeAuditLog(
      {
        action: "DEPARTMENT_DELETED",
        resource: "department",
        facilityId,
        userId: request.auth!.userId,
        metadata: {
          departmentId,
          name: existingDepartment.name,
        },
      },
      request,
    );

    return response.status(204).send();
  } catch (error) {
    try {
      return handlePrismaWriteError(error, response);
    } catch (unhandledError) {
      return next(unhandledError);
    }
  }
};
