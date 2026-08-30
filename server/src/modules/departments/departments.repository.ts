import { type Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma.js";

const departmentInclude = {
  facility: {
    select: {
      id: true,
      name: true,
      type: true,
    },
  },
  _count: {
    select: {
      users: true,
      roles: true,
    },
  },
} satisfies Prisma.DepartmentInclude;

export function listDepartments(facilityId: string) {
  return prisma.department.findMany({
    where: { facilityId },
    include: departmentInclude,
    orderBy: { name: "asc" },
  });
}

export function findDepartmentById(departmentId: string, facilityId: string) {
  return prisma.department.findFirst({
    where: { id: departmentId, facilityId },
    include: departmentInclude,
  });
}

export function createDepartment(data: Prisma.DepartmentUncheckedCreateInput) {
  return prisma.department.create({
    data,
    include: departmentInclude,
  });
}

export function updateDepartment(
  departmentId: string,
  data: Prisma.DepartmentUncheckedUpdateInput,
) {
  return prisma.department.update({
    where: { id: departmentId },
    data,
    include: departmentInclude,
  });
}

export function deleteDepartment(departmentId: string) {
  return prisma.department.delete({
    where: { id: departmentId },
  });
}
