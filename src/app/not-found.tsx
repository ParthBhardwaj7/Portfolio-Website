import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 | Not found",
  description: "Page not found.",
};

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="bg-grid bg-grid-fade absolute inset-0 opacity-40" aria-hidden />
      <p className="relative font-mono text-xs uppercase tracking-[0.3em] text-copper">
        Error 404 — route not found
      </p>
      <h1 className="relative mt-6 font-display text-[clamp(4rem,14vw,10rem)] font-medium leading-none tracking-tight">
        404
      </h1>
      <p className="relative mt-6 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
        This endpoint doesn&apos;t exist. The rest of the system is running normally — head back
        and explore the work.
      </p>
      <Link
        href="/"
        className="group relative mt-10 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-copper"
      >
        Back to home
        <span className="transition-transform group-hover:-translate-x-1">←</span>
      </Link>
    </div>
  );
}
