import { type Prisma } from "@prisma/client";

import { prisma } from "../../database/prisma.js";

const userRolesInclude = {
  include: {
    role: {
      select: { id: true, name: true, description: true },
    },
    department: {
      select: { id: true, name: true },
    },
  },
};

const userSelect = {
  id: true,
  email: true,
  phone: true,
  fullName: true,
  status: true,
  statusReason: true,
  facilityId: true,
  departmentId: true,
  lastLoginAt: true,
  createdAt: true,
  roles: userRolesInclude,
} satisfies Prisma.UserSelect;

export function listUsersByFacility(facilityId: string) {
  return prisma.user.findMany({
    where: {
      OR: [{ facilityId }, { roles: { some: { facilityId } } }],
    },
    select: userSelect,
    orderBy: { fullName: "asc" },
  });
}

export function findUserScoped(userId: string, facilityId: string) {
  return prisma.user.findFirst({
    where: {
      id: userId,
      OR: [{ facilityId }, { roles: { some: { facilityId } } }],
    },
    select: userSelect,
  });
}

export function createUserWithRoles(
  data: Omit<Prisma.UserUncheckedCreateInput, "roles">,
  roleAssignments: {
    roleId: string;
    facilityId: string;
    departmentId?: string;
    grantedBy: string;
  }[],
) {
  return prisma.user.create({
    data: {
      ...data,
      roles: {
        createMany: {
          data: roleAssignments,
        },
      },
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      status: true,
    },
  });
}

export function updateUserAndRoles(
  userId: string,
  data: Prisma.UserUncheckedUpdateInput,
  facilityId: string,
  newRoleAssignments?: {
    roleId: string;
    departmentId?: string;
    grantedBy: string;
  }[],
) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        fullName: true,
        status: true,
        statusReason: true,
      },
    });

    if (newRoleAssignments) {
      await tx.userRole.deleteMany({ where: { userId, facilityId } });

      if (newRoleAssignments.length > 0) {
        await tx.userRole.createMany({
          data: newRoleAssignments.map((rc) => ({
            userId,
            facilityId,
            roleId: rc.roleId,
            departmentId: rc.departmentId ?? null,
            grantedBy: rc.grantedBy,
          })),
        });
      }
    }

    return updated;
  });
}
