import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { skillItemUpdateSchema } from "@/lib/validation";
import { handleRouteError, jsonError } from "@/lib/errors";
import { revalidatePublicPages } from "@/lib/revalidate-public";

export async function PUT(request: Request, ctx: { params: { id: string } }) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const { id } = ctx.params;
    const body = await request.json();
    const data = skillItemUpdateSchema.parse(body);
    const existing = await prisma.skillItem.findUnique({ where: { id } });
    if (!existing) return jsonError("Not found", 404, "NOT_FOUND");
    const item = await prisma.skillItem.update({
      where: { id },
      data: {
        ...(data.label !== undefined && { label: data.label.trim() }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    });
    revalidatePublicPages();
    return Response.json(item);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(_request: Request, ctx: { params: { id: string } }) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const { id } = ctx.params;
    await prisma.skillItem.delete({ where: { id } });
    revalidatePublicPages();
    return Response.json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
