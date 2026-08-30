import { Prisma } from "@prisma/client";
import type { RequestHandler, Response } from "express";

import { writeAuditLog } from "../audit/index.js";
import {
  createFacility,
  findScopedFacilityById,
  listFacilities,
  updateFacility,
} from "./facilities.repository.js";
import {
  createFacilitySchema,
  updateFacilitySchema,
} from "./facilities.schema.js";

function handlePrismaWriteError(error: unknown, response: Response) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return response.status(409).json({ error: "Facility already exists" });
    }

    if (error.code === "P2003") {
      return response
        .status(400)
        .json({ error: "Invalid facility relationship" });
    }
  }

  throw error;
}

function getFacilityIdParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}

export const listFacilitiesHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const facilities = await listFacilities(request.auth!.facilityId);
    response.json({ data: facilities });
  } catch (error) {
    next(error);
  }
};

export const getFacilityHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const facilityId = getFacilityIdParam(request.params.facilityId);
    if (!facilityId) {
      return response.status(400).json({ error: "Invalid facility id" });
    }

    const facility = await findScopedFacilityById(
      facilityId,
      request.auth!.facilityId,
    );

    if (!facility) {
      return response.status(404).json({ error: "Facility not found" });
    }

    return response.json({ data: facility });
  } catch (error) {
    return next(error);
  }
};

export const createFacilityHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const input = createFacilitySchema.parse(request.body);
    const scopeFacilityId = request.auth!.facilityId;

    if (
      scopeFacilityId &&
      input.parentFacilityId &&
      input.parentFacilityId !== scopeFacilityId
    ) {
      return response.status(403).json({
        error: "New facilities must be created under your assigned facility",
      });
    }

    if (input.parentFacilityId) {
      const parentFacility = await findScopedFacilityById(
        input.parentFacilityId,
        scopeFacilityId,
      );
      if (!parentFacility) {
        return response
          .status(404)
          .json({ error: "Parent facility not found" });
      }
    }

    const facility = await createFacility({
      name: input.name,
      type: input.type,
      ...(input.parentFacilityId
        ? { parentFacilityId: input.parentFacilityId }
        : scopeFacilityId
          ? { parentFacilityId: scopeFacilityId }
          : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    });

    await writeAuditLog(
      {
        action: "FACILITY_CREATED",
        resource: "facility",
        facilityId: facility.id,
        userId: request.auth!.userId,
        metadata: {
          facilityId: facility.id,
          parentFacilityId: facility.parentFacilityId,
          type: facility.type,
        },
      },
      request,
    );

    return response.status(201).json({ data: facility });
  } catch (error) {
    try {
      return handlePrismaWriteError(error, response);
    } catch (unhandledError) {
      return next(unhandledError);
    }
  }
};

export const updateFacilityHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const facilityId = getFacilityIdParam(request.params.facilityId);
    if (!facilityId) {
      return response.status(400).json({ error: "Invalid facility id" });
    }

    const scopeFacilityId = request.auth!.facilityId;
    const existingFacility = await findScopedFacilityById(
      facilityId,
      scopeFacilityId,
    );

    if (!existingFacility) {
      return response.status(404).json({ error: "Facility not found" });
    }

    const input = updateFacilitySchema.parse(request.body);

    if (input.parentFacilityId === facilityId) {
      return response
        .status(400)
        .json({ error: "Facility cannot be its own parent" });
    }

    if (
      scopeFacilityId &&
      input.parentFacilityId &&
      input.parentFacilityId !== scopeFacilityId
    ) {
      return response.status(403).json({
        error: "Facility parent must stay within your assigned scope",
      });
    }

    if (input.parentFacilityId) {
      const parentFacility = await findScopedFacilityById(
        input.parentFacilityId,
        scopeFacilityId,
      );
      if (!parentFacility) {
        return response
          .status(404)
          .json({ error: "Parent facility not found" });
      }
    }

    const facility = await updateFacility(facilityId, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.parentFacilityId !== undefined
        ? { parentFacilityId: input.parentFacilityId }
        : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    });

    await writeAuditLog(
      {
        action: "FACILITY_UPDATED",
        resource: "facility",
        facilityId: facility.id,
        userId: request.auth!.userId,
        metadata: {
          facilityId: facility.id,
          parentFacilityId: facility.parentFacilityId,
          isActive: facility.isActive,
          type: facility.type,
        },
      },
      request,
    );

    return response.json({ data: facility });
  } catch (error) {
    try {
      return handlePrismaWriteError(error, response);
    } catch (unhandledError) {
      return next(unhandledError);
    }
  }
};

export const archiveFacilityHandler: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const facilityId = getFacilityIdParam(request.params.facilityId);
    if (!facilityId) {
      return response.status(400).json({ error: "Invalid facility id" });
    }

    const existingFacility = await findScopedFacilityById(
      facilityId,
      request.auth!.facilityId,
    );

    if (!existingFacility) {
      return response.status(404).json({ error: "Facility not found" });
    }

    const facility = await updateFacility(facilityId, { isActive: false });

    await writeAuditLog(
      {
        action: "FACILITY_ARCHIVED",
        resource: "facility",
        facilityId: facility.id,
        userId: request.auth!.userId,
        metadata: {
          facilityId: facility.id,
          archived: true,
        },
      },
      request,
    );

    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
};
