import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { v2 as cloudinary } from "cloudinary";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const PDF_TYPE = "application/pdf";
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_VIDEO_BYTES = 40 * 1024 * 1024;
const MAX_PDF_BYTES = 10 * 1024 * 1024;

function isPdfMagic(buf: Buffer): boolean {
  return buf.length >= 4 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46;
}

/** Valid PDFs start with "%PDF"; do not trust extension or MIME alone (Windows often sends empty type). */
function isPdfBuffer(buf: Buffer): boolean {
  return buf.length >= 4 && isPdfMagic(buf);
}

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

type UploadProvider = "local" | "cloudinary";

function hasCloudinaryCredentials(): boolean {
  if (process.env.CLOUDINARY_URL?.trim()) return true;
  return (
    Boolean(process.env.CLOUDINARY_CLOUD_NAME?.trim()) &&
    Boolean(process.env.CLOUDINARY_API_KEY?.trim()) &&
    Boolean(process.env.CLOUDINARY_API_SECRET?.trim())
  );
}

/** `UPLOAD_PROVIDER` wins when set; else Cloudinary env → cloudinary (common .env-only setup). */
function getProvider(): UploadProvider {
  const raw = process.env.UPLOAD_PROVIDER;
  if (raw !== undefined && String(raw).trim() !== "") {
    const p = String(raw).trim().toLowerCase();
    if (p === "cloudinary") return "cloudinary";
    if (p === "local") return "local";
  }
  if (hasCloudinaryCredentials()) return "cloudinary";
  return "local";
}

/**
 * Loads credentials from `CLOUDINARY_URL` (recommended for deploy) or
 * `CLOUDINARY_CLOUD_NAME` + `CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET`.
 * Format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
 */
function ensureCloudinaryConfigured(): void {
  const url = process.env.CLOUDINARY_URL?.trim();
  const hasTriple =
    Boolean(process.env.CLOUDINARY_CLOUD_NAME?.trim()) &&
    Boolean(process.env.CLOUDINARY_API_KEY?.trim()) &&
    Boolean(process.env.CLOUDINARY_API_SECRET?.trim());

  if (!url && !hasTriple) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET."
    );
  }
  if (url) {
    cloudinary.config(true);
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
    });
  }
}

/** Raw uploads use a stream so large PDFs are not limited by data-URI length. */
async function uploadRawToCloudinary(buf: Buffer): Promise<UploadResult> {
  ensureCloudinaryConfigured();
  const folder = process.env.CLOUDINARY_FOLDER ?? "portfolio";

  return new Promise((resolve, reject) => {
    // v2 wrapper expects (options, callback) — see cloudinary/lib/utils v1_adapter, upload_stream: 0
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "raw" },
      (err: Error | undefined, result?: { secure_url?: string }) => {
        if (err) return reject(err);
        if (!result?.secure_url) return reject(new Error("Cloudinary upload failed."));
        resolve({ url: result.secure_url });
      }
    );

    Readable.from(buf).pipe(stream);
  });
}

async function uploadToCloudinary(
  buf: Buffer,
  type: string,
  resourceType: "image" | "video" | "raw"
): Promise<UploadResult> {
  ensureCloudinaryConfigured();
  const folder = process.env.CLOUDINARY_FOLDER ?? "portfolio";
  if (resourceType === "raw") {
    return uploadRawToCloudinary(buf);
  }
  const dataUri = `data:${type};base64,${buf.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: resourceType,
  });
  if (!result?.secure_url) throw new Error("Cloudinary upload failed.");
  return { url: result.secure_url };
}

export async function saveUploadedPdf(file: File): Promise<UploadResult> {
  if (!file || typeof file === "undefined") {
    throw new Error("No file");
  }
  const buf = Buffer.from(await file.arrayBuffer());
  if (!isPdfBuffer(buf)) {
    throw new Error("Invalid file type. Upload a valid PDF file.");
  }
  if (buf.length > MAX_PDF_BYTES) {
    throw new Error("PDF too large (max 10MB).");
  }

  if (getProvider() === "cloudinary") {
    return uploadRawToCloudinary(buf);
  }

  const name = `${crypto.randomUUID()}.pdf`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  return { url: `/uploads/${name}` };
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

/** Admin upload endpoint: image, video, or PDF (résumé). */
export async function saveUploadedFile(file: File): Promise<UploadResult> {
  const type = file.type || "";
  if (type === PDF_TYPE || type === "application/x-pdf") {
    return saveUploadedPdf(file);
  }
  if (type.startsWith("video/")) {
    return saveUploadedVideo(file);
  }
  if (type.startsWith("image/")) {
    return saveUploadedImage(file);
  }
  // Empty or wrong MIME (common on Windows): sniff PDF by extension / %PDF header
  if (file.name?.toLowerCase().endsWith(".pdf")) {
    return saveUploadedPdf(file);
  }
  if (file.size > 0) {
    const slice = file.slice(0, Math.min(32, file.size));
    const head = Buffer.from(await slice.arrayBuffer());
    if (isPdfMagic(head)) {
      return saveUploadedPdf(file);
    }
  }
  throw new Error("Unsupported file type. Upload an image, video (MP4, WebM, MOV), or PDF.");
}
