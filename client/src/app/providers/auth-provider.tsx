import { useQuery } from "@tanstack/react-query";
import { type PropsWithChildren, useEffect } from "react";

import { getCurrentUser } from "../../features/auth";
import { useAuthStore } from "../../stores/auth.store";

export function AuthProvider({ children }: PropsWithChildren) {
  const setUser = useAuthStore((state) => state.setUser);
  const { data } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (data) setUser(data);
  }, [data, setUser]);

  return children;
}