"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Certification = {
  id: string;
  title: string;
  issuer: string;
  issueDate: string | null;
  imageUrl: string | null;
  pdfUrl: string | null;
  credentialUrl: string | null;
  sortOrder: number;
  createdAt: string;
};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, credentials: "include" });
  if (res.status === 401) {
    if (typeof window !== "undefined") window.location.assign("/admin/login");
    throw new Error("Session expired.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : res.statusText);
  }
  return data as T;
}

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  if (res.status === 401) {
    if (typeof window !== "undefined") window.location.assign("/admin/login");
    throw new Error("Session expired.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Upload failed");
  return data.url as string;
}

// ─── Image Lightbox ───────────────────────────────────────────────────────────

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        aria-label="Close"
      >
        ✕
      </button>
      <div
        className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Certificate"
          className="max-h-[90vh] max-w-[90vw] object-contain"
        />
      </div>
    </div>
  );
}

// ─── Add / Edit Form ──────────────────────────────────────────────────────────

function CertForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Certification;
  onSave: (cert: Certification) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [issuer, setIssuer] = useState(initial?.issuer ?? "");
  const [issueDate, setIssueDate] = useState(initial?.issueDate ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [pdfUrl, setPdfUrl] = useState(initial?.pdfUrl ?? "");
  const [credentialUrl, setCredentialUrl] = useState(initial?.credentialUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    setError(null);
    try {
      const url = await uploadFile(file);
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingImg(false);
      if (imgInputRef.current) imgInputRef.current.value = "";
    }
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    setError(null);
    try {
      const url = await uploadFile(file);
      setPdfUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF upload failed");
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !issuer.trim()) {
      setError("Title and Issuer are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        issuer: issuer.trim(),
        issueDate: issueDate.trim() || null,
        imageUrl: imageUrl.trim() || null,
        pdfUrl: pdfUrl.trim() || null,
        credentialUrl: credentialUrl.trim() || null,
      };
      let cert: Certification;
      if (initial) {
        cert = await api<Certification>(`/api/admin/certifications/${initial.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        cert = await api<Certification>("/api/admin/certifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      onSave(cert);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/40 transition";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-5">
      <h3 className="text-sm font-semibold text-white">
        {initial ? "Edit Certificate" : "Add Certificate"}
      </h3>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs text-white/60">Title *</label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="AWS Solutions Architect"
            maxLength={200}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-white/60">Issuer *</label>
          <input
            className={inputClass}
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            placeholder="Amazon Web Services"
            maxLength={200}
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-white/60">Issue Date</label>
        <input
          className={inputClass}
          value={issueDate}
          onChange={(e) => setIssueDate(e.target.value)}
          placeholder="March 2024"
          maxLength={100}
        />
      </div>

      {/* Certificate Image */}
      <div className="space-y-2">
        <label className="text-xs text-white/60">Certificate Image (PNG, JPG, WebP)</label>
        <div className="flex items-center gap-3">
          <input
            ref={imgInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImageUpload}
            className="hidden"
            id="cert-img-upload"
          />
          <label
            htmlFor="cert-img-upload"
            className="cursor-pointer rounded-lg border border-white/20 px-3 py-2 text-xs text-white/70 hover:bg-white/10 transition"
          >
            {uploadingImg ? "Uploading…" : imageUrl ? "Replace Image" : "Upload Image"}
          </label>
          {imageUrl && (
            <div className="relative h-12 w-20 flex-shrink-0 overflow-hidden rounded-md border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          {imageUrl && (
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          )}
        </div>
        <input
          className={inputClass + " mt-1"}
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Or paste image URL"
          maxLength={2000}
        />
      </div>

      {/* Certificate PDF */}
      <div className="space-y-2">
        <label className="text-xs text-white/60">Certificate PDF (max 10 MB)</label>
        <div className="flex items-center gap-3">
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            onChange={handlePdfUpload}
            className="hidden"
            id="cert-pdf-upload"
          />
          <label
            htmlFor="cert-pdf-upload"
            className="cursor-pointer rounded-lg border border-white/20 px-3 py-2 text-xs text-white/70 hover:bg-white/10 transition"
          >
            {uploadingPdf ? "Uploading…" : pdfUrl ? "Replace PDF" : "Upload PDF"}
          </label>
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline"
            >
              View PDF ↗
            </a>
          )}
          {pdfUrl && (
            <button
              type="button"
              onClick={() => setPdfUrl("")}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          )}
        </div>
        <input
          className={inputClass + " mt-1"}
          value={pdfUrl}
          onChange={(e) => setPdfUrl(e.target.value)}
          placeholder="Or paste PDF URL"
          maxLength={2000}
        />
      </div>

      {/* Credential URL */}
      <div className="space-y-1">
        <label className="text-xs text-white/60">Credential / Verify URL</label>
        <input
          className={inputClass}
          value={credentialUrl}
          onChange={(e) => setCredentialUrl(e.target.value)}
          placeholder="https://www.credly.com/badges/…"
          maxLength={2000}
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving || uploadingImg || uploadingPdf}
          className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black hover:bg-white/90 disabled:opacity-50 transition"
        >
          {saving ? "Saving…" : initial ? "Save Changes" : "Add Certificate"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/20 px-5 py-2 text-xs text-white/70 hover:bg-white/10 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Certificate Card ─────────────────────────────────────────────────────────

function CertCard({
  cert,
  onEdit,
  onDelete,
  onViewImage,
}: {
  cert: Certification;
  onEdit: () => void;
  onDelete: () => void;
  onViewImage: (src: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete "${cert.title}"?`)) return;
    setDeleting(true);
    try {
      await api(`/api/admin/certifications/${cert.id}`, { method: "DELETE" });
      onDelete();
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
      {/* Certificate image */}
      {cert.imageUrl ? (
        <button
          type="button"
          onClick={() => onViewImage(cert.imageUrl!)}
          className="group relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-white/10 bg-white/5"
          title="Click to view full image"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cert.imageUrl}
            alt={cert.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
            <span className="scale-75 text-2xl opacity-0 transition group-hover:scale-100 group-hover:opacity-100">
              🔍
            </span>
          </div>
        </button>
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.02]">
          <span className="text-3xl opacity-30">🏆</span>
        </div>
      )}

      {/* Meta */}
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold text-white leading-snug">{cert.title}</p>
        <p className="text-xs text-white/60">{cert.issuer}</p>
        {cert.issueDate && (
          <p className="text-xs text-white/40">{cert.issueDate}</p>
        )}
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-2">
        {cert.pdfUrl && (
          <a
            href={cert.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/60 hover:text-white hover:border-white/30 transition"
          >
            View PDF ↗
          </a>
        )}
        {cert.credentialUrl && (
          <a
            href={cert.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/60 hover:text-white hover:border-white/30 transition"
          >
            Verify ↗
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-white/10 pt-3">
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 rounded-full border border-white/15 py-1.5 text-xs text-white/60 hover:bg-white/10 transition"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="flex-1 rounded-full border border-red-500/30 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function AdminCertificationsPanel({ onError }: { onError: (s: string | null) => void }) {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Certification | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    onError(null);
    try {
      const data = await api<Certification[]>("/api/admin/certifications");
      setCerts(data);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to load certifications");
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => { void load(); }, [load]);

  function handleSaved(cert: Certification) {
    if (editing) {
      setCerts((prev) => prev.map((c) => (c.id === cert.id ? cert : c)));
    } else {
      setCerts((prev) => [cert, ...prev]);
    }
    setShowForm(false);
    setEditing(null);
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditing(null);
  }

  function startEdit(cert: Certification) {
    setEditing(cert);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-6 text-white">
      {lightboxSrc && (
        <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/80">
          Certifications ({certs.length})
        </h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black hover:bg-white/90 transition"
          >
            + Add Certificate
          </button>
        )}
      </div>

      {showForm && (
        <CertForm
          initial={editing ?? undefined}
          onSave={handleSaved}
          onCancel={handleCancelForm}
        />
      )}

      {loading && (
        <p className="text-sm text-white/50">Loading…</p>
      )}

      {!loading && certs.length === 0 && !showForm && (
        <div className="rounded-xl border border-dashed border-white/15 px-6 py-12 text-center">
          <p className="text-3xl mb-3">🏆</p>
          <p className="text-sm text-white/50">No certifications yet.</p>
          <p className="text-xs text-white/30 mt-1">
            Click &ldquo;+ Add Certificate&rdquo; to get started.
          </p>
        </div>
      )}

      {certs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certs.map((cert) => (
            <CertCard
              key={cert.id}
              cert={cert}
              onEdit={() => startEdit(cert)}
              onDelete={() => setCerts((prev) => prev.filter((c) => c.id !== cert.id))}
              onViewImage={setLightboxSrc}
            />
          ))}
        </div>
      )}
    </div>
  );
}
