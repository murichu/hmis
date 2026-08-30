import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut, ShieldCheck } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { logout } from "../../features/auth";
import { ApiError } from "../../services/api-client";
import { useAuthStore } from "../../stores/auth.store";

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["auth", "me"] });
      setUser(null);
      toast.success("You have been signed out.");
      navigate("/login", { replace: true });
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "Unable to sign out right now."),
  });
  if (!user) return <Navigate replace to="/login" />;

  return <main className="workspace"><header><div><p className="eyebrow">MEDCORE HMS</p><h1>Welcome, {user.name}</h1></div><button className="icon-button" disabled={logoutMutation.isPending} onClick={() => logoutMutation.mutate()} title="Sign out" type="button"><LogOut aria-hidden="true" size={19} /></button></header><section className="workspace-message"><ShieldCheck aria-hidden="true" size={28} /><div><h2>Your secure session is active</h2><p>{user.roles.join(", ") || "Hospital user"} access is ready. Clinical and operational modules will appear here as they are enabled.</p></div></section></main>;
}