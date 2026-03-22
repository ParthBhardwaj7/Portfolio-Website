import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { handleRouteError } from "@/lib/errors";

export async function DELETE(_request: Request, ctx: { params: { id: string } }) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const { id } = ctx.params;
    await prisma.contact.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
