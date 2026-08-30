import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { useForm } from "react-hook-form";

import { loginSchema, type LoginFormValues } from "../schemas/auth.schema";

type LoginFormProps = {
  isSubmitting: boolean;
  onSubmit: (values: LoginFormValues) => void;
};

export function LoginForm({ isSubmitting, onSubmit }: LoginFormProps) {
  const { formState: { errors }, register, handleSubmit } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="floating-field">
        <Mail aria-hidden="true" className="field-icon" size={18} />
        <input aria-invalid={Boolean(errors.email)} autoComplete="email" id="email" placeholder=" " {...register("email")} />
        <label htmlFor="email">Work email</label>
        {errors.email && <span className="field-error">{errors.email.message}</span>}
      </div>
      <div className="floating-field">
        <LockKeyhole aria-hidden="true" className="field-icon" size={18} />
        <input aria-invalid={Boolean(errors.password)} autoComplete="current-password" id="password" placeholder=" " type="password" {...register("password")} />
        <label htmlFor="password">Password</label>
        {errors.password && <span className="field-error">{errors.password.message}</span>}
      </div>
      <button className="primary-button" disabled={isSubmitting} type="submit">
        <LockKeyhole aria-hidden="true" size={18} />
        {isSubmitting ? "Verifying" : "Continue"}
        {!isSubmitting && <ArrowRight aria-hidden="true" size={18} />}
      </button>
    </form>
  );
}