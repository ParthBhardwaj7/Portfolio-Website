import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import { loginAdmin } from "@/lib/auth";
import { ADMIN_COOKIE } from "@/lib/constants";
import { handleRouteError, jsonError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.parse(body);
    const result = await loginAdmin(parsed.username, parsed.password);
    if (!result.ok) {
      return jsonError("Invalid username or password", 401, "INVALID_CREDENTIALS");
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    return handleRouteError(e);
  }
}
