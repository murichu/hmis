import type { PropsWithChildren } from "react";
import { Toaster } from "sonner";

import { AuthProvider } from "./auth-provider";
import { QueryProvider } from "./query-provider";

export function AppProvider({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
      <Toaster position="top-right" richColors theme="light" />
    </QueryProvider>
  );
}