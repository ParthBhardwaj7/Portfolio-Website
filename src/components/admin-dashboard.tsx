"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSkillsPanel } from "@/components/admin-skills-panel";

type Tab = "about" | "portfolio" | "skills" | "social" | "contacts";

type About = {
  id: string;
  content: string;
  profileImage: string | null;
  heroTagline: string | null;
  contactCaption: string | null;
  resumeUrl: string | null;
  favicon: string | null;
  ogImage: string | null;
};
type PortfolioImage = {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
};

type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  link: string | null;
  galleryCaption: string | null;
  videoUrl: string | null;
  createdAt: string;
  images: PortfolioImage[];
};
type Social = {
  id: string;
  github: string | null;
  linkedin: string | null;
  instagram: string | null;
  twitter: string | null;
};
type Contact = {
  id: string;
  name: string;
  email: string;
  role: string;
  message: string;
  createdAt: string;
};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, credentials: "include" });
  if (res.status === 401) {
    if (typeof window !== "undefined") window.location.assign("/admin/login");
    throw new Error("Session expired. Redirecting to login…");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.error === "string" ? data.error : res.statusText;
    throw new Error(msg);
  }
  return data as T;
}

export function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("about");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [about, setAbout] = useState<About | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [social, setSocial] = useState<Social | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const loadAbout = useCallback(async () => {
    const a = await api<About>("/api/admin/about");
    setAbout(a);
  }, []);

  const loadPortfolio = useCallback(async () => {
    const p = await api<PortfolioItem[]>("/api/admin/portfolio");
    setPortfolio(p);
  }, []);

  const loadSocial = useCallback(async () => {
    const s = await api<Social>("/api/admin/social");
    setSocial(s);
  }, []);

  const loadContacts = useCallback(async () => {
    const c = await api<Contact[]>("/api/admin/contacts");
    setContacts(c);
  }, []);

  useEffect(() => {
    setError(null);
    setLoading(true);
    const run = async () => {
      try {
        if (tab === "about") await loadAbout();
        if (tab === "portfolio") await loadPortfolio();
        if (tab === "social") await loadSocial();
        if (tab === "contacts") await loadContacts();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [tab, loadAbout, loadPortfolio, loadSocial, loadContacts]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/admin/login");
    router.refresh();
  }

  /** Images + videos (API picks handler from MIME type). */
  async function uploadFile(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    if (res.status === 401) {
      if (typeof window !== "undefined") window.location.assign("/admin/login");
      throw new Error("Session expired. Redirecting to login…");
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Upload failed");
    return data.url as string;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl tracking-tight text-white">Admin</h1>
        <div className="flex gap-2">
          <a
            href="/"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            View site
          </a>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["about", "About"],
            ["portfolio", "Portfolio"],
            ["skills", "Skills"],
            ["social", "Social"],
            ["contacts", "Contacts"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm ${
              tab === id ? "bg-white text-black" : "bg-white/10 text-white/80 hover:bg-white/15"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      {loading && tab !== "skills" ? <p className="text-sm text-white/50">Loading…</p> : null}

      {tab === "about" && about && (
        <AboutForm
          initial={about}
          onSaved={setAbout}
          uploadFile={uploadFile}
          onError={setError}
        />
      )}

      {tab === "portfolio" && (
        <PortfolioSection
          items={portfolio}
          reload={loadPortfolio}
          uploadFile={uploadFile}
          onError={setError}
        />
      )}

      {tab === "skills" && <AdminSkillsPanel onError={setError} />}

      {tab === "social" && social && (
        <SocialForm initial={social} onSaved={setSocial} onError={setError} />
      )}

      {tab === "contacts" && <ContactsTable items={contacts} reload={loadContacts} onError={setError} />}
    </div>
  );
}

function AboutForm({
  initial,
  onSaved,
  uploadFile,
  onError,
}: {
  initial: About;
  onSaved: (a: About) => void;
  uploadFile: (f: File) => Promise<string>;
  onError: (s: string | null) => void;
}) {
  const [content, setContent] = useState(initial.content);
  const [profileImage, setProfileImage] = useState(initial.profileImage ?? "");
  const [heroTagline, setHeroTagline] = useState(initial.heroTagline ?? "");
  const [contactCaption, setContactCaption] = useState(initial.contactCaption ?? "");
  const [resumeUrl, setResumeUrl] = useState(initial.resumeUrl ?? "");
  const [favicon, setFavicon] = useState(initial.favicon ?? "");
  const [ogImage, setOgImage] = useState(initial.ogImage ?? "");
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setContent(initial.content);
    setProfileImage(initial.profileImage ?? "");
    setHeroTagline(initial.heroTagline ?? "");
    setContactCaption(initial.contactCaption ?? "");
    setResumeUrl(initial.resumeUrl ?? "");
    setFavicon(initial.favicon ?? "");
    setOgImage(initial.ogImage ?? "");
  }, [initial]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    onError(null);
    setSaving(true);
    try {
      const updated = await api<About>("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          profileImage: profileImage || null,
          heroTagline: heroTagline.trim() || null,
          contactCaption: contactCaption.trim() || null,
          resumeUrl: resumeUrl.trim() || null,
          favicon: favicon.trim() || null,
          ogImage: ogImage.trim() || null,
        }),
      });
      onSaved(updated);
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2000);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6 text-white">
      <label className="block text-sm text-white/70">
        About text
        <textarea
          className="mt-2 w-full rounded-lg border border-white/20 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </label>
      <label className="block text-sm text-white/70">
        Hero line (under your title — e.g. inquiry + email). Leave empty to use site default.
        <textarea
          className="mt-2 w-full rounded-lg border border-white/20 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
          rows={3}
          value={heroTagline}
          onChange={(e) => setHeroTagline(e.target.value)}
          placeholder="For any queries contact me at you@email.com"
        />
      </label>
      <label className="block text-sm text-white/70">
        Contact card text (over your profile photo). Leave empty to use site default.
        <textarea
          className="mt-2 w-full rounded-lg border border-white/20 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
          rows={3}
          value={contactCaption}
          onChange={(e) => setContactCaption(e.target.value)}
          placeholder="Same as hero or a short note + email"
        />
      </label>
      <label className="block text-sm text-white/70">
        Profile image — paste URL or upload (JPEG, PNG, WebP, GIF · max 4MB)
        <input
          className="mt-2 w-full rounded-lg border border-white/20 bg-black/40 px-4 py-2 text-sm text-white"
          value={profileImage}
          onChange={(e) => setProfileImage(e.target.value)}
        />
      </label>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        aria-label="Upload profile image file"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          onError(null);
          try {
            const url = await uploadFile(f);
            setProfileImage(url);
          } catch (err) {
            onError(err instanceof Error ? err.message : "Upload failed");
          }
        }}
      />

      {/* Site branding */}
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-5">
        <div>
          <p className="text-sm font-medium text-white/80">Site branding</p>
          <p className="mt-1 text-xs text-white/45">
            These control the browser tab icon and the image that appears when your site is shared or found in search results.
          </p>
        </div>

        {/* Favicon */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-white/50">
            Favicon — browser tab &amp; search icon
          </p>
          <p className="text-xs text-white/40">
            Upload a square PNG or ICO (min 32×32, ideally 512×512). Appears in the browser tab and on the left side of Google search results.
          </p>
          <input
            className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white"
            value={favicon}
            onChange={(e) => setFavicon(e.target.value)}
            placeholder="https://… or /uploads/…"
            aria-label="Favicon URL"
          />
          {favicon.trim() ? (
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={favicon.trim()}
                alt="Favicon preview"
                className="h-8 w-8 rounded border border-white/20 object-contain bg-white/10"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <span className="text-xs text-white/40">Preview</span>
            </div>
          ) : null}
          <label className="flex cursor-pointer flex-col gap-1 text-xs text-cyan-200/90">
            <span className="font-medium">Upload favicon image</span>
            <input
              type="file"
              accept="image/png,image/x-icon,image/svg+xml,image/jpeg,image/webp"
              className="text-xs file:mr-2 file:rounded file:border-0 file:bg-white/15 file:px-2 file:py-1"
              aria-label="Upload favicon file"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                onError(null);
                try {
                  const url = await uploadFile(f);
                  setFavicon(url);
                } catch (err) {
                  onError(err instanceof Error ? err.message : "Upload failed");
                }
                e.target.value = "";
              }}
            />
          </label>
        </div>

        {/* OG Image */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-white/50">
            Social preview image (Open Graph)
          </p>
          <p className="text-xs text-white/40">
            Shown when your site link is shared on WhatsApp, LinkedIn, Twitter, etc. Recommended size: 1200×630 px (JPG or PNG).
          </p>
          <input
            className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white"
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            placeholder="https://… or /uploads/…"
            aria-label="OG image URL"
          />
          {ogImage.trim() ? (
            <div className="space-y-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ogImage.trim()}
                alt="OG image preview"
                className="w-full max-w-sm rounded-lg border border-white/20 object-cover"
                style={{ aspectRatio: "1200/630" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <p className="text-xs text-white/35">Preview (1200×630 ratio)</p>
            </div>
          ) : null}
          <label className="flex cursor-pointer flex-col gap-1 text-xs text-cyan-200/90">
            <span className="font-medium">Upload OG image</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="text-xs file:mr-2 file:rounded file:border-0 file:bg-white/15 file:px-2 file:py-1"
              aria-label="Upload OG image file"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                onError(null);
                try {
                  const url = await uploadFile(f);
                  setOgImage(url);
                } catch (err) {
                  onError(err instanceof Error ? err.message : "Upload failed");
                }
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm text-white/70">Résumé (PDF)</p>
        <p className="mt-1 text-xs text-white/45">
          Paste a public PDF URL, or upload — PDF only · max 10MB. The site shows View résumé + Download, and a Résumé link in the nav.
        </p>
        <label className="mt-3 block text-sm text-white/70">
          PDF URL
          <input
            className="mt-2 w-full rounded-lg border border-white/20 bg-black/40 px-4 py-2 text-sm text-white"
            value={resumeUrl}
            onChange={(e) => setResumeUrl(e.target.value)}
            placeholder="https://… or /uploads/…"
          />
        </label>
        <input
          type="file"
          accept="application/pdf"
          className="mt-3 text-xs file:mr-2 file:rounded file:border-0 file:bg-white/15 file:px-2 file:py-1"
          aria-label="Upload résumé PDF"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            onError(null);
            try {
              const url = await uploadFile(f);
              setResumeUrl(url);
            } catch (err) {
              onError(err instanceof Error ? err.message : "Upload failed");
            }
          }}
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-white px-6 py-2 text-sm font-medium text-black disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
      {savedFlash ? (
        <p className="text-sm text-emerald-400/90" role="status">
          Saved
        </p>
      ) : null}
    </form>
  );
}

