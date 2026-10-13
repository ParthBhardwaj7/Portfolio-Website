"use client";

import { useCallback, useEffect, useState } from "react";

type AuditEntry = {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entityId: string | null;
  detail: string | null;
  ip: string | null;
  createdAt: string;
};

/** Read-only security/audit trail (login events, admin mutations, spam rejects). */
export function AdminAuditPanel({ onError }: { onError: (s: string | null) => void }) {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/audit?take=150", { credentials: "include" });
      if (res.status === 401) {
        window.location.assign("/admin/login");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Load failed");
      setLogs(data as AuditEntry[]);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4 text-white">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-white/50">
          Security &amp; audit trail — login events, mutations, rejected spam
        </p>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
        >
          Refresh
        </button>
      </div>
      {loading ? <p className="text-sm text-white/50">Loading…</p> : null}
      <ul className="space-y-1.5">
        {logs.map((l) => (
          <li
            key={l.id}
            className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-[0.72rem]"
          >
            <span className="text-white/40">{new Date(l.createdAt).toLocaleString()}</span>
            <span className={l.action.includes("failed") || l.action.includes("spam") ? "text-amber-300" : "text-emerald-300"}>
              {l.action}
            </span>
            <span className="text-white/70">{l.entity}</span>
            {l.entityId ? <span className="text-white/30">{l.entityId.slice(0, 8)}</span> : null}
            {l.detail ? <span className="text-white/60">{l.detail}</span> : null}
            <span className="ml-auto text-white/30">{l.actor}{l.ip && l.ip !== "unknown" ? ` @ ${l.ip}` : ""}</span>
          </li>
        ))}
        {!loading && logs.length === 0 ? (
          <li className="rounded-lg border border-dashed border-white/15 px-4 py-8 text-center text-sm text-white/40">
            No audit events yet.
          </li>
        ) : null}
      </ul>
    </div>
  );
}
