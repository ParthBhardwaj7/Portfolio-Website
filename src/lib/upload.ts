import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_VIDEO_BYTES = 40 * 1024 * 1024;

const IMAGE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const VIDEO_EXT: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export type UploadResult = { url: string };

function getProvider() {
  return process.env.UPLOAD_PROVIDER === "cloudinary" ? "cloudinary" : "local";
}

async function uploadToCloudinary(
  buf: Buffer,
  type: string,
  resourceType: "image" | "video"
): Promise<UploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured.");
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  const folder = process.env.CLOUDINARY_FOLDER ?? "portfolio";
  const dataUri = `data:${type};base64,${buf.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: resourceType,
  });
  if (!result?.secure_url) throw new Error("Cloudinary upload failed.");
  return { url: result.secure_url };
}

export async function saveUploadedImage(file: File): Promise<UploadResult> {
  if (!file || typeof file === "undefined") {
    throw new Error("No file");
  }
  const type = file.type || "";
  if (!IMAGE_TYPES.has(type)) {
    throw new Error("Invalid file type. Use JPEG, PNG, WebP, or GIF.");
  }
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_IMAGE_BYTES) {
    throw new Error("File too large (max 4MB).");
  }

  if (getProvider() === "cloudinary") {
    return uploadToCloudinary(buf, type, "image");
  }

  const ext = IMAGE_EXT[type] ?? "bin";
  const name = `${crypto.randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const fsPath = path.join(dir, name);
  await writeFile(fsPath, buf);
  return { url: `/uploads/${name}` };
}

export async function saveUploadedVideo(file: File): Promise<UploadResult> {
  if (!file || typeof file === "undefined") {
    throw new Error("No file");
  }
  const type = file.type || "";
  if (!VIDEO_TYPES.has(type)) {
    throw new Error("Invalid video type. Use MP4, WebM, or MOV.");
  }
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_VIDEO_BYTES) {
    throw new Error("Video too large (max 40MB).");
  }

  if (getProvider() === "cloudinary") {
    return uploadToCloudinary(buf, type, "video");
  }

  const ext = VIDEO_EXT[type] ?? "mp4";
  const name = `${crypto.randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const fsPath = path.join(dir, name);
  await writeFile(fsPath, buf);
  return { url: `/uploads/${name}` };
}

/** Admin upload endpoint: image or video based on MIME type. */
export async function saveUploadedFile(file: File): Promise<UploadResult> {
  const type = file.type || "";
  if (type.startsWith("video/")) {
    return saveUploadedVideo(file);
  }
  if (type.startsWith("image/")) {
    return saveUploadedImage(file);
  }
  throw new Error("Unsupported file type. Upload an image or a video (MP4, WebM, MOV).");
}
