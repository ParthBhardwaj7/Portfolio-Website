import { prisma } from "@/lib/prisma";
import { handleRouteError } from "@/lib/errors";

export async function GET() {
  try {
    const about = await prisma.about.findFirst();
    if (!about) {
      return Response.json(
        {
          content: "",
          profileImage: null,
          unavailable: false,
        },
        { status: 200 }
      );
    }
    return Response.json(about);
  } catch (e) {
    return handleRouteError(e);
  }
}
