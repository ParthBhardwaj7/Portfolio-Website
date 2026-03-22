import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { skillCategoryCreateSchema } from "@/lib/validation";
import { handleRouteError } from "@/lib/errors";
import { revalidatePublicPages } from "@/lib/revalidate-public";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const categories = await prisma.skillCategory.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
      },
    });
    return Response.json(categories);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const body = await request.json();
    const data = skillCategoryCreateSchema.parse(body);
    const max = await prisma.skillCategory.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (max._max.sortOrder ?? -1) + 1;
    const category = await prisma.skillCategory.create({
      data: { title: data.title.trim(), sortOrder },
      include: { items: true },
    });
    revalidatePublicPages();
    return Response.json(category);
  } catch (e) {
    return handleRouteError(e);
  }
}
