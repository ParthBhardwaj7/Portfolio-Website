import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolvePublicResumeUrl } from "@/lib/site-config";

export const dynamic = "force-dynamic";

function attachmentFilename(): string {
  const raw = process.env.NEXT_PUBLIC_HERO_NAME?.trim() || "Resume";
  const safe = raw
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  const base = safe.length > 0 ? safe : "Resume";
  return `${base}-Resume.pdf`;
}

function isAllowedHttpsFetch(url: URL): boolean {
  if (url.protocol !== "https:") return false;
  const h = url.hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost")) return false;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) return false;
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const about = await prisma.about.findFirst();
    const src = resolvePublicResumeUrl(about?.resumeUrl);
    if (!src) {
      return NextResponse.json({ error: "No résumé configured" }, { status: 404 });
    }

    const download = request.nextUrl.searchParams.get("download") === "1";
    const disposition = download ? "attachment" : "inline";
    const filename = attachmentFilename();

    let body: Buffer;

    if (src.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", src.replace(/^\/+/, ""));
      body = await readFile(filePath);
    } else {
      let remote: URL;
      try {
        remote = new URL(src);
      } catch {
        return NextResponse.json({ error: "Invalid résumé URL" }, { status: 400 });
      }
      if (!isAllowedHttpsFetch(remote)) {
        return NextResponse.json({ error: "Invalid résumé URL" }, { status: 400 });
      }

      const res = await fetch(remote.toString(), {
        headers: { Accept: "application/pdf,*/*" },
        next: { revalidate: 0 },
      });
      if (!res.ok) {
        return NextResponse.json({ error: "Could not load résumé file" }, { status: 502 });
      }
      body = Buffer.from(await res.arrayBuffer());
    }

    const quoted = filename.replace(/"/g, "\\\"");

    return new NextResponse(new Uint8Array(body), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${quoted}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Résumé unavailable" }, { status: 500 });
  }
}
