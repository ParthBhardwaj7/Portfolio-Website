"use client";

/**
 * Small circle (~cursor-sized) + water wake. Desktop only; off for touch / narrow / reduced-motion.
 */
import { useCallback, useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isCoarsePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

const isNarrow = () => typeof window !== "undefined" && window.innerWidth < 768;

/** ~14px diameter — typical OS cursor footprint; tune only here if needed */
const CIRCLE_RADIUS = 7;

/** Longer trail = more visible wake behind movement */
const TRAIL_LEN = 30;
/** Slightly snappier so the wake hugs the path closer to the cursor */
const SMOOTH = 0.3;

function isDarkTheme() {
  if (typeof document === "undefined") return true;
  return document.documentElement.classList.contains("dark");
}

function lerpAngle(from: number, to: number, t: number) {
  const d = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  return from + d * t;
}

type Ripple = { x: number; y: number; r: number; life: number; rot: number };

function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dark: boolean
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, CIRCLE_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = dark ? "rgba(250, 250, 250, 0.95)" : "rgba(15, 23, 42, 0.92)";
  ctx.fill();
  ctx.strokeStyle = dark ? "rgba(103, 232, 249, 0.85)" : "rgba(8, 145, 178, 0.9)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

export function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const rawRef = useRef({ x: 0, y: 0 });
  const smoothRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const prevSmoothRef = useRef({ x: 0, y: 0 });
  const targetAngleRef = useRef(0);
  const displayAngleRef = useRef(0);
  const ripplesRef = useRef<Ripple[]>([]);
  const lastRippleRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);

  const resize = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.floor(w * dpr);
    c.height = Math.floor(h * dpr);
    c.style.width = `${w}px`;
    c.style.height = `${h}px`;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  useEffect(() => {
    const off =
      prefersReducedMotion() || isCoarsePointer() || isNarrow() || typeof window === "undefined";
    if (off) return;

    setActive(true);
    document.body.classList.add("cursor-custom-active");

    const trail = trailRef.current;
    trail.length = 0;
    for (let i = 0; i < TRAIL_LEN; i++) trail.push({ x: 0, y: 0 });

    let init = false;
    const onMove = (e: MouseEvent) => {
      rawRef.current = { x: e.clientX, y: e.clientY };
      if (!init) {
        init = true;
        smoothRef.current = { x: e.clientX, y: e.clientY };
        prevSmoothRef.current = { x: e.clientX, y: e.clientY };
        for (let i = 0; i < trail.length; i++) {
          trail[i] = { x: e.clientX, y: e.clientY };
        }
        lastRippleRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    resize();

    const tick = () => {
      const c = canvasRef.current;
      const ctx = c?.getContext("2d");
      if (!ctx || !c) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const rx = rawRef.current.x;
      const ry = rawRef.current.y;
      const sm = smoothRef.current;
      sm.x += (rx - sm.x) * SMOOTH;
      sm.y += (ry - sm.y) * SMOOTH;

      const ps = prevSmoothRef.current;
      const vdx = sm.x - ps.x;
      const vdy = sm.y - ps.y;
      prevSmoothRef.current = { x: sm.x, y: sm.y };
      const speed = Math.hypot(vdx, vdy);
      if (speed > 0.04) {
        targetAngleRef.current = Math.atan2(vdy, vdx);
      }
      displayAngleRef.current = lerpAngle(displayAngleRef.current, targetAngleRef.current, 0.14);

      trail.unshift({ x: sm.x, y: sm.y });
      trail.length = TRAIL_LEN;

      if (speed > 0.65 && ripplesRef.current.length < 14) {
        const d = Math.hypot(sm.x - lastRippleRef.current.x, sm.y - lastRippleRef.current.y);
        if (d > 5) {
          lastRippleRef.current = { x: sm.x, y: sm.y };
          ripplesRef.current.push({
            x: sm.x - Math.cos(displayAngleRef.current) * 4,
            y: sm.y - Math.sin(displayAngleRef.current) * 4,
            r: 2.6,
            life: 1,
            rot: displayAngleRef.current + Math.PI / 2,
          });
        }
      }

      ripplesRef.current = ripplesRef.current
        .map((r) => ({
          ...r,
          r: r.r + 0.38 + (1 - r.life) * 0.22,
          life: r.life - 0.014,
        }))
        .filter((r) => r.life > 0);

      const dark = isDarkTheme();
      const wakeRgb = dark ? "103, 232, 249" : "6, 182, 212";
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      for (const rip of ripplesRef.current) {
        ctx.save();
        ctx.translate(rip.x, rip.y);
        ctx.rotate(rip.rot);
        ctx.globalAlpha = rip.life * (dark ? 0.5 : 0.52);
        ctx.strokeStyle = `rgba(${wakeRgb}, ${0.4 + rip.life * 0.48})`;
        ctx.lineWidth = 1.05;
        ctx.beginPath();
        ctx.ellipse(0, 0, rip.r, rip.r * 0.32, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.globalAlpha = 1;
      const maxI = trail.length - 1;
      const denom = Math.max(1, maxI - 1);
      for (let i = trail.length - 1; i >= 1; i--) {
        const a = trail[i];
        const b = trail[i - 1];
        /* maxI>1: i=maxI → tail (faint); i=1 → segment touching cursor (bright) */
        const near = maxI <= 1 ? 1 : (maxI - i) / denom;
        const falloff = near * near;
        const alpha = (0.18 + 0.82 * falloff) * (dark ? 0.68 : 0.62);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(${wakeRgb}, ${alpha})`;
        ctx.lineWidth = 0.55 + 2.85 * falloff;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      drawCircle(ctx, rx, ry, dark);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      document.body.classList.remove("cursor-custom-active");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
      ripplesRef.current = [];
    };
  }, [resize]);

  if (!active) return null;

  return (
    <div
      id="cursor-layer-root"
      className="cursor-layer-root pointer-events-none"
      aria-hidden
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
