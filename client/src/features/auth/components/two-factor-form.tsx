import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";

import { twoFactorSchema, type TwoFactorFormValues } from "../schemas/auth.schema";

type TwoFactorFormProps = {
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (values: TwoFactorFormValues) => void;
};

export function TwoFactorForm({ isSubmitting, onBack, onSubmit }: TwoFactorFormProps) {
  const { formState: { errors }, register, handleSubmit } = useForm<TwoFactorFormValues>({ resolver: zodResolver(twoFactorSchema) });

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="floating-field">
        <KeyRound aria-hidden="true" className="field-icon" size={18} />
        <input aria-invalid={Boolean(errors.code)} autoComplete="one-time-code" autoFocus id="two-factor-code" inputMode="numeric" maxLength={6} placeholder=" " {...register("code")} />
        <label htmlFor="two-factor-code">Authenticator code</label>
        {errors.code && <span className="field-error">{errors.code.message}</span>}
      </div>
      <button className="primary-button" disabled={isSubmitting} type="submit">
        <ShieldCheck aria-hidden="true" size={18} />
        {isSubmitting ? "Checking code" : "Verify and sign in"}
      </button>
      <button className="text-button" onClick={onBack} type="button">
        <ArrowLeft aria-hidden="true" size={16} /> Use a different account
      </button>
    </form>
  );
}