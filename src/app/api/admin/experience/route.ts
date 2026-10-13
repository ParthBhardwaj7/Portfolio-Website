import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { handleRouteError, jsonError } from "@/lib/errors";
import { experienceCreateSchema } from "@/lib/validation-experience";
import { clientIp, isSameOrigin, logAudit, sanitizeText } from "@/lib/security";

export async function GET() {
  try {
    const session = await requireAdminSession();
    if (!session.ok) return session.response;
    const items = await prisma.experience.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return Response.json(items);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminSession();
    if (!session.ok) return session.response;
    if (!isSameOrigin(request)) return jsonError("Forbidden", 403, "FORBIDDEN");

    const body = await request.json();
    const data = experienceCreateSchema.parse(body);
    const created = await prisma.experience.create({
      data: {
        year: sanitizeText(data.year),
        title: sanitizeText(data.title),
        org: data.org ? sanitizeText(data.org) : null,
        type: data.type ?? "project",
        description: sanitizeText(data.description),
        technologies: data.technologies ?? null,
        url: data.url ?? null,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    await logAudit({
      actor: session.session.username,
      action: "create",
      entity: "experience",
      entityId: created.id,
      detail: `Created timeline entry "${created.title}"`,
      ip: clientIp(request),
    });
    return Response.json(created, { status: 201 });
  } catch (e) {
    return handleRouteError(e);
  }
}
