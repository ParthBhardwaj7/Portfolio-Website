"use client";

const EMAIL_RE = /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g;

type Seg = { t: "text" | "email"; v: string };

function segmentize(text: string): Seg[] {
  const out: Seg[] = [];
  if (text === "") return [{ t: "text", v: "" }];
  let last = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(EMAIL_RE.source, "g");
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ t: "text", v: text.slice(last, m.index) });
    out.push({ t: "email", v: m[0] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ t: "text", v: text.slice(last) });
  return out;
}

/**
 * Renders plain text; email-like substrings become mailto links.
 */
export function TextWithEmailLink({
  text,
  className,
  linkClassName,
}: {
  text: string;
  className?: string;
  linkClassName?: string;
}) {
  const linkCls =
    linkClassName ??
    "font-medium text-foreground underline decoration-foreground/40 underline-offset-[3px] transition-colors hover:text-accent hover:decoration-accent";

  const segs = segmentize(text);

  return (
    <span className={className}>
      {segs.map((s, i) =>
        s.t === "email" ? (
          <a key={i} href={`mailto:${s.v}`} className={linkCls}>
            {s.v}
          </a>
        ) : (
          <span key={i}>{s.v}</span>
        )
      )}
    </span>
  );
}
