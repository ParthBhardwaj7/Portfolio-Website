"use client";

import Image from "next/image";
import { ContactForm } from "@/components/contact-form";
import { TextWithEmailLink } from "@/components/text-with-email-link";

type Props = {
  profileImage: string | null;
  displayName: string;
  contactCaption: string;
};

export function ContactSection({ profileImage, displayName, contactCaption }: Props) {
  return (
    <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-stretch">
      <div className="min-w-0">
        <h2 className="font-display text-3xl tracking-tight text-foreground md:text-4xl">
          How can I help?
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
          I would love to hear more about your project or company. Share the goal, timeline, and how I
          can help — I&apos;ll reply with the next step.
        </p>
        <div className="mt-10">
          <ContactForm variant="split" />
        </div>
      </div>

      <div className="relative min-h-[380px] w-full overflow-hidden rounded-3xl border border-border/80 bg-neutral-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] dark:border-white/10 dark:bg-neutral-900 dark:shadow-[0_24px_80px_-20px_rgba(0,0,0,0.5)] lg:min-h-[min(100%,520px)]">
        {profileImage ? (
          <Image
            src={profileImage}
            alt=""
            fill
            className="object-cover object-top"
            sizes="(max-width: 1024px) 100vw, 45vw"
            priority={false}
          />
        ) : (
          <div className="flex h-full min-h-[380px] flex-col items-center justify-center gap-3 bg-gradient-to-br from-neutral-200 via-neutral-300 to-neutral-400 p-8 dark:from-neutral-800 dark:via-neutral-900 dark:to-neutral-950">
            <span className="font-display text-6xl font-semibold text-foreground/25">
              {displayName.trim().charAt(0) || "?"}
            </span>
            <p className="max-w-[220px] text-center text-xs text-muted">
              Add your photo in Admin → About (profile image upload).
            </p>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/55 to-transparent pt-28 pb-0">
          <div className="pointer-events-auto px-6 pb-6 pt-4">
            <p className="text-sm font-medium leading-relaxed text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.9),0_2px_12px_rgba(0,0,0,0.65)] sm:text-base">
              <TextWithEmailLink
                text={contactCaption}
                className="text-white/95"
                linkClassName="font-semibold text-white underline decoration-white/80 underline-offset-[3px] transition-opacity hover:opacity-90"
              />
            </p>
            <p className="mt-4 font-display text-lg uppercase tracking-[0.12em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.85)]">
              {displayName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
