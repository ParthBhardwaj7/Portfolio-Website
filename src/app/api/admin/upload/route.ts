import { requireAdminSession } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/upload";
import { handleRouteError, jsonError } from "@/lib/errors";

export async function POST(request: Request) {
  const auth = await requireAdminSession();
  if (!auth.ok) return auth.response;
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return jsonError("Missing file field \"file\"", 400, "VALIDATION");
    }
    const { url } = await saveUploadedFile(file);
    return Response.json({ url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    if (msg.includes("Invalid") || msg.includes("large") || msg.includes("No file")) {
      return jsonError(msg, 400, "UPLOAD");
    }
    if (msg.includes("Cloudinary") || msg.includes("not configured")) {
      return jsonError(msg, 503, "UPLOAD_CONFIG");
    }
    return handleRouteError(e);
  }
}
