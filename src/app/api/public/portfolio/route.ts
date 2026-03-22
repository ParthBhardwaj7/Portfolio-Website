import { prisma } from "@/lib/prisma";
import { handleRouteError } from "@/lib/errors";

export async function GET() {
  try {
    const items = await prisma.portfolio.findMany({ orderBy: { createdAt: "desc" } });
    return Response.json(items);
  } catch (e) {
    return handleRouteError(e);
  }
}
