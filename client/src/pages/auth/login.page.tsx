import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Activity, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { ApiError } from "../../services/api-client";
import { useAuthStore } from "../../stores/auth.store";
import { getCurrentUser, login, verifyTwoFactor } from "../../features/auth";
import { LoginForm } from "../../features/auth/components/login-form";
import { TwoFactorForm } from "../../features/auth/components/two-factor-form";
import type { LoginFormValues, TwoFactorFormValues } from "../../features/auth/schemas/auth.schema";

export function LoginPage() {
  const [challenge, setChallenge] = useState<string>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const loginMutation = useMutation({ mutationFn: login });
  const twoFactorMutation = useMutation({ mutationFn: verifyTwoFactor });

  async function finishLogin() {
    const user = await queryClient.fetchQuery({ queryKey: ["auth", "me"], queryFn: getCurrentUser });
    setUser(user);
    toast.success("Signed in successfully.");
    navigate("/app", { replace: true });
  }

  async function submitLogin(values: LoginFormValues) {
    try {
      const result = await loginMutation.mutateAsync(values);
      if (result.twoFactorRequired) {
        setChallenge(result.challenge);
        toast.message("Enter your authenticator code to continue.");
      }
      else await finishLogin();
    } catch (requestError) {
      toast.error(requestError instanceof ApiError ? requestError.message : "Unable to sign in right now.");
    }
  }

  async function submitTwoFactor(values: TwoFactorFormValues) {
    if (!challenge) return;
    try {
      await twoFactorMutation.mutateAsync({ challenge, code: values.code });
      await finishLogin();
    } catch (requestError) {
      toast.error(requestError instanceof ApiError ? requestError.message : "Unable to verify the code.");
    }
  }

  return (
    <main className="auth-shell">
      <div className="mobile-brand">
        <div className="brand-mark"><Activity aria-hidden="true" size={20} /></div>
        <p className="eyebrow">MEDCORE HMS</p>
      </div>
      <section className="brand-panel">
        <div className="brand-mark"><Activity aria-hidden="true" size={24} /></div>
        <p className="eyebrow">MEDCORE HMS</p>
        <h1>Clinical access, kept accountable.</h1>
        <p className="brand-copy">A protected workspace for coordinated hospital care, with every sign-in safeguarded by two-factor authentication.</p>
        <div className="security-note"><ShieldCheck aria-hidden="true" size={18} /><span>Secure session controls are active</span></div>
      </section>
      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="auth-stepper" aria-label="Sign-in progress">
          <span className="is-active">1</span><i /><span className={challenge ? "is-active" : ""}>2</span>
        </div>
        <div className="auth-heading">
          <p className="eyebrow">{challenge ? "TWO-FACTOR CHECK" : "SIGN IN"}</p>
          <h2 id="auth-title">{challenge ? "Confirm your identity" : "Welcome back"}</h2>
          <p>{challenge ? "Enter the current code from your authenticator app." : "Use your hospital account to continue."}</p>
        </div>
        {challenge ? <TwoFactorForm isSubmitting={twoFactorMutation.isPending} onBack={() => setChallenge(undefined)} onSubmit={submitTwoFactor} /> : <LoginForm isSubmitting={loginMutation.isPending} onSubmit={submitLogin} />}
      </section>
    </main>
  );
}