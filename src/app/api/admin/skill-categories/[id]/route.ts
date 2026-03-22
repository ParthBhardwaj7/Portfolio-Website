import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { skillCategoryUpdateSchema } from "@/lib/validation";
import { handleRouteError, jsonError } from "@/lib/errors";
import { revalidatePublicPages } from "@/lib/revalidate-public";

export async function PUT(request: Request, ctx: { params: { id: string } }) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const { id } = ctx.params;
    const body = await request.json();
    const data = skillCategoryUpdateSchema.parse(body);
    const existing = await prisma.skillCategory.findUnique({ where: { id } });
    if (!existing) return jsonError("Not found", 404, "NOT_FOUND");
    const category = await prisma.skillCategory.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title.trim() }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });
    revalidatePublicPages();
    return Response.json(category);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(_request: Request, ctx: { params: { id: string } }) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const { id } = ctx.params;
    await prisma.skillCategory.delete({ where: { id } });
    revalidatePublicPages();
    return Response.json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
