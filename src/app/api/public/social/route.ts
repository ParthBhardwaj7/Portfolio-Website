import { prisma } from "@/lib/prisma";
import { handleRouteError } from "@/lib/errors";

export async function GET() {
  try {
    const social = await prisma.social.findFirst();
    if (!social) {
      return Response.json({
        github: null,
        linkedin: null,
        instagram: null,
        twitter: null,
      });
    }
    return Response.json(social);
  } catch (e) {
    return handleRouteError(e);
  }
}
