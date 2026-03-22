import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validation";
import { handleRouteError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = contactSchema.parse(body);
    await prisma.contact.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        message: data.message,
      },
    });
    return Response.json({ ok: true, message: "Thanks — your message was sent." });
  } catch (e) {
    return handleRouteError(e);
  }
}
