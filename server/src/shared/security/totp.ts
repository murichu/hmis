import { createDecipheriv } from "node:crypto";

import { verify } from "otplib";

import { env } from "../../config/index.js";

export async function verifyTotp(
  encryptedSecret: string,
  token: string,
): Promise<boolean> {
  if (!env.twoFactorEncryptionKey)
    throw new Error("TWO_FACTOR_ENCRYPTION_KEY is required to verify TOTP");
  const [iv, authTag, ciphertext] = encryptedSecret.split(".");
  if (!iv || !authTag || !ciphertext)
    throw new Error("Invalid encrypted MFA secret");

  const key = Buffer.from(env.twoFactorEncryptionKey, "base64");
  if (key.length !== 32)
    throw new Error("TWO_FACTOR_ENCRYPTION_KEY must be a 32-byte base64 key");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(authTag, "base64url"));
  const secret = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
  const result = await verify({ token, secret });
  return result.valid;
}
