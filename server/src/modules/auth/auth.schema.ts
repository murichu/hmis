import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const twoFactorVerificationSchema = z.object({
  challenge: z.string().min(1),
  code: z.string().regex(/^\d{6}$/),
});
