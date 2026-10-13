"use client";

import { useCallback, useEffect, useState } from "react";

type ExperienceItem = {
  id: string;
  year: string;
  title: string;
  org: string | null;
  type: string;
  description: string;
  technologies: string | null;
  url: string | null;
  sortOrder: number;
};

const TYPES = ["project", "certification", "opensource", "milestone", "work"] as const;

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

/** CRUD for the timeline (Experience) — only verifiable milestones belong here. */
export function AdminExperiencePanel({ onError }: { onError: (s: string | null) => void }) {
  const [items, setItems] = useState<ExperienceItem[]>([]);
  const [editing, setEditing] = useState<ExperienceItem | "new" | null>(null);
  const [year, setYear] = useState("");
  const [title, setTitle] = useState("");
  const [org, setOrg] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("project");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [url, setUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [savedFlash, setSavedFlash] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await api<ExperienceItem[]>("/api/admin/experience"));
    } catch (e) {
      onError(e instanceof Error ? e.message : "Load failed");
    }
  }, [onError]);

  useEffect(() => {
    void load();
  }, [load]);

  function openNew() {
    setEditing("new");
    setYear("");
    setTitle("");
    setOrg("");
    setType("project");
    setDescription("");
    setTechnologies("");
    setUrl("");
    setSortOrder(0);
  }

  function openEdit(item: ExperienceItem) {
    setEditing(item);
    setYear(item.year);
    setTitle(item.title);
    setOrg(item.org ?? "");
    setType((TYPES as readonly string[]).includes(item.type) ? (item.type as typeof type) : "project");
    setDescription(item.description);
    setTechnologies(item.technologies ?? "");
    setUrl(item.url ?? "");
    setSortOrder(item.sortOrder);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    onError(null);
    const payload = {
      year: year.trim(),
      title: title.trim(),
      org: org.trim() || null,
      type,
      description: description.trim(),
      technologies: technologies.trim() || null,
      url: url.trim() || null,
      sortOrder,
    };
    try {
      if (editing === "new") {
        await api("/api/admin/experience", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else if (editing) {
        await api(`/api/admin/experience/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setEditing(null);
      await load();
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2000);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this timeline entry?")) return;
    onError(null);
    try {
      await api(`/api/admin/experience/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  const inputCls =
    "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/40";

  return (
    <div className="space-y-6 text-white">
      {savedFlash ? <p className="text-sm text-emerald-400/90" role="status">Saved</p> : null}
      <button
        type="button"
        onClick={openNew}
        className="rounded-full bg-white px-4 py-2 text-sm font-medium text-black"
      >
        Add timeline entry
      </button>

      {editing !== null && (
        <form onSubmit={save} className="space-y-4 rounded-xl border border-white/15 bg-white/5 p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-xs uppercase tracking-wider text-white/60">
              Year / label *
              <input className={inputCls} value={year} onChange={(e) => setYear(e.target.value)} required placeholder="2026 · Apr" />
            </label>
            <label className="block text-xs uppercase tracking-wider text-white/60 sm:col-span-2">
              Title *
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <label className="block text-xs uppercase tracking-wider text-white/60">
              Org
              <input className={inputCls} value={org} onChange={(e) => setOrg(e.target.value)} />
            </label>
            <label className="block text-xs uppercase tracking-wider text-white/60">
              Type
              <select className={inputCls} value={type} onChange={(e) => setType(e.target.value as typeof type)}>
                {TYPES.map((t) => (
                  <option key={t} value={t} className="text-black">{t}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs uppercase tracking-wider text-white/60">
              Sort order
              <input type="number" min={0} className={inputCls} value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
            </label>
            <label className="block text-xs uppercase tracking-wider text-white/60">
              URL
              <input className={inputCls} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
            </label>
          </div>
          <label className="block text-xs uppercase tracking-wider text-white/60">
            Description *
            <textarea className={`${inputCls} min-h-[90px]`} value={description} onChange={(e) => setDescription(e.target.value)} required />
          </label>
          <label className="block text-xs uppercase tracking-wider text-white/60">
            Technologies (comma-separated)
            <input className={inputCls} value={technologies} onChange={(e) => setTechnologies(e.target.value)} />
          </label>
          <div className="flex gap-3">
            <button type="submit" className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black">
              Save
            </button>
            <button type="button" onClick={() => setEditing(null)} className="rounded-full border border-white/20 px-5 py-2 text-sm text-white/70">
              Cancel
            </button>
          </div>
        </form>
      )}

      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3">
            <div className="min-w-0">
              <p className="font-medium">
                <span className="mr-2 text-white/50">{it.year}</span>
                {it.title}
              </p>
              <p className="text-xs text-white/50">
                {it.type} · sort {it.sortOrder}
                {it.url ? ` · ${it.url}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => openEdit(it)} className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10">
                Edit
              </button>
              <button type="button" onClick={() => void remove(it.id)} className="rounded-full border border-red-400/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-400/10">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
