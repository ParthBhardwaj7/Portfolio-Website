import type { Metadata } from "next";
import Link from "next/link";
import { getPublicAbout } from "@/lib/public-data";
import { resolvePublicResumeUrl } from "@/lib/site-config";
import { FadeIn } from "@/components/lab/fade-in";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Résumé",
  description: "Résumé of Parth Bhardwaj — Backend Engineer · AI × Cloud × Systems.",
};

export default async function ResumePage() {
  const about = await getPublicAbout();
  const resumeUrl = resolvePublicResumeUrl(about?.resumeUrl);

  return (
    <div className="container-x pb-10 pt-28 sm:pt-36">
      <section className="w-fit">
        <FadeIn>
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-copper"
          >
            <span aria-hidden>←</span> Home
          </Link>
          <h1 className="mt-6 font-display text-4xl font-medium tracking-tight sm:text-5xl">
            Résumé
          </h1>
          <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
            The full record — experience, stack, and credentials. View it inline or take the PDF
            with you.
          </p>
          {resumeUrl && (
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/api/public/resume"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-copper"
              >
                View PDF <span aria-hidden>↗</span>
              </a>
              <a
                href="/api/public/resume?download=1"
                className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-2.5 text-sm transition-colors hover:border-copper hover:text-copper"
              >
                Download
              </a>
            </div>
          )}
        </FadeIn>
      </section>

      <FadeIn delay={0.15} className="mt-12 min-h-[60vh]">
        {resumeUrl ? (
          <object
            data="/api/public/resume"
            type="application/pdf"
            className="h-[75vh] min-h-[480px] w-full rounded-xl border border-line bg-surface-2"
            aria-label="Résumé PDF viewer"
          >
            <div className="glass p-8 text-sm text-muted-foreground">
              Inline PDF preview is not supported by this browser.{" "}
              <a
                href="/api/public/resume"
                target="_blank"
                rel="noopener noreferrer"
                className="text-copper"
              >
                Open the PDF directly
              </a>
              .
            </div>
          </object>
        ) : (
          <div className="glass p-8 text-sm text-muted-foreground">
            No résumé uploaded yet — set it in Admin → About (résumé URL).
          </div>
        )}
      </FadeIn>
    </div>
  );
}
