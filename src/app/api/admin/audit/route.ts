import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { handleRouteError } from "@/lib/errors";

export async function GET(request: Request) {
  try {
    const session = await requireAdminSession();
    if (!session.ok) return session.response;
    const url = new URL(request.url);
    const take = Math.min(Number(url.searchParams.get("take") ?? 100), 200);
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take,
    });
    return Response.json(logs);
  } catch (e) {
    return handleRouteError(e);
  }
}
