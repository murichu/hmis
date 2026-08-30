import { UserStatus } from "@prisma/client";
import { z } from "zod";

const uuidSchema = z.string().uuid();

const nameField = z.string().trim().min(2).max(60);

export const createUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(60)
    .regex(/^[a-zA-Z0-9._-]+$/, "Username may only contain letters, numbers, dots, underscores and hyphens"),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  firstName: nameField,
  middleName: nameField.optional(),
  surname: nameField,
  employmentNo: z.string().trim().min(2).max(40),
  departmentId: uuidSchema.optional(),
  roles: z.array(uuidSchema).min(1, "At least one role is required"),
});

export const updateUserSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3)
      .max(60)
      .regex(/^[a-zA-Z0-9._-]+$/)
      .optional(),
    email: z.string().email().optional(),
    phone: z.string().min(7).max(20).optional(),
    firstName: nameField.optional(),
    middleName: nameField.nullish(),
    surname: nameField.optional(),
    employmentNo: z.string().trim().min(2).max(40).optional(),
    departmentId: uuidSchema.nullish(),
    roles: z.array(uuidSchema).min(1).optional(),
    status: z.nativeEnum(UserStatus).optional(),
    statusReason: z.string().min(2).max(255).nullish(),
  })
  .refine(
    (data) => Object.values(data).some((entry) => entry !== undefined),
    { message: "At least one field must be provided" },
  )
  .refine(
    (data) => {
      if (data.status && data.status !== "ACTIVE" && !data.statusReason) return false;
      return true;
    },
    { message: "statusReason is required when suspending or deactivating a user" },
  );
