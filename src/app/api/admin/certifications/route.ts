import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { certificationCreateSchema } from "@/lib/validation";
import { handleRouteError } from "@/lib/errors";

export async function GET(request: Request) {
  void request;
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const rows = await prisma.certification.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return Response.json(rows);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const body = await request.json();
    const data = certificationCreateSchema.parse(body);

    const maxRow = await prisma.certification.aggregate({ _max: { sortOrder: true } });
    const nextOrder = (maxRow._max.sortOrder ?? -1) + 1;

    const cert = await prisma.certification.create({
      data: {
        title: data.title,
        issuer: data.issuer,
        issueDate: data.issueDate ?? null,
        imageUrl: data.imageUrl ?? null,
        pdfUrl: data.pdfUrl ?? null,
        credentialUrl: data.credentialUrl ?? null,
        sortOrder: data.sortOrder ?? nextOrder,
      },
    });
    return Response.json(cert, { status: 201 });
  } catch (e) {
    return handleRouteError(e);
  }
}
