import "dotenv/config";

function getPort(value: string | undefined): number {
  const port = Number(value ?? 3000);
  return Number.isInteger(port) && port > 0 ? port : 3000;
}

export const env = {
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  jwtPrivateKey: process.env.JWT_PRIVATE_KEY,
  jwtPublicKey: process.env.JWT_PUBLIC_KEY,
  logLevel: process.env.LOG_LEVEL ?? "info",
  twoFactorEncryptionKey: process.env.TWO_FACTOR_ENCRYPTION_KEY,
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: getPort(process.env.PORT),
};
