import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { handleRouteError, jsonError } from "@/lib/errors";
import { revalidatePublicPages } from "@/lib/revalidate-public";
import { z } from "zod";

const imageUpdateSchema = z.object({
  caption: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

export async function PUT(
  req: Request,
  ctx: { params: { id: string; imageId: string } }
) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const existing = await prisma.portfolioImage.findFirst({
      where: { id: ctx.params.imageId, portfolioId: ctx.params.id },
    });
    if (!existing) return jsonError("Image not found", 404, "NOT_FOUND");

    const body = await req.json();
    const data = imageUpdateSchema.parse(body);
    const updated = await prisma.portfolioImage.update({
      where: { id: ctx.params.imageId },
      data: {
        ...(data.caption !== undefined && { caption: data.caption }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    });
    revalidatePublicPages();
    return Response.json(updated);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: { id: string; imageId: string } }
) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const existing = await prisma.portfolioImage.findFirst({
      where: { id: ctx.params.imageId, portfolioId: ctx.params.id },
    });
    if (!existing) return jsonError("Image not found", 404, "NOT_FOUND");
    await prisma.portfolioImage.delete({ where: { id: ctx.params.imageId } });
    revalidatePublicPages();
    return Response.json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
