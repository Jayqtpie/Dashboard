'use client';

import { useEffect, useMemo, useRef } from 'react';

type Star = {
  x: number;
  y: number;
  r: number;
  a: number;
  vx: number;
  vy: number;
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

  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Respect reduced motion: keep a very subtle static field.
    const motionEnabled = !reduceMotion;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    const context: CanvasRenderingContext2D = ctx;

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
      const targetCount = Math.round(clamp(area / 18000, 30, 110));
      const next: Star[] = [];
      for (let i = 0; i < targetCount; i++) {
        next.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          r: 0.6 + Math.random() * 1.6,
          a: 0.25 + Math.random() * 0.55,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.12,
        });
      }
      starsRef.current = next;
    }

    setSize(canvas);

    const ro = new ResizeObserver(() => setSize(canvas));
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    function onPointerMove(e: PointerEvent) {
      const { w, h } = sizeRef.current;
      if (!w || !h) return;
      // Normalize to 0..1
      pointerRef.current.x = clamp(e.clientX / w, 0, 1);
      pointerRef.current.y = clamp(e.clientY / h, 0, 1);
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const teal = 'rgba(26, 83, 92, 0.35)';
    const gold = 'rgba(201, 168, 76, 0.22)';
    const star = 'rgba(250, 240, 230, 1)';

    function draw() {
      const { w, h } = sizeRef.current;
      if (!w || !h) return;

      // Smooth cursor parallax to avoid distraction.
      const sx = smoothRef.current.x;
      const sy = smoothRef.current.y;
      const tx = pointerRef.current.x;
      const ty = pointerRef.current.y;
      const lerp = motionEnabled ? 0.06 : 1;
      smoothRef.current.x = sx + (tx - sx) * lerp;
      smoothRef.current.y = sy + (ty - sy) * lerp;

      const px = smoothRef.current.x - 0.5;
      const py = smoothRef.current.y - 0.5;

      context.clearRect(0, 0, w, h);

      // Subtle cursor-reactive glow.
      const gx = w * (0.5 + px * 0.22);
      const gy = h * (0.35 + py * 0.18);
      const grad = context.createRadialGradient(gx, gy, 10, gx, gy, Math.min(w, h) * 0.55);
      grad.addColorStop(0, teal);
      grad.addColorStop(0.45, gold);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      context.fillStyle = grad;
      context.fillRect(0, 0, w, h);

      // Stars
      const stars = starsRef.current;
      const parX = px * 12;
      const parY = py * 10;

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

        const x = s.x + parX * (0.35 + s.r * 0.15);
        const y = s.y + parY * (0.35 + s.r * 0.15);

        context.globalAlpha = s.a;
        context.fillStyle = star;
        context.beginPath();
        context.arc(x, y, s.r, 0, Math.PI * 2);
        context.fill();
      }

      context.globalAlpha = 1;
    }

    function tick() {
      draw();
      rafRef.current = window.requestAnimationFrame(tick);
    }

    // Even with reduced motion we render (static-ish) for consistent premium feel.
    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      ro.disconnect();
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [reduceMotion]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <canvas ref={canvasRef} className="h-full w-full opacity-70" />
      {/* Extra soft vignette for readability */}
      <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_0%,rgba(0,0,0,0.0),rgba(0,0,0,0.55))]" />
    </div>
  );
}
