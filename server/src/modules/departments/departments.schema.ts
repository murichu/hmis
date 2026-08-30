import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(2).max(120),
  isActive: z.boolean().optional(),
});

export const updateDepartmentSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: "At least one field must be provided",
  });
