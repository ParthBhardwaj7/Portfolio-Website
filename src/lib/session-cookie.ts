/**
 * In production, `Secure` cookies are not stored over plain HTTP (many VPS / internal URLs).
 * Set SESSION_COOKIE_INSECURE=1 in .env only when you intentionally serve over HTTP.
 */
export function sessionCookieSecure(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  const insecure =
    process.env.SESSION_COOKIE_INSECURE === "1" ||
    process.env.SESSION_COOKIE_INSECURE === "true";
  return !insecure;
}
