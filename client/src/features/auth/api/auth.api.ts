import { apiClient } from "../../../services/api-client";
import { mockGetCurrentUser, mockLogin, mockLogout, mockVerifyTwoFactor } from "../../../mocks/auth.mock";
import type { CurrentUser, LoginInput, LoginResponse, TwoFactorInput } from "../types/auth.types";

const useMockApi = import.meta.env.VITE_USE_MOCK_API === "true";

export function login(input: LoginInput) {
  if (useMockApi) return mockLogin(input);
  return apiClient<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify(input) });
}

export function verifyTwoFactor(input: TwoFactorInput) {
  if (useMockApi) return mockVerifyTwoFactor(input);
  return apiClient<{ twoFactorRequired: false }>("/auth/2fa/verify", { method: "POST", body: JSON.stringify(input) });
}

export function getCurrentUser() {
  if (useMockApi) return mockGetCurrentUser();
  return apiClient<CurrentUser>("/auth/me");
}

function getCsrfToken(): string | undefined {
  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("csrf_token="))
    ?.split("=")[1];
}

export function logout() {
  if (useMockApi) return mockLogout();
  const csrfToken = getCsrfToken();
  return apiClient<void>("/auth/logout", {
    method: "POST",
    headers: csrfToken ? { "X-CSRF-Token": csrfToken } : undefined,
  });
}