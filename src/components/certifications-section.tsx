"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type Certification = {
  id: string;
  title: string;
  issuer: string;
  issueDate: string | null;
  imageUrl: string | null;
  pdfUrl: string | null;
  credentialUrl: string | null;
};

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  cert,
  onClose,
}: {
  cert: Certification;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative flex max-h-[92vh] max-w-3xl flex-col gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f] p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm text-white hover:bg-white/20"
        >
          ✕
        </button>

        {/* Image */}
        {cert.imageUrl && (
          <div className="flex-1 overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cert.imageUrl}
              alt={cert.title}
              className="max-h-[60vh] w-full object-contain"
            />
          </div>
        )}

        {/* Info */}
        <div className="space-y-1 px-1">
          <p className="text-base font-semibold text-white">{cert.title}</p>
          <p className="text-sm text-white/60">{cert.issuer}</p>
          {cert.issueDate && (
            <p className="text-xs text-white/40">{cert.issueDate}</p>
          )}
        </div>

        {/* Actions */}
        {(cert.pdfUrl || cert.credentialUrl) && (
          <div className="flex flex-wrap gap-2 px-1">
            {cert.pdfUrl && (
              <a
                href={cert.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                View PDF
              </a>
            )}
            {cert.credentialUrl && (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Verify Credential
              </a>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Single Certificate Card ──────────────────────────────────────────────────

function CertCard({
  cert,
  onView,
  index,
}: {
  cert: Certification;
  onView: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-[var(--foreground)]/[0.02] dark:bg-white/[0.03] p-4 transition hover:border-[var(--accent)]/40"
    >
      {/* Image */}
      {cert.imageUrl ? (
        <button
          type="button"
          onClick={onView}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-[var(--foreground)]/[0.04] dark:bg-white/[0.04]"
          aria-label={`View ${cert.title} certificate`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cert.imageUrl}
            alt={cert.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/25">
            <span className="translate-y-1 scale-90 rounded-full bg-white/20 px-3 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur-sm transition duration-300 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
              View certificate
            </span>
          </div>
        </button>
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl border border-dashed border-border bg-[var(--foreground)]/[0.02]">
          <span className="text-4xl opacity-20">🏆</span>
        </div>
      )}

      {/* Info */}
      <div className="flex-1 space-y-0.5">
        <p className="text-sm font-semibold text-[var(--foreground)] leading-snug">{cert.title}</p>
        <p className="text-xs text-[var(--muted)]">{cert.issuer}</p>
        {cert.issueDate && (
          <p className="text-[11px] text-[var(--muted)]/70">{cert.issueDate}</p>
        )}
      </div>

      {/* Links */}
      {(cert.pdfUrl || cert.credentialUrl || cert.imageUrl) && (
        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
          {cert.imageUrl && (
            <button
              type="button"
              onClick={onView}
              className="rounded-full border border-border px-3 py-1 text-[11px] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              View →
            </button>
          )}
          {cert.pdfUrl && (
            <a
              href={cert.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-3 py-1 text-[11px] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              PDF ↗
            </a>
          )}
          {cert.credentialUrl && (
            <a
              href={cert.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-3 py-1 text-[11px] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Verify ↗
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function CertificationsSection({
  certifications,
}: {
  certifications: Certification[];
}) {
  const [active, setActive] = useState<Certification | null>(null);

  if (certifications.length === 0) return null;

  return (
    <>
      <AnimatePresence>
        {active && (
          <Lightbox cert={active} onClose={() => setActive(null)} />
        )}
      </AnimatePresence>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((cert, i) => (
          <CertCard
            key={cert.id}
            cert={cert}
            index={i}
            onView={() => setActive(cert)}
          />
        ))}
      </div>
    </>
  );
}
