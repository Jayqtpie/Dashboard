'use client';

import { useEffect, useMemo, useRef } from 'react';

type Star = {
  x: number;
  y: number;
  r: number;
  a: number; // base alpha
  vx: number;
  vy: number;
  tw: number; // twinkle speed
  ph: number; // phase
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const starsRef = useRef<Star[]>([]);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const pointerRef = useRef({ x: 0.5, y: 0.35 });
  const smoothRef = useRef({ x: 0.5, y: 0.35 });
  const timeRef = useRef(0);
  const redrawPendingRef = useRef(false);

  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    const context: CanvasRenderingContext2D = ctx;

    const motionEnabled = !reduceMotion;

    function setSize(target: HTMLCanvasElement) {
      const parent = target.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = clamp(window.devicePixelRatio || 1, 1, 2);
      sizeRef.current = { w: Math.floor(rect.width), h: Math.floor(rect.height), dpr };
      target.width = Math.max(1, Math.floor(rect.width * dpr));
      target.height = Math.max(1, Math.floor(rect.height * dpr));
      target.style.width = `${Math.floor(rect.width)}px`;
      target.style.height = `${Math.floor(rect.height)}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density scales with area, capped for performance.
      const area = rect.width * rect.height;
      const targetCount = Math.round(clamp(area / 16500, 36, 140));
      const next: Star[] = [];
      for (let i = 0; i < targetCount; i++) {
        const r = 0.55 + Math.random() * 1.7;
        next.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          r,
          a: 0.18 + Math.random() * 0.58,
          vx: (Math.random() - 0.5) * 0.14,
          vy: (Math.random() - 0.5) * 0.11,
          // a mix of gentle twinkle rates; slightly slower for larger stars
          tw: 0.35 + Math.random() * 0.95 - r * 0.08,
          ph: Math.random() * Math.PI * 2,
        });
      }
      starsRef.current = next;
    }

    setSize(canvas);

    const ro = new ResizeObserver(() => {
      setSize(canvas);
      requestRedraw();
    });
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    function onPointerMove(e: PointerEvent) {
      const { w, h } = sizeRef.current;
      if (!w || !h) return;
      // Normalize to 0..1
      pointerRef.current.x = clamp(e.clientX / w, 0, 1);
      pointerRef.current.y = clamp(e.clientY / h, 0, 1);
      requestRedraw();
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const teal = 'rgba(26, 83, 92, 0.34)';
    const gold = 'rgba(201, 168, 76, 0.22)';
    const star = 'rgba(250, 240, 230, 1)';

    function draw(nowMs: number) {
      const { w, h } = sizeRef.current;
      if (!w || !h) return;

      // time in seconds (kept stable even when throttling)
      const now = nowMs / 1000;
      timeRef.current = now;

      // Smooth cursor parallax to avoid distraction.
      const sx = smoothRef.current.x;
      const sy = smoothRef.current.y;
      const tx = pointerRef.current.x;
      const ty = pointerRef.current.y;
      const lerp = motionEnabled ? 0.055 : 0.18;
      smoothRef.current.x = sx + (tx - sx) * lerp;
      smoothRef.current.y = sy + (ty - sy) * lerp;

      const px = smoothRef.current.x - 0.5;
      const py = smoothRef.current.y - 0.5;

      context.clearRect(0, 0, w, h);

      // Subtle cursor-reactive glow.
      const gx = w * (0.5 + px * 0.22);
      const gy = h * (0.32 + py * 0.16);
      const grad = context.createRadialGradient(gx, gy, 14, gx, gy, Math.min(w, h) * 0.58);
      grad.addColorStop(0, teal);
      grad.addColorStop(0.48, gold);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      context.fillStyle = grad;
      context.fillRect(0, 0, w, h);

      const stars = starsRef.current;

      // Parallax: subtle, cursor-linked.
      const parX = px * 14;
      const parY = py * 12;

      // Twinkle: very subtle (premium, not "sparkly").
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        if (motionEnabled) {
          s.x += s.vx;
          s.y += s.vy;
          // Wrap
          if (s.x < -10) s.x = w + 10;
          if (s.x > w + 10) s.x = -10;
          if (s.y < -10) s.y = h + 10;
          if (s.y > h + 10) s.y = -10;
        }

        const depth = 0.32 + s.r * 0.18;
        const x = s.x + parX * depth;
        const y = s.y + parY * depth;

        const twinkle = motionEnabled
          ? 0.72 + 0.28 * Math.sin(now * s.tw + s.ph)
          : 1;

        context.globalAlpha = s.a * twinkle;
        context.fillStyle = star;
        context.beginPath();
        context.arc(x, y, s.r, 0, Math.PI * 2);
        context.fill();
      }

      context.globalAlpha = 1;
    }

    function tick(nowMs: number) {
      redrawPendingRef.current = false;
      draw(nowMs);
      rafRef.current = window.requestAnimationFrame(tick);
    }

    function requestRedraw() {
      if (motionEnabled) return;
      if (redrawPendingRef.current) return;
      redrawPendingRef.current = true;
      // Single-frame redraw with rAF (no continuous loop) for reduced motion.
      rafRef.current = window.requestAnimationFrame((ms) => {
        redrawPendingRef.current = false;
        draw(ms);
      });
    }

    // Start animation loop only when motion is allowed.
    if (motionEnabled) {
      rafRef.current = window.requestAnimationFrame(tick);
    } else {
      requestRedraw();
    }

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      ro.disconnect();
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [reduceMotion]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <canvas ref={canvasRef} className="h-full w-full opacity-75" />
      {/* Extra soft vignette for readability */}
      <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_0%,rgba(0,0,0,0.0),rgba(0,0,0,0.62))]" />
    </div>
  );
}
