import { ApiError } from "../services/api-client";
import type { CurrentUser, LoginInput, LoginResponse, TwoFactorInput } from "../features/auth/types/auth.types";

const mockAccount = {
  email: "doctor@medcore.test",
  password: "Medcore!2026",
  twoFactorCode: "123456",
  user: {
    facilityId: "facility-nairobi-central",
    name: "Dr. Amina Wanjiku",
    permissions: ["patient_record:read", "patient_record:update", "prescription:create", "lab_order:create"],
    roles: ["Doctor"],
    userId: "user-dr-amina-wanjiku",
  } satisfies CurrentUser,
};

let activeChallenge: string | undefined;
let authenticatedUser: CurrentUser | null = null;

function delay() {
  return new Promise((resolve) => window.setTimeout(resolve, 450));
}

export async function mockLogin(input: LoginInput): Promise<LoginResponse> {
  await delay();
  if (input.email.toLowerCase() !== mockAccount.email || input.password !== mockAccount.password) {
    throw new ApiError("Invalid credentials", 401);
  }

  activeChallenge = crypto.randomUUID();
  return { twoFactorRequired: true, challenge: activeChallenge };
}

export async function mockVerifyTwoFactor(input: TwoFactorInput): Promise<{ twoFactorRequired: false }> {
  await delay();
  if (input.challenge !== activeChallenge || input.code !== mockAccount.twoFactorCode) {
    throw new ApiError("Invalid two-factor code", 401);
  }

  activeChallenge = undefined;
  authenticatedUser = mockAccount.user;
  return { twoFactorRequired: false };
}

export async function mockGetCurrentUser(): Promise<CurrentUser> {
  await delay();
  if (!authenticatedUser) throw new ApiError("Authentication required", 401);
  return authenticatedUser;
}

export async function mockLogout(): Promise<void> {
  await delay();
  authenticatedUser = null;
}