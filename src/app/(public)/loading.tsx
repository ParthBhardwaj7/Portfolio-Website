/** Minimal shell while the public route loads — no motion, matches section rhythm. */
export default function PublicLoading() {
  return (
    <div className="flex flex-col gap-14 py-6 sm:gap-16 sm:py-8" aria-hidden>
      <div className="space-y-4">
        <div className="h-3 w-28 rounded bg-muted/35" />
        <div className="h-14 max-w-lg rounded bg-muted/25" />
        <div className="h-5 max-w-sm rounded bg-muted/20" />
        <div className="h-4 max-w-xl rounded bg-muted/15" />
      </div>
      <div className="grid gap-8 border-t border-border/40 pt-14 sm:pt-16 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="h-8 w-32 rounded bg-muted/25" />
          <div className="h-4 w-full max-w-md rounded bg-muted/15" />
        </div>
        <div className="h-40 rounded-2xl bg-muted/20" />
      </div>
      <div className="space-y-4 border-t border-border/40 pt-14 sm:pt-16">
        <div className="h-8 w-24 rounded bg-muted/25" />
        <div className="h-32 rounded-xl bg-muted/15" />
      </div>
    </div>
  );
}
