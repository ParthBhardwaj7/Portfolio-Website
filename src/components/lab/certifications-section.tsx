"use client";

import * as React from "react";
import { motion, useMotionValue, useSpring, useTransform, useInView } from "framer-motion";
import { SectionHeading } from "./section-heading";
import { fadeUp, staggerParent } from "@/lib/lab/motion";
import { ExternalLink, ShieldCheck, FileText } from "lucide-react";
import type { CertificationVM } from "@/lib/lab/types";

export function CertificationsSection({ certifications }: { certifications: CertificationVM[] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  if (certifications.length === 0) return null;

  return (
    <section id="certifications" className="relative py-24 sm:py-32" aria-label="Certifications">
      <div className="container-x">
        <SectionHeading
          index="06"
          label="Certifications"
          title="Verified credentials, not wallpaper."
          description="Each card links to its official verification page or the certificate PDF."
        />

        <motion.div
          ref={ref}
          variants={staggerParent(0.12)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mt-16 grid gap-4 sm:grid-cols-2"
        >
          {certifications.map((cert) => (
            <CertCard key={cert.id} cert={cert} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CertCard({ cert }: { cert: CertificationVM }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });
  const rotateX = useTransform(sy, [-30, 30], [4, -4]);
  const rotateY = useTransform(sx, [-30, 30], [-4, 4]);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set(e.clientX - (r.left + r.width / 2));
    y.set(e.clientY - (r.top + r.height / 2));
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const href = cert.credentialUrl || cert.pdfUrl || null;

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", transformPerspective: 1200 }}
      data-cursor="open"
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface/50 p-6 transition-colors hover:border-copper/40 sm:p-8"
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />

      <div className="relative flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-copper/40 bg-copper/10">
          <ShieldCheck className="h-5 w-5 text-copper" />
        </div>
        <span className="font-mono text-xs text-muted-foreground">{cert.issueDate ?? ""}</span>
      </div>

      <h3 className="relative mt-6 font-display text-xl font-medium leading-tight tracking-tight sm:text-2xl">
        {cert.title}
      </h3>
      <p className="relative mt-1 font-mono text-xs uppercase tracking-wider text-copper">
        {cert.issuer}
      </p>

      <div className="relative mt-auto flex flex-wrap items-center gap-4 pt-6">
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-copper"
          >
            {cert.credentialUrl ? (
              <>
                Verify credential
                <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </>
            ) : (
              <>
                View certificate
                <FileText className="h-3.5 w-3.5" />
              </>
            )}
          </a>
        )}
        {!href && (
          <span className="text-sm text-muted-foreground">Issued by {cert.issuer}</span>
        )}
      </div>
    </motion.div>
  );
}
