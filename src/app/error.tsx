"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Catches errors in the root `layout` subtree (outside `(public)` when applicable). */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <h1 className="font-display text-2xl tracking-tight text-foreground">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted">
        {error.message || "An unexpected error occurred. You can try again or go back home."}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full border border-border bg-background px-5 py-2 text-sm text-foreground transition-colors hover:bg-muted/40"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-border px-5 py-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
