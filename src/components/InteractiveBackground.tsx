'use client';

import { useEffect, useMemo, useRef } from 'react';

type Star = {
  x: number;
  y: number;
  r: number;
  inner: number;
  points: 4 | 5;
  rot: number;
  a: number;
  tw: number;
  twA: number;
  ph: number;
  hf: number;
  bright: boolean;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function drawStarPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  outerR: number,
  innerR: number,
  points: number,
  rotation: number
) {
  const step = Math.PI / points;
  let a = rotation;

  context.beginPath();
  context.moveTo(x + Math.cos(a) * outerR, y + Math.sin(a) * outerR);
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    context.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    a += step;
  }
  context.closePath();
}

function glowFalloff(dist: number, radius: number) {
  if (radius <= 0) return 0;
  const t = clamp(1 - dist / radius, 0, 1);
  return t * t;
}

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const starsRef = useRef<Star[]>([]);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const pointerRef = useRef({ x: 0.5, y: 0.35 });
  const pointerTrailRef = useRef<Array<{ x: number; y: number; t: number }>>([]);
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
      const dpr = clamp(window.devicePixelRatio || 1, 1, 1.5);
      sizeRef.current = { w: Math.floor(rect.width), h: Math.floor(rect.height), dpr };
      target.width = Math.max(1, Math.floor(rect.width * dpr));
      target.height = Math.max(1, Math.floor(rect.height * dpr));
      target.style.width = `${Math.floor(rect.width)}px`;
      target.style.height = `${Math.floor(rect.height)}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const area = rect.width * rect.height;
      const targetCount = Math.round(clamp(area / 18000, 36, 90));
      const next: Star[] = [];
      for (let i = 0; i < targetCount; i++) {
        const baseR = 0.8 + Math.random() * 1.8;
        const isBright = Math.random() < 0.2;
        const points: 4 | 5 = Math.random() < 0.7 ? 5 : 4;
        const outer = isBright ? baseR * 1.1 : baseR;
        const innerRatio = points === 5 ? 0.48 : 0.4;

        next.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          r: outer,
          inner: outer * innerRatio,
          points,
          rot: Math.random() * Math.PI * 2,
          a: (isBright ? 0.55 : 0.34) + Math.random() * 0.18,
          tw: 0.35 + Math.random() * 1.1,
          twA: (isBright ? 0.85 : 0.55) + Math.random() * 0.2,
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
      const x = clamp(nx, 0, 1);
      const y = clamp(ny, 0, 1);
      pointerRef.current.x = x;
      pointerRef.current.y = y;

      const t = performance.now();
      const trail = pointerTrailRef.current;
      trail.push({ x, y, t });
      while (trail.length > 10) trail.shift();
      while (trail.length && t - trail[0].t > 520) trail.shift();
      requestRedraw();
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    function draw(nowMs: number) {
      const { w, h } = sizeRef.current;
      if (!w || !h) return;

      const now = nowMs / 1000;
      const stars = starsRef.current;
      const last = lastNowRef.current;
      const dt = last == null ? 1 / 60 : clamp(now - last, 0, 0.05);
      lastNowRef.current = now;

      context.clearRect(0, 0, w, h);
      context.lineJoin = 'round';
      context.miterLimit = 2.2;

      const px = pointerRef.current.x * w;
      const py = pointerRef.current.y * h;
      const glowRadius = clamp(Math.min(w, h) * 0.18, 120, 260);

      const trailNow = performance.now();
      const trail = pointerTrailRef.current;
      while (trail.length && trailNow - trail[0].t > 520) trail.shift();

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const phase = now * s.tw + s.ph;
        const pulse01 = motionEnabled ? (Math.sin(phase) + 1) / 2 : 1;
        const easedPulse = 0.18 + 0.82 * Math.pow(pulse01, 2.8);
        const twinkle = motionEnabled ? 0.72 + (0.7 + s.twA) * easedPulse : 1;

        const dx = s.x - px;
        const dy = s.y - py;
        const dist = Math.hypot(dx, dy);
        const directGlow = glowFalloff(dist, glowRadius);

        let trailGlow = 0;
        if (trail.length) {
          let inv = 1;
          for (let j = trail.length - 1; j >= 0; j--) {
            const p = trail[j];
            const age = (trailNow - p.t) / 1000;
            const wgt = Math.exp(-age * 4.2);
            if (wgt < 0.01) continue;
            const tx = p.x * w;
            const ty = p.y * h;
            const td = Math.hypot(s.x - tx, s.y - ty);
            const contrib = glowFalloff(td, glowRadius * 0.88) * wgt * 0.75;
            inv *= 1 - clamp(contrib, 0, 0.95);
          }
          trailGlow = 1 - inv;
        }

        const glowTarget = clamp(Math.max(directGlow, trailGlow), 0, 1);
        const k = glowTarget > s.hf ? 11 : 4;
        const a = 1 - Math.exp(-dt * k);
        s.hf = s.hf + (glowTarget - s.hf) * a;

        const alpha = clamp(s.a * twinkle * (1 + s.hf * 1.9), 0, 1);
        context.globalAlpha = alpha;

        const halo = Math.max(s.hf, s.bright ? 0.08 : 0);
        if (halo > 0.04) {
          context.shadowColor = 'rgba(255,245,233,0.9)';
          context.shadowBlur = (10 + 14 * s.hf) * halo;
        } else {
          context.shadowBlur = 0;
        }

        const outer = s.r * (1 + s.hf * 0.28);
        const inner = s.inner * (1 + s.hf * 0.22);
        context.fillStyle = 'rgba(255,244,236,1)';
        drawStarPath(context, s.x, s.y, outer, inner, s.points, s.rot);
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
      rafRef.current = window.requestAnimationFrame((ms) => {
        redrawPendingRef.current = false;
        draw(ms);
      });
    }

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
      pointerTrailRef.current = [];
    };
  }, [reduceMotion]);

  return (
    <div aria-hidden="true" className="starfield-layer pointer-events-none fixed inset-0 z-0 hidden md:block">
      <canvas ref={canvasRef} className="h-full w-full opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_0%,rgba(0,0,0,0),rgba(0,0,0,0.22))]" />
    </div>
  );
}
