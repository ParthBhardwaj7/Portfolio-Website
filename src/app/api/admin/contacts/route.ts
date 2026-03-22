import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { handleRouteError } from "@/lib/errors";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const contacts = await prisma.contact.findMany({ orderBy: { createdAt: "desc" } });
    return Response.json(contacts);
  } catch (e) {
    return handleRouteError(e);
  }
}
