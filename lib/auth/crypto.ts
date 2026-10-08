import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

export function createOtp() {
  return String(randomInt(100000, 1000000));
}

export function hashSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function secretsEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
