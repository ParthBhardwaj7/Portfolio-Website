import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { portfolioCreateSchema } from "@/lib/validation";
import { handleRouteError } from "@/lib/errors";
import { emptyToNull } from "@/lib/normalize";
import { revalidatePublicPages } from "@/lib/revalidate-public";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const items = await prisma.portfolio.findMany({
      orderBy: { createdAt: "desc" },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
    return Response.json(items);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const body = await request.json();
    const data = portfolioCreateSchema.parse(body);
    const item = await prisma.portfolio.create({
      data: {
        title: data.title,
        description: data.description,
        image: emptyToNull(data.image ?? undefined),
        link: emptyToNull(data.link ?? undefined),
        galleryCaption: emptyToNull(data.galleryCaption ?? undefined),
        videoUrl: emptyToNull(data.videoUrl ?? undefined),
      },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    });
    revalidatePublicPages();
    return Response.json(item);
  } catch (e) {
    return handleRouteError(e);
  }
}
