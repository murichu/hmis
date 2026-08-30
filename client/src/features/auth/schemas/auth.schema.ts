import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid work email address."),
  password: z.string().min(1, "Enter your password."),
});

export const twoFactorSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the six-digit code from your authenticator."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type TwoFactorFormValues = z.infer<typeof twoFactorSchema>;