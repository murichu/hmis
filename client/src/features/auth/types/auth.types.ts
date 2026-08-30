export type LoginInput = { email: string; password: string };

export type LoginResponse =
  | { twoFactorRequired: true; challenge: string }
  | { twoFactorRequired: false };

export type TwoFactorInput = { challenge: string; code: string };

export type CurrentUser = {
  facilityId: string | null;
  name: string;
  permissions: string[];
  roles: string[];
  userId: string;
};