function PortfolioSection({
  items,
  reload,
  uploadFile,
  onError,
}: {
  items: PortfolioItem[];
  reload: () => Promise<void>;
  uploadFile: (f: File) => Promise<string>;
  onError: (s: string | null) => void;
}) {
  const [editing, setEditing] = useState<PortfolioItem | "new" | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [link, setLink] = useState("");
  const [galleryCaption, setGalleryCaption] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  function openNew() {
    setEditing("new");
    setEditingItemId(null);
    setTitle("");
    setDescription("");
    setImage("");
    setVideoUrl("");
    setLink("");
    setGalleryCaption("");
  }

  function openEdit(item: PortfolioItem) {
    setEditing(item);
    setEditingItemId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setImage(item.image ?? "");
    setVideoUrl(item.videoUrl ?? "");
    setLink(item.link ?? "");
    setGalleryCaption(item.galleryCaption ?? "");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    onError(null);
    try {
      let savedItem: PortfolioItem;
      if (editing === "new") {
        savedItem = await api<PortfolioItem>("/api/admin/portfolio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            image: image.trim() || null,
            link: link.trim() || null,
            galleryCaption: galleryCaption.trim() || null,
            videoUrl: videoUrl.trim() || null,
          }),
        });
        // Auto-switch to edit mode so admin can add extra gallery images
        setEditing(savedItem);
        setEditingItemId(savedItem.id);
      } else if (editing) {
        savedItem = await api<PortfolioItem>(`/api/admin/portfolio/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editing.id,
            title,
            description,
            image: image.trim() || null,
            link: link.trim() || null,
            galleryCaption: galleryCaption.trim() || null,
            videoUrl: videoUrl.trim() || null,
          }),
        });
        setEditing(savedItem);
        setEditingItemId(savedItem.id);
      }
      await reload();
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2000);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    onError(null);
    try {
      await api(`/api/admin/portfolio/${id}`, { method: "DELETE" });
      if (editingItemId === id) setEditing(null);
      await reload();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  const currentImages =
    editingItemId ? (items.find((i) => i.id === editingItemId)?.images ?? []) : [];

  return (
    <div className="space-y-8 text-white">
      {savedFlash ? (
        <p className="text-sm text-emerald-400/90" role="status">
          Saved
        </p>
      ) : null}
      <button
        type="button"
        onClick={openNew}
        className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
      >
        Add project
      </button>
      <ul className="space-y-4">
        {items.map((it) => (
          <li
            key={it.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/15 bg-white/5 px-4 py-3"
          >
            <div>
              <p className="font-medium">{it.title}</p>
              <p className="text-xs text-white/50">
                {new Date(it.createdAt).toLocaleString()}
                {it.images.length > 0 ? ` · ${it.images.length} extra image${it.images.length !== 1 ? "s" : ""}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => openEdit(it)}
                className="rounded-full border border-white/20 px-3 py-1 text-xs"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => void remove(it.id)}
                className="rounded-full border border-red-400/40 px-3 py-1 text-xs text-red-200"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <div className="space-y-6 rounded-xl border border-white/20 p-6">
          <h3 className="font-medium">{editing === "new" ? "New project" : `Edit: ${title}`}</h3>
          <form onSubmit={save} className="space-y-5">
            <input
              className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm"
              placeholder="Description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <div className="space-y-2 rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-white/50">Cover image (Works card + Gallery poster)</p>
              <p className="text-xs text-white/45">
                Paste a URL, or upload — JPEG, PNG, WebP, GIF · max 4MB.
              </p>
              <input
                className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm"
                placeholder="Image URL (https://… or /uploads/…)"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                aria-label="Cover image URL"
              />
              <label className="flex cursor-pointer flex-col gap-1 text-xs text-cyan-200/90">
                <span className="font-medium">Upload image file</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="text-xs file:mr-2 file:rounded file:border-0 file:bg-white/15 file:px-2 file:py-1"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try { setImage(await uploadFile(f)); } catch (err) {
                      onError(err instanceof Error ? err.message : "Upload failed");
                    }
                  }}
                />
              </label>
            </div>
            <div className="space-y-2 rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-white/50">Looping video (optional)</p>
              <p className="text-xs text-white/45">
                Plays muted on the card and in Gallery. MP4, WebM, MOV · max 40MB.
              </p>
              <input
                className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm"
                placeholder="Video URL (https://… or /uploads/…)"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                aria-label="Looping video URL"
              />
              <label className="flex cursor-pointer flex-col gap-1 text-xs text-cyan-200/90">
                <span className="font-medium">Upload video file</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  className="text-xs file:mr-2 file:rounded file:border-0 file:bg-white/15 file:px-2 file:py-1"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try { setVideoUrl(await uploadFile(f)); } catch (err) {
                      onError(err instanceof Error ? err.message : "Upload failed");
                    }
                  }}
                />
              </label>
            </div>
            <input
              className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm"
              placeholder="Project link (optional)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <label className="block text-xs text-white/60">
              Gallery caption (optional — shown as overlay on the cover image in Gallery)
              <textarea
                className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white"
                placeholder="Short line on the gallery tile…"
                rows={2}
                maxLength={500}
                value={galleryCaption}
                onChange={(e) => setGalleryCaption(e.target.value)}
              />
            </label>
            <div className="flex gap-2">
              <button type="submit" className="rounded-full bg-white px-4 py-2 text-sm text-black">
                Save
              </button>
              <button
                type="button"
                onClick={() => { setEditing(null); setEditingItemId(null); }}
                className="rounded-full border border-white/20 px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Extra gallery images — only for saved projects */}
          {editingItemId && (
            <GalleryImagesManager
              portfolioId={editingItemId}
              images={currentImages}
              uploadFile={uploadFile}
              onError={onError}
              onChanged={reload}
            />
          )}
        </div>
      )}
    </div>
  );
}

