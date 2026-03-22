import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 4 * 1024 * 1024;

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export type UploadResult = { url: string };

function getProvider() {
  return process.env.UPLOAD_PROVIDER === "cloudinary" ? "cloudinary" : "local";
}

export async function saveUploadedImage(file: File): Promise<UploadResult> {
  if (!file || typeof file === "undefined") {
    throw new Error("No file");
  }
  const type = file.type || "";
  if (!ALLOWED.has(type)) {
    throw new Error("Invalid file type. Use JPEG, PNG, WebP, or GIF.");
  }
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_BYTES) {
    throw new Error("File too large (max 4MB).");
  }

  if (getProvider() === "cloudinary") {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cloudinary is not configured.");
    }
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    const folder = process.env.CLOUDINARY_FOLDER ?? "portfolio";
    const dataUri = `data:${type};base64,${buf.toString("base64")}`;
    const result = await cloudinary.uploader.upload(dataUri, { folder });
    if (!result?.secure_url) throw new Error("Cloudinary upload failed.");
    return { url: result.secure_url };
  }

  const ext = EXT[type] ?? "bin";
  const name = `${crypto.randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const fsPath = path.join(dir, name);
  await writeFile(fsPath, buf);
  return { url: `/uploads/${name}` };
}
