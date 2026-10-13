"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "./dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { cn } from "@/lib/lab/utils";
import { NAV_ITEMS } from "./navbar";
import type { SocialLink } from "@/lib/lab/types";

type CommandAction = {
  id: string;
  label: string;
  group: "navigation" | "external";
  target: string;
  kind: "scroll" | "link";
};

/**
 * ⌘K command palette — navigates sections and opens social links.
 */
export function CommandPalette({ socials, email }: { socials: SocialLink[]; email: string | null }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpenEvent = () => setOpen(true);
    document.addEventListener("keydown", onKey);
    document.addEventListener("open-command-palette", onOpenEvent);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("open-command-palette", onOpenEvent);
    };
  }, []);

  const actions: CommandAction[] = [
    ...NAV_ITEMS.map((n) => ({
      id: `go-${n.id}`,
      label: n.label === "Work" ? "View Projects" : `Go to ${n.label}`,
      group: "navigation" as const,
      target: n.href,
      kind: "scroll" as const,
    })),
    ...socials.map((s) => ({
      id: `open-${s.id}`,
      label: `Open ${s.label}`,
      group: "external" as const,
      target: s.href,
      kind: "link" as const,
    })),
    ...(email
      ? [
          {
            id: "open-email",
            label: "Send Email",
            group: "external" as const,
            target: `mailto:${email}`,
            kind: "link" as const,
          },
        ]
      : []),
  ];

  const runAction = (id: string) => {
    const action = actions.find((a) => a.id === id);
    if (!action) return;
    if (action.kind === "scroll") {
      const el = document.querySelector(action.target);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.open(action.target, "_blank", "noopener,noreferrer");
    }
    setOpen(false);
  };

  const grouped = actions.reduce<Record<string, CommandAction[]>>((acc, a) => {
    (acc[a.group] ??= []).push(a);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="overflow-hidden border-line bg-surface/95 p-0 backdrop-blur-xl sm:max-w-xl"
        hideClose
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <CommandPrimitive label="Command Menu" className="flex flex-col">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <CommandPrimitive.Input
              placeholder="Type a command or search…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              ESC
            </kbd>
          </div>
          <CommandPrimitive.List className="max-h-[60vh] overflow-y-auto p-2">
            <CommandPrimitive.Empty className="py-8 text-center text-sm text-muted-foreground">
              No matching command.
            </CommandPrimitive.Empty>
            {Object.entries(grouped).map(([group, items]) => (
              <CommandPrimitive.Group
                key={group}
                heading={group.toUpperCase()}
                className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
              >
                {items.map((a) => (
                  <CommandPrimitive.Item
                    key={a.id}
                    value={a.label}
                    onSelect={() => runAction(a.id)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 text-sm text-muted-foreground",
                      "data-[selected=true]:bg-copper/10 data-[selected=true]:text-foreground"
                    )}
                  >
                    <span className="flex-1">{a.label}</span>
                    <span className="font-mono text-[10px] uppercase text-muted-foreground/60">
                      {a.kind}
                    </span>
                  </CommandPrimitive.Item>
                ))}
              </CommandPrimitive.Group>
            ))}
          </CommandPrimitive.List>
          <div className="flex items-center justify-between border-t border-line px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>⌘K to toggle</span>
            <span>↑↓ navigate · ↵ select</span>
          </div>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}
