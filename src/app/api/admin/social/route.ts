import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { socialUpdateSchema } from "@/lib/validation";
import { handleRouteError } from "@/lib/errors";
import { emptyToNull } from "@/lib/normalize";
import { revalidatePublicPages } from "@/lib/revalidate-public";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    let social = await prisma.social.findFirst();
    if (!social) {
      social = await prisma.social.create({ data: {} });
    }
    return Response.json(social);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const body = await request.json();
    const data = socialUpdateSchema.parse(body);
    let social = await prisma.social.findFirst();
    const payload = {
      github: emptyToNull(data.github ?? undefined),
      linkedin: emptyToNull(data.linkedin ?? undefined),
      instagram: emptyToNull(data.instagram ?? undefined),
      twitter: emptyToNull(data.twitter ?? undefined),
    };
    if (!social) {
      social = await prisma.social.create({ data: payload });
    } else {
      social = await prisma.social.update({
        where: { id: social.id },
        data: payload,
      });
    }
    revalidatePublicPages();
    return Response.json(social);
  } catch (e) {
    return handleRouteError(e);
  }
}
