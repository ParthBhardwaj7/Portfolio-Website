import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

/// Models whose writes must land in AuditLog (admin-mutable content).
/// Contact writes are logged explicitly in their routes (public actor);
/// Admin writes are excluded to keep credential material out of the log.
const AUDITED_MODELS = new Set([
  "Portfolio",
  "PortfolioImage",
  "About",
  "SkillCategory",
  "SkillItem",
  "Social",
  "Certification",
  "Experience",
]);

function createPrisma() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  // Central audit trail: every audited create/update/delete/upsert is recorded.
  // Actor is coarse here ("admin-api"); routes with a session add finer entries.
  client.$use(async (params, next) => {
    const action = params.action;
    const audited =
      AUDITED_MODELS.has(params.model ?? "") &&
      (action === "create" ||
        action === "update" ||
        action === "delete" ||
        action === "upsert" ||
        action === "createMany" ||
        action === "updateMany" ||
        action === "deleteMany");
    if (!audited) return next(params);

    const result = await next(params);

    try {
      const whereId =
        (params.args?.where?.id as string | undefined) ??
        (result && typeof result === "object" && "id" in (result as object)
          ? String((result as { id: unknown }).id)
          : undefined);
      await client.auditLog.create({
        data: {
          actor: "admin-api",
          action,
          entity: params.model ?? "unknown",
          entityId: whereId ?? null,
          detail: null,
        },
      });
    } catch {
      // Best-effort — audit logging must never break the request
    }
    return result;
  });

  return client;
}

/** Single client per runtime (dev HMR + warm serverless invocations). */
export const prisma = globalForPrisma.prisma ?? createPrisma();

if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;
