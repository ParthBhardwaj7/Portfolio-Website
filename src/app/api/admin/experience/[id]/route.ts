import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { handleRouteError, jsonError } from "@/lib/errors";
import { experienceUpdateSchema } from "@/lib/validation-experience";
import { clientIp, isSameOrigin, logAudit, sanitizeText } from "@/lib/security";

type Params = { params: { id: string } };

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await requireAdminSession();
    if (!session.ok) return session.response;
    if (!isSameOrigin(request)) return jsonError("Forbidden", 403, "FORBIDDEN");

    const body = await request.json();
    const data = experienceUpdateSchema.parse(body);
    const existing = await prisma.experience.findUnique({ where: { id: params.id } });
    if (!existing) return jsonError("Record not found.", 404, "NOT_FOUND");

    const updated = await prisma.experience.update({
      where: { id: params.id },
      data: {
        ...(data.year !== undefined ? { year: sanitizeText(data.year) } : {}),
        ...(data.title !== undefined ? { title: sanitizeText(data.title) } : {}),
        ...(data.org !== undefined ? { org: data.org ? sanitizeText(data.org) : null } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.description !== undefined ? { description: sanitizeText(data.description) } : {}),
        ...(data.technologies !== undefined ? { technologies: data.technologies } : {}),
        ...(data.url !== undefined ? { url: data.url } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
      },
    });

    await logAudit({
      actor: session.session.username,
      action: "update",
      entity: "experience",
      entityId: updated.id,
      detail: `Updated timeline entry "${updated.title}"`,
      ip: clientIp(request),
    });
    return Response.json(updated);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await requireAdminSession();
    if (!session.ok) return session.response;
    if (!isSameOrigin(request)) return jsonError("Forbidden", 403, "FORBIDDEN");

    const existing = await prisma.experience.findUnique({ where: { id: params.id } });
    if (!existing) return jsonError("Record not found.", 404, "NOT_FOUND");
    await prisma.experience.delete({ where: { id: params.id } });

    await logAudit({
      actor: session.session.username,
      action: "delete",
      entity: "experience",
      entityId: params.id,
      detail: `Deleted timeline entry "${existing.title}"`,
      ip: clientIp(request),
    });
    return Response.json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
