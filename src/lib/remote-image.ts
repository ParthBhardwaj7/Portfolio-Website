/**
 * Local disk + Cloudinary (and similar CDNs) — use unoptimized Next/Image so the browser
 * loads the URL directly. Next's optimizer can 400/500 on some Cloudinary delivery URLs.
 */
export function isUnoptimizedImageSrc(src: string | null | undefined): boolean {
  if (src == null || typeof src !== "string") return true;
  const u = src.trim();
  if (u.length === 0) return true;
  if (u.startsWith("/uploads/")) return true;
  if (/cloudinary\.com/i.test(u)) return true;
  return false;
}
