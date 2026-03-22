/** Shared JSON fetch for authenticated admin API routes. */

function redirectToLoginIfUnauthorized(res: Response): void {
  if (res.status !== 401) return;
  if (typeof window !== "undefined") {
    window.location.assign("/admin/login");
  }
}

export async function adminFetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, credentials: "include" });
  redirectToLoginIfUnauthorized(res);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.error === "string" ? data.error : res.statusText;
    throw new Error(msg);
  }
  return data as T;
}
