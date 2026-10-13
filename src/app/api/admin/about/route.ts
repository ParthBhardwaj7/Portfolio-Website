import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";
import { aboutUpdateSchema } from "@/lib/validation";
import { handleRouteError } from "@/lib/errors";
import { emptyToNull } from "@/lib/normalize";
import { revalidatePublicPages } from "@/lib/revalidate-public";

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    let about = await prisma.about.findFirst();
    if (!about) {
      about = await prisma.about.create({
        data: { content: "Edit your about text in the admin panel." },
      });
    }
    return Response.json(about);
  } catch (e) {
    return handleRouteError(e);
  }
}

export async function PUT(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const body = await request.json();
    const data = aboutUpdateSchema.parse(body);
    let about = await prisma.about.findFirst();
    const profileImage = emptyToNull(data.profileImage ?? undefined);
    const heroTagline = emptyToNull(data.heroTagline ?? undefined);
    const contactCaption = emptyToNull(data.contactCaption ?? undefined);
    const resumeUrl = emptyToNull(data.resumeUrl ?? undefined);
    const favicon = emptyToNull(data.favicon ?? undefined);
    const ogImage = emptyToNull(data.ogImage ?? undefined);

    const payload = {
      content: data.content,
      profileImage,
      heroTagline,
      contactCaption,
      resumeUrl,
      favicon,
      ogImage,
      chatEnabled: data.chatEnabled,
    };

    if (!about) {
      about = await prisma.about.create({
        data: payload,
      });
    } else {
      about = await prisma.about.update({
        where: { id: about.id },
        data: payload,
      });
    }
    revalidatePublicPages();
    return Response.json(about);
  } catch (e) {
    return handleRouteError(e);
  }
}