function GalleryImagesManager({
  portfolioId,
  images,
  uploadFile,
  onError,
  onChanged,
}: {
  portfolioId: string;
  images: PortfolioImage[];
  uploadFile: (f: File) => Promise<string>;
  onError: (s: string | null) => void;
  onChanged: () => Promise<void>;
}) {
  const [addUrl, setAddUrl] = useState("");
  const [addCaption, setAddCaption] = useState("");
  const [adding, setAdding] = useState(false);

  async function addImage() {
    const url = addUrl.trim();
    if (!url) return;
    onError(null);
    setAdding(true);
    try {
      await api(`/api/admin/portfolio/${portfolioId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, caption: addCaption.trim() || null }),
      });
      setAddUrl("");
      setAddCaption("");
      await onChanged();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to add image");
    } finally {
      setAdding(false);
    }
  }

  async function removeImage(imageId: string) {
    if (!confirm("Remove this gallery image?")) return;
    onError(null);
    try {
      await api(`/api/admin/portfolio/${portfolioId}/images/${imageId}`, { method: "DELETE" });
      await onChanged();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to remove image");
    }
  }

  return (
    <div className="space-y-4 border-t border-white/10 pt-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-white/50">Extra gallery images</p>
        <p className="mt-1 text-xs text-white/40">
          These appear in the Gallery section and in the project detail modal carousel. Add as many as you like.
        </p>
      </div>

      {images.length > 0 ? (
        <ul className="space-y-2">
          {images.map((img, idx) => (
            <li key={img.id} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.caption ?? ""}
                className="h-10 w-14 flex-shrink-0 rounded object-cover"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-white/80">{img.url}</p>
                {img.caption ? <p className="truncate text-xs text-white/45">{img.caption}</p> : null}
              </div>
              <span className="text-xs text-white/30">#{idx + 1}</span>
              <button
                type="button"
                onClick={() => void removeImage(img.id)}
                className="text-xs text-red-300/80 hover:text-red-200 transition-colors"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-white/30">No extra images yet.</p>
      )}

      <div className="space-y-2 rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs font-medium text-white/60">Add image</p>
        <input
          className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm"
          placeholder="Image URL (https://… or /uploads/…)"
          value={addUrl}
          onChange={(e) => setAddUrl(e.target.value)}
        />
        <label className="flex cursor-pointer flex-col gap-1 text-xs text-cyan-200/90">
          <span className="font-medium">Or upload image file</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="text-xs file:mr-2 file:rounded file:border-0 file:bg-white/15 file:px-2 file:py-1"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try { setAddUrl(await uploadFile(f)); } catch (err) {
                onError(err instanceof Error ? err.message : "Upload failed");
              }
              e.target.value = "";
            }}
          />
        </label>
        <input
          className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm"
          placeholder="Caption (optional)"
          value={addCaption}
          onChange={(e) => setAddCaption(e.target.value)}
          maxLength={500}
        />
        <button
          type="button"
          onClick={() => void addImage()}
          disabled={adding || !addUrl.trim()}
          className="rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 disabled:opacity-40 transition-colors"
        >
          {adding ? "Adding…" : "Add to gallery"}
        </button>
      </div>
    </div>
  );
}

function SocialForm({
  initial,
  onSaved,
  onError,
}: {
  initial: Social;
  onSaved: (s: Social) => void;
  onError: (s: string | null) => void;
}) {
  const [github, setGithub] = useState(initial.github ?? "");
  const [linkedin, setLinkedin] = useState(initial.linkedin ?? "");
  const [instagram, setInstagram] = useState(initial.instagram ?? "");
  const [twitter, setTwitter] = useState(initial.twitter ?? "");
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    onError(null);
    setSaving(true);
    try {
      const updated = await api<Social>("/api/admin/social", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          github: github || null,
          linkedin: linkedin || null,
          instagram: instagram || null,
          twitter: twitter || null,
        }),
      });
      onSaved(updated);
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2000);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="max-w-lg space-y-4 text-white">
      {(
        [
          ["GitHub", github, setGithub],
          ["LinkedIn", linkedin, setLinkedin],
          ["Instagram", instagram, setInstagram],
          ["X (Twitter)", twitter, setTwitter],
        ] as const
      ).map(([label, val, set]) => (
        <label key={label} className="block text-sm text-white/70">
          {label}
          <input
            className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white"
            value={val}
            onChange={(e) => set(e.target.value)}
            placeholder="https://"
          />
        </label>
      ))}
      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-white px-6 py-2 text-sm font-medium text-black disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save links"}
      </button>
      {savedFlash ? (
        <p className="text-sm text-emerald-400/90" role="status">
          Saved
        </p>
      ) : null}
    </form>
  );
}

function ContactsTable({
  items,
  reload,
  onError,
}: {
  items: Contact[];
  reload: () => Promise<void>;
  onError: (s: string | null) => void;
}) {
  async function del(id: string) {
    if (!confirm("Delete this message?")) return;
    onError(null);
    try {
      await api(`/api/admin/contacts/${id}`, { method: "DELETE" });
      await reload();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed");
    }
  }

  if (items.length === 0) {
    return <p className="text-sm text-white/50">No submissions yet.</p>;
  }

  return (
    <div className="overflow-x-auto text-sm text-white">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-white/20">
            <th className="py-2 pr-4">Date</th>
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Role</th>
            <th className="py-2 pr-4">Message</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id} className="border-b border-white/10 align-top">
              <td className="py-3 pr-4 whitespace-nowrap text-white/60">
                {new Date(c.createdAt).toLocaleString()}
              </td>
              <td className="py-3 pr-4">{c.name}</td>
              <td className="py-3 pr-4">{c.email}</td>
              <td className="py-3 pr-4">{c.role}</td>
              <td className="max-w-xs py-3 pr-4 break-words">{c.message}</td>
              <td className="py-3">
                <button
                  type="button"
                  onClick={() => void del(c.id)}
                  className="text-xs text-red-300 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
