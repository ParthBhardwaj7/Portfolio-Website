import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const UPSTREAM = "https://apitest.golfai.in";
const ALLOWED_PREFIX = "t/pgti/india-2026";
const PROXY_PREFIX = "/api/public/golfai";

type Ctx = { params: { path: string[] } };

function allowedPath(parts: string[]): string | null {
  if (!parts.length || parts.some((part) => part === "" || part === "." || part === ".." || part.includes("\\"))) {
    return null;
  }
  const path = parts.map((part) => decodeURIComponent(part)).join("/");
  if (path !== ALLOWED_PREFIX && !path.startsWith(`${ALLOWED_PREFIX}/`)) return null;
  return path;
}

/** Rewrite same-site tournament links so navigation and nested frames stay on our origin. */
function rewriteHtml(html: string): string {
  return html
    .replace(
      /(src|href)=("|'|)\/t\/pgti\/india-2026/g,
      `$1=$2${PROXY_PREFIX}/t/pgti/india-2026`,
    )
    .replace(/<script>window\.__CF\$cv\$params=[\s\S]*?<\/script>/g, "")
    .replace(/<script\b[^>]*cloudflareinsights\.com[^>]*>\s*<\/script>/gi, "");
}

export async function GET(request: Request, { params }: Ctx) {
  const path = allowedPath(params.path ?? []);
  if (!path) return new NextResponse("Not found", { status: 404 });

  const upstreamUrl = new URL(`${UPSTREAM}/${path}`);
  upstreamUrl.search = new URL(request.url).search;

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      cache: "no-store",
      redirect: "follow",
      headers: { accept: "text/html,application/xhtml+xml" },
    });
  } catch {
    return new NextResponse("Tournament page is unavailable.", { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "text/html; charset=utf-8";
  if (!upstream.ok) {
    return new NextResponse(upstream.statusText || "Upstream error", {
      status: upstream.status,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  }

  if (contentType.includes("text/html")) {
    const html = rewriteHtml(await upstream.text());
    return new NextResponse(html, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }

  return new NextResponse(await upstream.arrayBuffer(), {
    status: 200,
    headers: {
      "content-type": contentType,
      "cache-control": "no-store",
    },
  });
}
