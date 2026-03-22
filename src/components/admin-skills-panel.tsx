"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetchJson } from "@/lib/admin-fetch";

type Item = { id: string; categoryId: string; label: string; sortOrder: number };
type Category = { id: string; title: string; sortOrder: number; items: Item[] };

export function AdminSkillsPanel({ onError }: { onError: (s: string | null) => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [draftItem, setDraftItem] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const list = await adminFetchJson<Category[]>("/api/admin/skill-categories");
    setCategories(list);
  }, []);

  useEffect(() => {
    onError(null);
    setLoading(true);
    load()
      .catch((e) => onError(e instanceof Error ? e.message : "Failed to load skills"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reload on mount / tab show
  }, [load]);

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onError(null);
    try {
      await adminFetchJson<Category>("/api/admin/skill-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle.trim() }),
      });
      setNewTitle("");
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed");
    }
  }

  async function saveCategoryTitle(id: string, title: string) {
    onError(null);
    try {
      await adminFetchJson(`/api/admin/skill-categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed");
    }
  }

  async function removeCategory(id: string) {
    if (!confirm("Delete this category and all its skills?")) return;
    onError(null);
    try {
      await adminFetchJson(`/api/admin/skill-categories/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed");
    }
  }

  async function addItem(categoryId: string) {
    const label = (draftItem[categoryId] ?? "").trim();
    if (!label) return;
    onError(null);
    try {
      await adminFetchJson("/api/admin/skill-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, label }),
      });
      setDraftItem((d) => ({ ...d, [categoryId]: "" }));
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed");
    }
  }

  async function saveItem(id: string, label: string) {
    onError(null);
    try {
      await adminFetchJson(`/api/admin/skill-items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim() }),
      });
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed");
    }
  }

  async function removeItem(id: string) {
    if (!confirm("Remove this skill line?")) return;
    onError(null);
    try {
      await adminFetchJson(`/api/admin/skill-items/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed");
    }
  }

  if (loading) {
    return <p className="text-sm text-white/50">Loading skills…</p>;
  }

  return (
    <div className="space-y-8 text-white">
      <p className="text-sm text-white/60">
        Organize technical expertise into categories (e.g. Programming Languages). Each line becomes one pill on
        the site. Labels can be short names or longer phrases.
      </p>

      <form onSubmit={addCategory} className="flex flex-wrap items-end gap-2">
        <label className="block min-w-[200px] flex-1 text-sm text-white/70">
          New category
          <input
            className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Cloud & DevOps"
          />
        </label>
        <button type="submit" className="rounded-full bg-white px-4 py-2 text-sm text-black">
          Add category
        </button>
      </form>

      <ul className="space-y-6">
        {categories.map((cat) => (
          <li key={cat.id} className="rounded-xl border border-white/15 bg-white/5 p-4">
            <CategoryBlock
              category={cat}
              draftItem={draftItem[cat.id] ?? ""}
              setDraftItem={(v) => setDraftItem((d) => ({ ...d, [cat.id]: v }))}
              onSaveTitle={(title) => void saveCategoryTitle(cat.id, title)}
              onDelete={() => void removeCategory(cat.id)}
              onAddItem={() => void addItem(cat.id)}
              onSaveItem={(itemId, label) => void saveItem(itemId, label)}
              onDeleteItem={(itemId) => void removeItem(itemId)}
            />
          </li>
        ))}
      </ul>

      {categories.length === 0 ? (
        <p className="text-sm text-white/50">No categories yet — add one above, or run <code className="text-cyan-300">npm run db:seed</code> for defaults.</p>
      ) : null}
    </div>
  );
}

function CategoryBlock({
  category,
  draftItem,
  setDraftItem,
  onSaveTitle,
  onDelete,
  onAddItem,
  onSaveItem,
  onDeleteItem,
}: {
  category: Category;
  draftItem: string;
  setDraftItem: (v: string) => void;
  onSaveTitle: (title: string) => void;
  onDelete: () => void;
  onAddItem: () => void;
  onSaveItem: (itemId: string, label: string) => void;
  onDeleteItem: (itemId: string) => void;
}) {
  const [title, setTitle] = useState(category.title);
  useEffect(() => {
    setTitle(category.title);
  }, [category.title]);

  const [edits, setEdits] = useState<Record<string, string>>({});
  useEffect(() => {
    const next: Record<string, string> = {};
    for (const it of category.items) next[it.id] = it.label;
    setEdits(next);
  }, [category.items]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="min-w-[180px] flex-1 rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          type="button"
          className="rounded-full bg-white px-3 py-2 text-xs text-black"
          onClick={() => onSaveTitle(title)}
        >
          Save title
        </button>
        <button type="button" className="rounded-full border border-red-400/50 px-3 py-2 text-xs text-red-200" onClick={onDelete}>
          Delete category
        </button>
      </div>

      <ul className="space-y-2 border-l border-white/10 pl-3">
        {category.items.map((it) => (
          <li key={it.id} className="flex flex-wrap items-center gap-2">
            <textarea
              className="min-h-[2.5rem] min-w-[200px] flex-1 rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white"
              rows={2}
              value={edits[it.id] ?? it.label}
              onChange={(e) => setEdits((m) => ({ ...m, [it.id]: e.target.value }))}
            />
            <button
              type="button"
              className="rounded-full bg-white/90 px-3 py-1.5 text-xs text-black"
              onClick={() => onSaveItem(it.id, edits[it.id] ?? it.label)}
            >
              Save
            </button>
            <button
              type="button"
              className="text-xs text-red-300 hover:underline"
              onClick={() => onDeleteItem(it.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        <input
          className="min-w-[200px] flex-1 rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white"
          placeholder="New skill line (one pill)"
          value={draftItem}
          onChange={(e) => setDraftItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddItem();
            }
          }}
        />
        <button type="button" className="rounded-full border border-white/30 px-4 py-2 text-sm" onClick={onAddItem}>
          Add line
        </button>
      </div>
    </div>
  );
}
