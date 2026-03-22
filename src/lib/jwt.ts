import { SignJWT, jwtVerify } from "jose";
import { JWT_EXPIRY } from "./constants";

export function isJwtConfigured(): boolean {
  const s = process.env.JWT_SECRET;
  return Boolean(s && s.length >= 16);
}

export function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error("JWT_SECRET must be set and at least 16 characters");
  }
  return new TextEncoder().encode(s);
}

export type AdminJwtPayload = { sub: string; username: string };

export async function signAdminJwt(adminId: string, username: string) {
  return new SignJWT({ sub: adminId, username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getJwtSecret());
}

export async function verifyAdminJwt(token: string): Promise<AdminJwtPayload> {
  const { payload } = await jwtVerify(token, getJwtSecret());
  return payload as AdminJwtPayload;
}
