import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { skillItemCreateSchema } from "@/lib/validation";
import { handleRouteError, jsonError } from "@/lib/errors";
import { revalidatePublicPages } from "@/lib/revalidate-public";

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const body = await request.json();
    const data = skillItemCreateSchema.parse(body);
    const cat = await prisma.skillCategory.findUnique({ where: { id: data.categoryId } });
    if (!cat) return jsonError("Category not found", 404, "NOT_FOUND");
    const max = await prisma.skillItem.aggregate({
      where: { categoryId: data.categoryId },
      _max: { sortOrder: true },
    });
    const sortOrder = (max._max.sortOrder ?? -1) + 1;
    const item = await prisma.skillItem.create({
      data: {
        categoryId: data.categoryId,
        label: data.label.trim(),
        sortOrder,
      },
    });
    revalidatePublicPages();
    return Response.json(item);
  } catch (e) {
    return handleRouteError(e);
  }
}
