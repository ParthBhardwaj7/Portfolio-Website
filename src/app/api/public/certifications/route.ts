import { prisma } from "@/lib/prisma";
import { handleRouteError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await prisma.certification.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        issuer: true,
        issueDate: true,
        imageUrl: true,
        pdfUrl: true,
        credentialUrl: true,
        sortOrder: true,
      },
    });
    return Response.json(rows);
  } catch (e) {
    return handleRouteError(e);
  }
}
