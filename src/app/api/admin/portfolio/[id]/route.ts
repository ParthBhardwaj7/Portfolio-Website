import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { portfolioItemUpdateSchema } from "@/lib/validation";
import { handleRouteError, jsonError } from "@/lib/errors";
import { emptyToNull } from "@/lib/normalize";
import { revalidatePublicPages } from "@/lib/revalidate-public";

export async function PUT(request: Request, ctx: { params: { id: string } }) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const { id } = ctx.params;
    const body = await request.json();
    const data = portfolioItemUpdateSchema.parse({ ...body, id });
    const existing = await prisma.portfolio.findUnique({ where: { id: data.id } });
    if (!existing) return jsonError("Not found", 404, "NOT_FOUND");
    const item = await prisma.portfolio.update({
      where: { id: data.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.image !== undefined && { image: emptyToNull(data.image ?? undefined) }),
        ...(data.link !== undefined && { link: emptyToNull(data.link ?? undefined) }),
        ...(data.galleryCaption !== undefined && {
          galleryCaption: emptyToNull(data.galleryCaption ?? undefined),
        }),
        ...(data.videoUrl !== undefined && {
          videoUrl: emptyToNull(data.videoUrl ?? undefined),
        }),
      },
      include: { images: { orderBy: { sortOrder: "asc" } } },
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
    await prisma.portfolio.delete({ where: { id } });
    revalidatePublicPages();
    return Response.json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
