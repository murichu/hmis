import { createHash, randomBytes } from "node:crypto";

import {
  exportPKCS8,
  exportSPKI,
  generateKeyPair,
  importPKCS8,
  importSPKI,
  jwtVerify,
  SignJWT,
} from "jose";

import { env } from "../../config/index.js";

type AccessTokenPayload = { facilityId: string | null; userId: string };
type TwoFactorChallengePayload = { userId: string };

let developmentKeys:
  Promise<{ privateKey: string; publicKey: string }> | undefined;

async function getKeys() {
  if (env.jwtPrivateKey && env.jwtPublicKey) {
    return {
      privateKey: env.jwtPrivateKey.replace(/\\n/g, "\n"),
      publicKey: env.jwtPublicKey.replace(/\\n/g, "\n"),
    };
  }
  if (env.nodeEnv === "production")
    throw new Error(
      "JWT_PRIVATE_KEY and JWT_PUBLIC_KEY are required in production",
    );

  developmentKeys ??= generateKeyPair("RS256").then(
    async ({ privateKey, publicKey }) => ({
      privateKey: await exportPKCS8(privateKey),
      publicKey: await exportSPKI(publicKey),
    }),
  );
  return developmentKeys;
}

export async function createAccessToken(
  payload: AccessTokenPayload,
): Promise<string> {
  const keys = await getKeys();
  const privateKey = await importPKCS8(keys.privateKey, "RS256");
  return new SignJWT({ facilityId: payload.facilityId })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(privateKey);
}

export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenPayload> {
  const keys = await getKeys();
  const publicKey = await importSPKI(keys.publicKey, "RS256");
  const { payload } = await jwtVerify(token, publicKey, {
    algorithms: ["RS256"],
  });
  if (!payload.sub) throw new Error("Invalid access token subject");
  return {
    facilityId:
      typeof payload.facilityId === "string" ? payload.facilityId : null,
    userId: payload.sub,
  };
}

export async function createTwoFactorChallenge(
  userId: string,
): Promise<string> {
  const keys = await getKeys();
  const privateKey = await importPKCS8(keys.privateKey, "RS256");
  return new SignJWT({ purpose: "two_factor_challenge" })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(privateKey);
}

export async function verifyTwoFactorChallenge(
  token: string,
): Promise<TwoFactorChallengePayload> {
  const keys = await getKeys();
  const publicKey = await importSPKI(keys.publicKey, "RS256");
  const { payload } = await jwtVerify(token, publicKey, {
    algorithms: ["RS256"],
  });
  if (payload.purpose !== "two_factor_challenge" || !payload.sub)
    throw new Error("Invalid two-factor challenge");
  return { userId: payload.sub };
}

export function createRefreshToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
