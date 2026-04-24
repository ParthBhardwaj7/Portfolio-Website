"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "user" | "assistant";

type Message = {
  id: string;
  role: Role;
  content: string;
  /** true while the AI is still streaming this message */
  streaming?: boolean;
};

// ─── Quick-start chips shown on first open ────────────────────────────────────

const QUICK_CHIPS = [
  "Who are you?",
  "Tell me about your projects",
  "What are your skills?",
  "I want to get in touch",
];

// ─── Helper: generate a cheap unique id ──────────────────────────────────────

let seq = 0;
function uid() {
  return `${Date.now()}-${++seq}`;
}

// ─── SVG icons (inline to avoid extra deps) ───────────────────────────────────

function IconChat({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconClose({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconSend({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

// ─── Typing dots shown while waiting for first token ─────────────────────────

function TypingDots() {
  return (
    <span className="inline-flex items-end gap-[3px] h-4">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-[5px] w-[5px] rounded-full bg-current opacity-60"
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}

// ─── Single message bubble ────────────────────────────────────────────────────

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar — only for assistant */}
      {!isUser && (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/30 flex items-center justify-center text-[10px] font-bold text-[var(--accent)]">
          AI
        </div>
      )}

      <div
        className={`max-w-[82%] rounded-2xl px-3 py-2 text-[13.5px] leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? "rounded-br-sm bg-[var(--accent)] text-[#0a0a0a] font-medium"
            : "rounded-bl-sm bg-[var(--foreground)]/[0.06] dark:bg-white/[0.07] text-[var(--foreground)] border border-[var(--border)]"
        }`}
      >
        {msg.streaming && !msg.content ? (
          <TypingDots />
        ) : (
          <>
            {msg.content}
            {msg.streaming && (
              <span className="inline-block w-[2px] h-[13px] ml-[2px] bg-current opacity-70 animate-pulse align-text-bottom" />
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main widget ──────────────────────────────────────────────────────────────

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens; clean up timeout on unmount
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(id);
  }, [open]);

  // Cancel any in-flight stream when widget unmounts
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // ── Core send function ──────────────────────────────────────────────────────

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    setError(null);
    setShowChips(false);
    setBusy(true);

    const userMsg: Message = { id: uid(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Placeholder streaming bubble
    const assistantId = uid();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", streaming: true },
    ]);

    try {
      // Cancel any previous request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Build history for the API (exclude the in-progress assistant placeholder)
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("Failed to reach the chat service. Please try again.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE lines
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const payload = JSON.parse(raw) as {
              text?: string;
              done?: string;
              error?: string;
            };

            if (payload.error) {
              throw new Error(payload.error);
            }

            if (payload.done) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, streaming: false } : m
                )
              );
              break;
            }

            if (payload.text) {
              accumulated += payload.text;
              const snap = accumulated;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: snap, streaming: true }
                    : m
                )
              );
            }
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== "Unexpected end of JSON input") {
              throw parseErr;
            }
          }
        }
      }

      // Ensure streaming flag is cleared
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, streaming: false } : m
        )
      );
    } catch (err) {
      // Ignore aborted requests (user closed/reopened chat)
      if (err instanceof Error && err.name === "AbortError") return;
      const msg =
        err instanceof Error ? err.message : "Something went wrong. Try again.";
      setError(msg);
      // Remove the empty streaming bubble on error
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    } finally {
      setBusy(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Floating button ── */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat assistant"}
        className="fixed bottom-6 right-6 z-[9990] flex h-13 w-13 items-center justify-center rounded-full bg-[var(--accent)] text-[#0a0a0a] shadow-lg shadow-[var(--accent)]/25 transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
        style={{ width: 52, height: 52 }}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.93 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "chat"}
            initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.18 }}
          >
            {open ? <IconClose size={18} /> : <IconChat size={22} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-[72px] right-6 z-[9989] flex w-[340px] flex-col rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-2xl sm:w-[380px]"
            style={{ maxHeight: "min(540px, calc(100dvh - 100px))" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
                <IconChat size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[var(--foreground)] leading-tight">
                  Ask me anything
                </p>
                <p className="text-[11px] text-[var(--muted)] leading-tight mt-[1px]">
                  Powered by Grok · usually instant
                </p>
              </div>
              {/* Clear conversation */}
              {messages.length > 0 && (
                <button
                  onClick={() => {
                    setMessages([]);
                    setShowChips(true);
                    setError(null);
                  }}
                  className="flex-shrink-0 rounded-md px-2 py-1 text-[11px] text-[var(--muted)] transition hover:text-[var(--foreground)]"
                  title="Clear conversation"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
              {/* Welcome state */}
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-4 text-center"
                >
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                    <IconChat size={18} />
                  </div>
                  <p className="text-[13px] font-medium text-[var(--foreground)]">
                    Hi there! 👋
                  </p>
                  <p className="mt-1 text-[12px] text-[var(--muted)] leading-relaxed px-4">
                    I can tell you about this portfolio, projects, skills, or help you get in touch.
                  </p>
                </motion.div>
              )}

              {/* Message bubbles */}
              {messages.map((msg) => (
                <Bubble key={msg.id} msg={msg} />
              ))}

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-[12px] text-red-500 dark:text-red-400 px-2"
                >
                  {error}
                </motion.p>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick-start chips */}
            <AnimatePresence>
              {showChips && messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-2 px-3 pb-2"
                >
                  {QUICK_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => sendMessage(chip)}
                      disabled={busy}
                      className="rounded-full border border-[var(--border)] px-3 py-1 text-[12px] text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50"
                    >
                      {chip}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input row */}
            <div className="border-t border-[var(--border)] px-3 py-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask something…"
                  rows={1}
                  maxLength={1000}
                  disabled={busy}
                  className="flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--foreground)]/[0.04] dark:bg-white/[0.05] px-3 py-2 text-[13px] text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none transition focus:border-[var(--accent)] focus:ring-0 disabled:opacity-50 max-h-[120px] leading-relaxed"
                  style={{ scrollbarWidth: "none" }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={busy || !input.trim()}
                  aria-label="Send message"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-[#0a0a0a] transition hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <IconSend size={15} />
                </button>
              </div>
              <p className="mt-2 text-center text-[11px] text-[var(--muted)]/60">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
