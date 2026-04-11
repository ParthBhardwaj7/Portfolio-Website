import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { handleRouteError, jsonError } from "@/lib/errors";
import { revalidatePublicPages } from "@/lib/revalidate-public";
import { z } from "zod";

const imageCreateSchema = z.object({
  url: z
    .string()
    .min(1)
    .max(2000)
    .refine(
      (v) => v.startsWith("/uploads/") || v.startsWith("https://") || v.startsWith("http://"),
      "Must be a valid URL or /uploads/ path"
    ),
  caption: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const images = await prisma.portfolioImage.findMany({
      where: { portfolioId: ctx.params.id },
      orderBy: { sortOrder: "asc" },
    });
    return Response.json(images);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const portfolio = await prisma.portfolio.findUnique({ where: { id: ctx.params.id } });
    if (!portfolio) return jsonError("Portfolio item not found", 404, "NOT_FOUND");

    const body = await req.json();
    const data = imageCreateSchema.parse(body);

    const maxOrder = await prisma.portfolioImage.aggregate({
      where: { portfolioId: ctx.params.id },
      _max: { sortOrder: true },
    });
    const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const image = await prisma.portfolioImage.create({
      data: {
        portfolioId: ctx.params.id,
        url: data.url,
        caption: data.caption ?? null,
        sortOrder: data.sortOrder ?? nextOrder,
      },
    });
    revalidatePublicPages();
    return Response.json(image);
  } catch (e) {
    return handleRouteError(e);
  }
}
