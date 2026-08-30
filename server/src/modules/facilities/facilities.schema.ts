import { FacilityType } from "@prisma/client";
import { z } from "zod";

const facilityIdSchema = z.string().uuid();

export const createFacilitySchema = z.object({
  name: z.string().trim().min(2).max(120),
  type: z.nativeEnum(FacilityType).default(FacilityType.HOSPITAL),
  parentFacilityId: facilityIdSchema.optional(),
  isActive: z.boolean().optional(),
});

export const updateFacilitySchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    type: z.nativeEnum(FacilityType).optional(),
    parentFacilityId: facilityIdSchema.nullish(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: "At least one field must be provided",
  });
