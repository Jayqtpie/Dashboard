'use client';

import { useEffect, useMemo, useRef } from 'react';

type Star = {
  x: number;
  y: number;
  r: number;
  a: number; // base alpha
  tw: number; // twinkle speed
  ph: number; // phase
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

// Smooth distance falloff (0..1), 1 near the cursor.
function glowFalloff(dist: number, radius: number) {
  if (radius <= 0) return 0;
  const t = clamp(1 - dist / radius, 0, 1);
  // Ease-out for a soft, elegant halo.
  return t * t;
}

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const starsRef = useRef<Star[]>([]);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const pointerRef = useRef({ x: 0.5, y: 0.35 });
  const redrawPendingRef = useRef(false);

  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasEl = canvas;

    const ctx = canvasEl.getContext('2d', { alpha: true });
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
          // a mix of gentle twinkle rates; slightly slower for larger stars
          tw: 0.35 + Math.random() * 0.95 - r * 0.08,
          ph: Math.random() * Math.PI * 2,
        });
      }
      starsRef.current = next;
    }

    setSize(canvasEl);

    const ro = new ResizeObserver(() => {
      setSize(canvasEl);
      requestRedraw();
    });
    if (canvasEl.parentElement) ro.observe(canvasEl.parentElement);

    function onPointerMove(e: PointerEvent) {
      const { w, h } = sizeRef.current;
      if (!w || !h) return;
      const rect = canvasEl.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      pointerRef.current.x = clamp(nx, 0, 1);
      pointerRef.current.y = clamp(ny, 0, 1);
      requestRedraw();
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const teal = 'rgba(26, 83, 92, 0.28)';
    const gold = 'rgba(201, 168, 76, 0.18)';
    const star = 'rgba(250, 240, 230, 1)';

    function draw(nowMs: number) {
      const { w, h } = sizeRef.current;
      if (!w || !h) return;

      const now = nowMs / 1000;
      const stars = starsRef.current;

      context.clearRect(0, 0, w, h);

      // Static, subtle ambient glow (not cursor-positioned) to keep the scene calm.
      const gx = w * 0.5;
      const gy = h * 0.28;
      const grad = context.createRadialGradient(gx, gy, 18, gx, gy, Math.min(w, h) * 0.62);
      grad.addColorStop(0, teal);
      grad.addColorStop(0.52, gold);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      context.fillStyle = grad;
      context.fillRect(0, 0, w, h);

      // Cursor glow: stars brighten near the pointer (no positional shift/parallax).
      const px = pointerRef.current.x * w;
      const py = pointerRef.current.y * h;
      const glowRadius = clamp(Math.min(w, h) * 0.18, 90, 220);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        const twinkle = motionEnabled ? 0.72 + 0.28 * Math.sin(now * s.tw + s.ph) : 1;

        const dx = s.x - px;
        const dy = s.y - py;
        const dist = Math.hypot(dx, dy);
        const glow = glowFalloff(dist, glowRadius);

        // Boost is intentionally restrained: elegant “light up”, not sparkly.
        const boost = 1 + glow * 1.25;
        context.globalAlpha = clamp(s.a * twinkle * boost, 0, 1);

        context.fillStyle = star;
        context.beginPath();
        context.arc(s.x, s.y, s.r, 0, Math.PI * 2);
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
