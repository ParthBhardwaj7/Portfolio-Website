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
};
type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  link: string | null;
  createdAt: string;
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

  async function uploadImage(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: fd,
      credentials: "include",
    });
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
      {loading ? <p className="text-sm text-white/50">Loading…</p> : null}

      {tab === "about" && about && (
        <AboutForm
          initial={about}
          onSaved={setAbout}
          uploadImage={uploadImage}
          onError={setError}
        />
      )}

      {tab === "portfolio" && (
        <PortfolioSection
          items={portfolio}
          reload={loadPortfolio}
          uploadImage={uploadImage}
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
  uploadImage,
  onError,
}: {
  initial: About;
  onSaved: (a: About) => void;
  uploadImage: (f: File) => Promise<string>;
  onError: (s: string | null) => void;
}) {
  const [content, setContent] = useState(initial.content);
  const [profileImage, setProfileImage] = useState(initial.profileImage ?? "");
  const [heroTagline, setHeroTagline] = useState(initial.heroTagline ?? "");
  const [contactCaption, setContactCaption] = useState(initial.contactCaption ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setContent(initial.content);
    setProfileImage(initial.profileImage ?? "");
    setHeroTagline(initial.heroTagline ?? "");
    setContactCaption(initial.contactCaption ?? "");
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
        }),
      });
      onSaved(updated);
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
        Profile image URL (upload file below)
        <input
          className="mt-2 w-full rounded-lg border border-white/20 bg-black/40 px-4 py-2 text-sm text-white"
          value={profileImage}
          onChange={(e) => setProfileImage(e.target.value)}
        />
      </label>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          onError(null);
          try {
            const url = await uploadImage(f);
            setProfileImage(url);
          } catch (err) {
            onError(err instanceof Error ? err.message : "Upload failed");
          }
        }}
      />
      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-white px-6 py-2 text-sm font-medium text-black disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

function PortfolioSection({
  items,
  reload,
  uploadImage,
  onError,
}: {
  items: PortfolioItem[];
  reload: () => Promise<void>;
  uploadImage: (f: File) => Promise<string>;
  onError: (s: string | null) => void;
}) {
  const [editing, setEditing] = useState<PortfolioItem | "new" | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [link, setLink] = useState("");

  function openNew() {
    setEditing("new");
    setTitle("");
    setDescription("");
    setImage("");
    setLink("");
  }

  function openEdit(item: PortfolioItem) {
    setEditing(item);
    setTitle(item.title);
    setDescription(item.description);
    setImage(item.image ?? "");
    setLink(item.link ?? "");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    onError(null);
    try {
      if (editing === "new") {
        await api("/api/admin/portfolio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            image: image || null,
            link: link || null,
          }),
        });
      } else if (editing) {
        await api(`/api/admin/portfolio/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editing.id,
            title,
            description,
            image: image || null,
            link: link || null,
          }),
        });
      }
      setEditing(null);
      await reload();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    onError(null);
    try {
      await api(`/api/admin/portfolio/${id}`, { method: "DELETE" });
      await reload();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-8 text-white">
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
              <p className="text-xs text-white/50">{new Date(it.createdAt).toLocaleString()}</p>
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
        <form onSubmit={save} className="space-y-4 rounded-xl border border-white/20 p-6">
          <h3 className="font-medium">{editing === "new" ? "New project" : "Edit project"}</h3>
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
          <input
            className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm"
            placeholder="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                const url = await uploadImage(f);
                setImage(url);
              } catch (err) {
                onError(err instanceof Error ? err.message : "Upload failed");
              }
            }}
          />
          <input
            className="w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm"
            placeholder="Link (optional)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <div className="flex gap-2">
            <button type="submit" className="rounded-full bg-white px-4 py-2 text-sm text-black">
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-full border border-white/20 px-4 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
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
