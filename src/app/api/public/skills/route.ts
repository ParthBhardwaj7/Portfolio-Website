import { prisma } from "@/lib/prisma";
import { handleRouteError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
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
