import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { ADMIN_COOKIE } from "./constants";
import { signAdminJwt, verifyAdminJwt, type AdminJwtPayload } from "./jwt";
import { prisma } from "./prisma";

export type { AdminJwtPayload };

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function getAdminSession(): Promise<AdminJwtPayload | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifyAdminJwt(token);
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) {
    return {
      ok: false as const,
      response: Response.json({ error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 }),
    };
  }
  return { ok: true as const, session };
}

export async function loginAdmin(username: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) return { ok: false as const };
  const valid = await verifyPassword(password, admin.password);
  if (!valid) return { ok: false as const };
  const token = await signAdminJwt(admin.id, admin.username);
  return { ok: true as const, token };
}
