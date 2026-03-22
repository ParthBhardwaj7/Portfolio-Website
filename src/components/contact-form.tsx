"use client";

import { motion } from "framer-motion";
import { useState } from "react";

type Variant = "default" | "split";

export function ContactForm({ variant = "default", className = "" }: { variant?: Variant; className?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const roleText = String(fd.get("role") ?? "").trim();
    const intent = String(fd.get("intent") ?? "").trim();
    const role =
      intent && roleText
        ? `${intent === "project" ? "Project" : "Recruiter"} · ${roleText}`
        : intent
          ? intent === "project"
            ? "Project inquiry"
            : "Recruiter"
          : roleText;
    const body = {
      name,
      email,
      role,
      message: String(fd.get("message") ?? "").trim(),
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(typeof data.error === "string" ? data.error : "Could not send. Try again.");
        return;
      }
      setStatus("success");
      setMessage(typeof data.message === "string" ? data.message : "Sent.");
      e.currentTarget.reset();
    } catch {
      setStatus("error");
      setMessage("Network error. Check your connection.");
    }
  }

  const wrap =
    variant === "split"
      ? `contact-section w-full max-w-none space-y-7 ${className}`
      : `contact-section mx-auto max-w-lg space-y-8 rounded-2xl border border-border/60 bg-background/30 px-4 py-6 sm:px-6 dark:border-white/15 dark:bg-white/[0.03] ${className}`;

  const btnClass =
    variant === "split"
      ? "w-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 py-4 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:from-orange-400 hover:to-amber-400 disabled:opacity-60"
      : "w-full rounded-full bg-gradient-to-r from-cyan-500/90 to-teal-500/90 py-4 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-teal-400 disabled:opacity-60";

  return (
    <motion.form
      onSubmit={onSubmit}
      className={wrap}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45 }}
    >
      <div>
        <label className="contact-label mb-2 block text-xs uppercase tracking-[0.2em]" htmlFor="name">
          Your full name *
        </label>
        <input
          className="input-underline"
          id="name"
          name="name"
          required
          autoComplete="name"
          placeholder="John Smith"
        />
      </div>
      <div>
        <label className="contact-label mb-2 block text-xs uppercase tracking-[0.2em]" htmlFor="role">
          Your role *
        </label>
        <input
          className="input-underline"
          id="role"
          name="role"
          required
          placeholder="Founder, engineer, recruiter…"
        />
      </div>
      <div>
        <label className="contact-label mb-2 block text-xs uppercase tracking-[0.2em]" htmlFor="email">
          Your e-mail *
        </label>
        <input
          className="input-underline"
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="mail@example.com"
        />
      </div>
      <fieldset className="space-y-3">
        <legend className="contact-label mb-2 block text-xs uppercase tracking-[0.2em]">
          Your status? (optional)
        </legend>
        <div className="flex flex-wrap gap-6 text-sm text-foreground">
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input type="radio" name="intent" value="project" className="accent-orange-500" />
            <span>I have a project</span>
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input type="radio" name="intent" value="recruiter" className="accent-orange-500" />
            <span>I am a recruiter</span>
          </label>
        </div>
      </fieldset>
      <div>
        <label className="contact-label mb-2 block text-xs uppercase tracking-[0.2em]" htmlFor="message">
          More info *
        </label>
        <textarea
          className="input-underline min-h-[140px] resize-y"
          id="message"
          name="message"
          required
          placeholder="What’s this about? Goals, stack, timeline…"
        />
      </div>
      <motion.button
        type="submit"
        disabled={status === "loading"}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={btnClass}
      >
        {status === "loading" ? "Sending…" : "Submit →"}
      </motion.button>
      {message ? (
        <p
          className={`text-sm ${status === "success" ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-300"}`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </motion.form>
  );
}
