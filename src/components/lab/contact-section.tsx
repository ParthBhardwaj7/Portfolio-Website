"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { RevealText } from "./reveal-text";
import { fadeUp, staggerParent } from "@/lib/lab/motion";
import { ArrowRight, Check, Loader2, AlertCircle, Copy } from "lucide-react";
import { cn } from "@/lib/lab/utils";
import type { SocialLink } from "@/lib/lab/types";

type SubmitState = "idle" | "submitting" | "success" | "error";

/**
 * Contact section — posts to the existing /api/contact contract:
 * { name, email, role, message, website (honeypot), formMountedAt }.
 * Server-side: same-origin check, rate limit, honeypot, time-trip guard.
 */
export function ContactSection({
  email,
  socials,
}: {
  email: string | null;
  socials: SocialLink[];
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [copied, setCopied] = React.useState(false);

  const copyEmail = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — no-op, the mailto link still works
    }
  };

  return (
    <section id="contact" className="relative py-24 sm:py-32" aria-label="Contact">
      <div className="container-x">
        <motion.div
          ref={ref}
          variants={staggerParent(0.1)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex flex-col items-start gap-6"
        >
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            <span className="text-copper">09</span>
            <span className="h-px w-8 bg-line-strong" />
            <span>Contact</span>
          </motion.div>

          <RevealText
            as="h2"
            splitBy="word"
            text="Have something interesting in mind?"
            className="font-display text-[clamp(2.5rem,7vw,5.5rem)] font-medium leading-[0.95] tracking-tight"
          />
          <RevealText
            as="h2"
            splitBy="word"
            delay={0.15}
            text="Let's build it."
            className="font-display text-[clamp(2.5rem,7vw,5.5rem)] font-medium leading-[0.95] tracking-tight text-copper"
          />

          <motion.p
            variants={fadeUp}
            className="mt-2 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Open to engineering opportunities, freelance backend work, and conversations about
            distributed systems, observability and applied AI.
          </motion.p>

          <ContactForm email={email} />

          {/* Email + socials */}
          <motion.div variants={fadeUp} className="mt-12 grid w-full gap-6 sm:grid-cols-2">
            {email && (
              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Email
                </div>
                <button
                  onClick={copyEmail}
                  className="group mt-2 flex items-center gap-2 text-lg font-medium tracking-tight hover:text-copper"
                  aria-label={copied ? "Email copied" : "Copy email address"}
                >
                  {email}
                  <Copy
                    className={cn(
                      "h-4 w-4 transition-opacity",
                      copied ? "opacity-100 text-copper" : "opacity-0 group-hover:opacity-100"
                    )}
                  />
                  {copied && (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-copper">
                      copied
                    </span>
                  )}
                </button>
              </div>
            )}
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Elsewhere
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {socials.map((s) => (
                  <a
                    key={s.id}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-line px-3 py-1.5 text-sm transition-colors hover:border-copper hover:text-copper"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function ContactForm({ email }: { email: string | null }) {
  const [state, setState] = React.useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const mountedAt = React.useRef<number>(0);

  React.useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "submitting") return;
    const form = e.currentTarget;
    const data = new FormData(form);

    setState("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          role: String(data.get("role") ?? ""),
          message: String(data.get("message") ?? ""),
          website: String(data.get("website") ?? ""), // honeypot
          formMountedAt: mountedAt.current,
        }),
      });
      if (!res.ok) {
        let code = "";
        try {
          const body = await res.json();
          code = body?.code ?? "";
        } catch {
          // non-JSON error body
        }
        if (res.status === 429) {
          setErrorMsg("Too many attempts — please try again later or email me directly.");
        } else if (code === "TOO_FAST") {
          setErrorMsg("That was fast — take a moment, then resend.");
        } else if (res.status === 400) {
          setErrorMsg("Please check the fields and try again.");
        } else {
          setErrorMsg("Something went wrong. Please email me directly.");
        }
        setState("error");
        return;
      }
      setState("success");
      form.reset();
    } catch {
      setErrorMsg("Network error — please email me directly.");
      setState("error");
    }
  };

  const statusColor =
    state === "success"
      ? "text-emerald-500"
      : state === "error"
        ? "text-red-500"
        : state === "submitting"
          ? "text-copper"
          : "text-muted-foreground";

  return (
    <motion.form variants={fadeUp} onSubmit={onSubmit} className="mt-6 w-full max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" required placeholder="Your name" />
        <Field label="Email" name="email" type="email" required placeholder="you@domain.com" />
      </div>
      <label className="block">
        <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          I&apos;m reaching out about <span className="text-copper">*</span>
        </span>
        <select
          name="role"
          required
          defaultValue="A project"
          className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-copper"
        >
          <option>A project</option>
          <option>A role or internship</option>
          <option>Open source</option>
          <option>Something else</option>
        </select>
      </label>
      <Field
        label="Message"
        name="message"
        textarea
        required
        placeholder="Tell me about the project, role, or idea."
      />

      {/* Honeypot — invisible to humans, bots fill it */}
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
        <label>
          Website
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div
          className={cn(
            "flex items-center gap-2 font-mono text-xs uppercase tracking-wider",
            statusColor
          )}
          role="status"
          aria-live="polite"
        >
          <StateBadge state={state} />
          <span>
            {state === "idle" && "Ready"}
            {state === "submitting" && "Sending"}
            {state === "success" && "Sent — I'll get back to you"}
            {state === "error" && (errorMsg ?? "Failed — email me directly")}
          </span>
        </div>
        <button
          type="submit"
          disabled={state === "submitting"}
          className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-copper disabled:opacity-50"
        >
          {state === "submitting" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : state === "success" ? (
            <Check className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          )}
          {state === "success" ? "Sent" : "Start a conversation"}
        </button>
      </div>

      {state === "error" && email && (
        <p className="text-sm text-muted-foreground">
          Or reach me directly at{" "}
          <a href={`mailto:${email}`} className="text-copper underline underline-offset-4">
            {email}
          </a>
        </p>
      )}
    </motion.form>
  );
}

function StateBadge({ state }: { state: SubmitState }) {
  if (state === "submitting") return <Loader2 className="h-3 w-3 animate-spin" />;
  if (state === "success") return <Check className="h-3 w-3" />;
  if (state === "error") return <AlertCircle className="h-3 w-3" />;
  return <span className="h-1.5 w-1.5 rounded-full bg-current" />;
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  textarea,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label} {required && <span className="text-copper">*</span>}
      </span>
      {textarea ? (
        <textarea
          name={name}
          required={required}
          placeholder={placeholder}
          rows={5}
          className="w-full resize-none rounded-lg border border-line bg-surface px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-copper"
        />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-lg border border-line bg-surface px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-copper"
        />
      )}
    </label>
  );
}
