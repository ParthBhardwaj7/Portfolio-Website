import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import { loginAdmin } from "@/lib/auth";
import { ADMIN_COOKIE } from "@/lib/constants";
import { handleRouteError, jsonError } from "@/lib/errors";
import { isJwtConfigured } from "@/lib/jwt";
import { sessionCookieSecure } from "@/lib/session-cookie";
import {
  bodyTooLarge,
  clientIp,
  isSameOrigin,
  logAudit,
  rateLimit,
} from "@/lib/security";

/** Login brute-force protection: 5 attempts / 15 min per IP+username. */
const LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  try {
    if (bodyTooLarge(request, 4 * 1024)) {
      return jsonError("Payload too large.", 413, "PAYLOAD_TOO_LARGE");
    }
    if (!isSameOrigin(request)) {
      return jsonError("Forbidden", 403, "FORBIDDEN");
    }
    if (!isJwtConfigured()) {
      return jsonError(
        "Set JWT_SECRET (min 16 characters) in your environment and restart the server.",
        503,
        "CONFIG"
      );
    }

    const body = await request.json();
    const parsed = loginSchema.parse(body);
    const ip = clientIp(request);

    // Rate limit BEFORE touching credentials
    const limit = rateLimit(`login:${ip}:${parsed.username}`, LOGIN_ATTEMPTS, LOGIN_WINDOW_MS);
    if (!limit.ok) {
      await logAudit({
        actor: "anonymous",
        action: "login_rate_limited",
        entity: "auth",
        detail: `Rate-limited login for "${parsed.username}"`,
        ip,
      });
      return jsonError("Too many attempts. Try again in a few minutes.", 429, "RATE_LIMITED");
    }

    const result = await loginAdmin(parsed.username, parsed.password);
    if (!result.ok) {
      // Generic message — never reveal whether the username exists
      await logAudit({
        actor: "anonymous",
        action: "login_failed",
        entity: "auth",
        detail: `Failed login for "${parsed.username}"`,
        ip,
      });
      return jsonError("Invalid username or password", 401, "INVALID_CREDENTIALS");
    }

    await logAudit({
      actor: parsed.username,
      action: "login_success",
      entity: "auth",
      detail: "Admin signed in",
      ip,
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, result.token, {
      httpOnly: true,
      secure: sessionCookieSecure(),
      sameSite: "strict", // admin app is same-origin only — strictest policy
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    return handleRouteError(e);
  }
}
