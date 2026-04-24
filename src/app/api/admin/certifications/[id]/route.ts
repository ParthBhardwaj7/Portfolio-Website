import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { certificationUpdateSchema } from "@/lib/validation";
import { handleRouteError, jsonError } from "@/lib/errors";
import { z } from "zod";

const uuidSchema = z.string().uuid();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  void request;
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const id = uuidSchema.parse(params.id);
    const cert = await prisma.certification.findUnique({ where: { id } });
    if (!cert) return jsonError("Certification not found.", 404, "NOT_FOUND");
    return Response.json(cert);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const id = uuidSchema.parse(params.id);
    const body = await request.json();
    const data = certificationUpdateSchema.parse(body);

    if (Object.keys(data).length === 0) {
      return jsonError("No fields to update.", 400, "VALIDATION");
    }

    const cert = await prisma.certification.update({
      where: { id },
      data,
    });
    return Response.json(cert);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  void request;
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const id = uuidSchema.parse(params.id);
    await prisma.certification.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    return handleRouteError(e);
  }
}
