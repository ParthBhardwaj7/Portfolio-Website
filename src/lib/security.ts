import "server-only";
import { prisma } from "./prisma";

/* ============================================================
   Shared security helpers: audit logging, rate limiting,
   origin checks, body-size guards, input sanitization.
   ============================================================ */

/** Best-effort client IP for rate limiting / audit trails. */
export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Record a security-relevant event. Never throws — logging must not break requests. */
export async function logAudit(entry: {
  actor: string;
  action: string;
  entity: string;
  entityId?: string | null;
  detail?: string | null;
  ip?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actor: entry.actor,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ?? null,
        detail: entry.detail ?? null,
        ip: entry.ip ?? null,
      },
    });
  } catch {
    // Audit logging is best-effort; swallow storage failures.
  }
}

/**
 * CSRF defense for cookie-authenticated mutations: verify the Origin header
 * matches the request host. Same-origin fetches always send Origin (or none
 * for some older clients — treated as same-origin same-host).
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser client or same-origin GET-style call
  try {
    const originHost = new URL(origin).host;
    const host = request.headers.get("host");
    return Boolean(host) && originHost === host;
  } catch {
    return false;
  }
}

type Bucket = { hits: number[] };

/**
 * In-memory sliding-window rate limiter (per process — fine for a portfolio;
 * production Vercel instances are small and short-lived, DB rate guard below
 * covers cross-instance abuse).
 */
const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket);
    const oldest = bucket.hits[0] ?? now;
    return { ok: false, retryAfterSec: Math.ceil((windowMs - (now - oldest)) / 1000) };
  }
  bucket.hits.push(now);
  buckets.set(key, bucket);
  if (buckets.size > 5000) {
    // Keep the map bounded
    const cutoff = now - windowMs;
    buckets.forEach((b, k) => {
      if (b.hits.every((t) => t < cutoff)) buckets.delete(k);
    });
  }
  return { ok: true, retryAfterSec: 0 };
}

/** Reject oversized request bodies before parsing. */
export function bodyTooLarge(request: Request, maxBytes: number): boolean {
  const len = Number(request.headers.get("content-length") ?? "0");
  return Number.isFinite(len) && len > maxBytes;
}

/** Strip control characters (except newline/tab) and trim. */
export function sanitizeText(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}
