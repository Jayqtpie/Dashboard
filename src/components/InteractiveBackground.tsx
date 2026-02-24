'use client';

import { useEffect, useMemo, useRef } from 'react';

type Star = {
  x: number;
  y: number;
  r: number;
  a: number; // base alpha
  tw: number; // twinkle speed
  twA: number; // twinkle amount
  ph: number; // phase
  hf: number; // hover flare state (0..1), eased over time
  bright: boolean;
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
  const lastNowRef = useRef<number | null>(null);

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
      // Goal: noticeably denser and more present, while keeping perf predictable.
      const area = rect.width * rect.height;
      const targetCount = Math.round(clamp(area / 9000, 90, 260));

      const next: Star[] = [];
      for (let i = 0; i < targetCount; i++) {
        const r = 0.6 + Math.random() * 2.25;
        const isBright = Math.random() < 0.2;
        next.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          r: isBright ? r * 1.15 : r,
          // Brighter base field for stronger contrast (kept under 1 once twinkle/hover applies)
          a: (isBright ? 0.62 : 0.42) + Math.random() * (isBright ? 0.30 : 0.34),
          // a mix of twinkle rates; slightly slower for larger stars
          tw: 0.45 + Math.random() * 1.5 - r * 0.09,
          // Stronger twinkle amplitude, still smooth (eased in draw loop)
          twA: (isBright ? 0.55 : 0.34) + Math.random() * (isBright ? 0.25 : 0.22),
          ph: Math.random() * Math.PI * 2,
          hf: 0,
          bright: isBright,
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

    const star = 'rgba(255, 252, 248, 1)';

    function draw(nowMs: number) {
      const { w, h } = sizeRef.current;
      if (!w || !h) return;

      const now = nowMs / 1000;
      const stars = starsRef.current;

      const last = lastNowRef.current;
      const dt = last == null ? 1 / 60 : clamp(now - last, 0, 0.05);
      lastNowRef.current = now;

      context.clearRect(0, 0, w, h);

      // No colored radial glow here (prevents large teal/gold “blob” artifacts).
      // Cursor glow: stars brighten near the pointer (no positional shift/parallax).
      const px = pointerRef.current.x * w;
      const py = pointerRef.current.y * h;
      const glowRadius = clamp(Math.min(w, h) * 0.22, 140, 320);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Smooth, pronounced twinkle with gentle easing (sinusoidal -> eased pulse).
        const phase = now * s.tw + s.ph;
        const pulse01 = motionEnabled ? (Math.sin(phase) + 1) / 2 : 1;
        const easedPulse = 0.15 + 0.85 * Math.pow(pulse01, 2.2);
        const twinkle = motionEnabled ? 0.22 + (0.95 + 0.85 * s.twA) * easedPulse : 1;

        const dx = s.x - px;
        const dy = s.y - py;
        const dist = Math.hypot(dx, dy);
        const glowTarget = glowFalloff(dist, glowRadius);

        // Hover flare should be "alive" but not instant: fast rise, slower fade.
        const k = glowTarget > s.hf ? 14 : 5;
        const a = 1 - Math.exp(-dt * k);
        s.hf = s.hf + (glowTarget - s.hf) * a;

        // Elegant “light up” near cursor; no positional shift/parallax.
        const boost = 1 + s.hf * 2.8;
        const alpha = clamp(s.a * twinkle * boost, 0, 1);
        context.globalAlpha = alpha;

        // Subtle halo only for brighter/hovered stars (keeps perf predictable).
        const halo = Math.max(s.hf, s.bright ? 0.08 : 0);
        if (halo > 0.12) {
          context.shadowColor = 'rgba(255,255,255,0.9)';
          context.shadowBlur = 14 * halo;
        } else {
          context.shadowBlur = 0;
        }

        const r = s.r * (1 + s.hf * 0.55);

        context.fillStyle = star;
        context.beginPath();
        context.arc(s.x, s.y, r, 0, Math.PI * 2);
        context.fill();
      }

      context.shadowBlur = 0;
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
      lastNowRef.current = null;
    };
  }, [reduceMotion]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <canvas ref={canvasRef} className="h-full w-full opacity-100" />
      {/* Extra soft vignette for readability */}
      <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_0%,rgba(0,0,0,0.0),rgba(0,0,0,0.62))]" />
    </div>
  );
}
