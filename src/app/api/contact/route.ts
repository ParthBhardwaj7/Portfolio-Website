import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validation";
import { handleRouteError, jsonError } from "@/lib/errors";
import {
  bodyTooLarge,
  clientIp,
  isSameOrigin,
  logAudit,
  rateLimit,
  sanitizeText,
} from "@/lib/security";

/** Contact submissions carry only text — 16KB is generous. */
const MAX_BODY_BYTES = 16 * 1024;
/** Hidden field bots tend to fill; humans never see it. */
const HONEYPOT_FIELD = "website";
/** Fastest plausible human fill time (ms from form mount to submit). */
const MIN_SUBMIT_MS = 2000;

export async function POST(request: Request) {
  try {
    if (bodyTooLarge(request, MAX_BODY_BYTES)) {
      return jsonError("Payload too large.", 413, "PAYLOAD_TOO_LARGE");
    }
    if (!isSameOrigin(request)) {
      return jsonError("Forbidden", 403, "FORBIDDEN");
    }

    const ip = clientIp(request);

    // Per-IP flood control: 5 submissions / 10 min
    const ipLimit = rateLimit(`contact:ip:${ip}`, 5, 10 * 60 * 1000);
    if (!ipLimit.ok) {
      return jsonError(
        "Too many messages from your network. Try again later.",
        429,
        "RATE_LIMITED",
      );
    }

    const body = await request.json();
    const data = contactSchema.parse(body);

    // Honeypot: pretend success, store nothing.
    const honeypot = (body as Record<string, unknown>)[HONEYPOT_FIELD];
    if (typeof honeypot === "string" && honeypot.length > 0) {
      await logAudit({
        actor: "anonymous",
        action: "spam_rejected",
        entity: "contact",
        detail: "Honeypot field filled",
        ip,
      });
      return Response.json({ ok: true, message: "Thanks — your message was sent." });
    }

    // Time-to-submit guard (client sends formMountedAt epoch ms)
    const mountedAt = Number((body as Record<string, unknown>).formMountedAt ?? 0);
    if (
      Number.isFinite(mountedAt) &&
      mountedAt > 0 &&
      Date.now() - mountedAt < MIN_SUBMIT_MS
    ) {
      return jsonError(
        "That was too fast — please review your message and submit again.",
        400,
        "TOO_FAST",
      );
    }

    // Cross-instance DB guard: same email max 3/hour
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const recent = await prisma.contact.count({
      where: { email: data.email.toLowerCase(), createdAt: { gte: since } },
    });
    if (recent >= 3) {
      return jsonError(
        "You've already sent several messages recently. Please wait a bit.",
        429,
        "RATE_LIMITED",
      );
    }

    await prisma.contact.create({
      data: {
        name: sanitizeText(data.name),
        email: sanitizeText(data.email).toLowerCase(),
        role: sanitizeText(data.role),
        message: sanitizeText(data.message),
      },
    });

    await logAudit({
      actor: "anonymous",
      action: "contact_submitted",
      entity: "contact",
      detail: `Message from ${sanitizeText(data.email).toLowerCase()}`,
      ip,
    });

    return Response.json({ ok: true, message: "Thanks — your message was sent." });
  } catch (e) {
    return handleRouteError(e);
  }
}
