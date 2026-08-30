import { type Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma.js";

const facilityInclude = {
  parentFacility: {
    select: {
      id: true,
      name: true,
      type: true,
    },
  },
  _count: {
    select: {
      branches: true,
      departments: true,
      users: true,
    },
  },
} satisfies Prisma.FacilityInclude;

function createScopeWhere(scopeFacilityId: string | null): Prisma.FacilityWhereInput {
  if (!scopeFacilityId) {
    return {};
  }

  return {
    OR: [{ id: scopeFacilityId }, { parentFacilityId: scopeFacilityId }],
  };
}

export function listFacilities(scopeFacilityId: string | null) {
  return prisma.facility.findMany({
    where: createScopeWhere(scopeFacilityId),
    include: facilityInclude,
    orderBy: [{ parentFacilityId: "asc" }, { name: "asc" }],
  });
}

export function findScopedFacilityById(
  facilityId: string,
  scopeFacilityId: string | null,
) {
  return prisma.facility.findFirst({
    where: {
      id: facilityId,
      ...createScopeWhere(scopeFacilityId),
    },
    include: facilityInclude,
  });
}

export function createFacility(data: Prisma.FacilityUncheckedCreateInput) {
  return prisma.facility.create({
    data,
    include: facilityInclude,
  });
}

export function updateFacility(
  facilityId: string,
  data: Prisma.FacilityUncheckedUpdateInput,
) {
  return prisma.facility.update({
    where: { id: facilityId },
    data,
    include: facilityInclude,
  });
}
