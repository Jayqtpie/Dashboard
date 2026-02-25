'use client';

import { useEffect, useMemo, useRef } from 'react';

type Star = {
  x: number;
  y: number;
  r: number; // outer radius
  inner: number; // inner radius for star points
  points: 4 | 5;
  rot: number;
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

function drawStarPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  outerR: number,
  innerR: number,
  points: number,
  rotation: number
) {
  // Small, crisp star glyph (4/5 point). Keeping it path-based avoids image fetch
  // and stays fast at our capped counts.
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
  // Cursor trail for a soft glow field that lingers briefly behind movement.
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
      const targetCount = Math.round(clamp(area / 11000, 72, 180));

      const next: Star[] = [];
      for (let i = 0; i < targetCount; i++) {
        // Slightly larger than the old circles so the star silhouette reads.
        const baseR = 0.9 + Math.random() * 2.35;
        const isBright = Math.random() < 0.22;
        const points: 4 | 5 = Math.random() < 0.65 ? 5 : 4;

        const outer = isBright ? baseR * 1.15 : baseR;
        // Inner radius tuned per points so 4-point stars don't look like diamonds.
        const innerRatio = points === 5 ? 0.48 : 0.40;

        next.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          r: outer,
          inner: outer * innerRatio,
          points,
          rot: Math.random() * Math.PI * 2,
          // Ultra-bright base field. Kept readable by avoiding any large-area haze.
          a: (isBright ? 0.90 : 0.70) + Math.random() * (isBright ? 0.10 : 0.22),
          // A mix of twinkle rates; slightly slower for larger stars.
          tw: 0.40 + Math.random() * 1.55 - baseR * 0.08,
          // Stronger twinkle amplitude with higher peaks.
          twA: (isBright ? 0.95 : 0.62) + Math.random() * (isBright ? 0.20 : 0.26),
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

      // Record a short trail so the glow follows cursor movement with decay.
      // Keep it small (perf) and short-lived (readability).
      const t = performance.now();
      const trail = pointerTrailRef.current;
      trail.push({ x, y, t });
      // Trim: cap points and age.
      const maxPoints = 14;
      const maxAgeMs = 750;
      while (trail.length > maxPoints) trail.shift();
      while (trail.length && t - trail[0].t > maxAgeMs) trail.shift();

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
      context.lineJoin = 'round';
      context.miterLimit = 2.2;

      // No colored radial glow here (prevents large teal/gold “blob” artifacts).
      // Cursor glow: stars brighten near the pointer (no positional shift/parallax).
      const px = pointerRef.current.x * w;
      const py = pointerRef.current.y * h;
      // Slightly wider influence so the “ultra bright” response reads without moving stars.
      const glowRadius = clamp(Math.min(w, h) * 0.28, 170, 420);

      // Soft trailing glow field: recent cursor positions add a gentle lingering boost.
      const trailNow = performance.now();
      const trail = pointerTrailRef.current;
      // Prune by age each frame to ensure decay even if pointer stops.
      const maxAgeMs = 750;
      while (trail.length && trailNow - trail[0].t > maxAgeMs) trail.shift();

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Smooth twinkle with brighter peaks (sinusoidal -> peaky eased pulse).
        const phase = now * s.tw + s.ph;
        const pulse01 = motionEnabled ? (Math.sin(phase) + 1) / 2 : 1;
        const easedPulse = 0.10 + 0.90 * Math.pow(pulse01, 3.05);
        // Higher floor + brighter peaks.
        const twinkle = motionEnabled ? 0.55 + (1.20 + 1.35 * s.twA) * easedPulse : 1;

        const dx = s.x - px;
        const dy = s.y - py;
        const dist = Math.hypot(dx, dy);
        const directGlow = glowFalloff(dist, glowRadius);

        // Combine direct + trail influences using a saturating blend (avoids overblown blobs).
        // Trail weights decay exponentially with age, creating a smooth fade-out.
        let trailGlow = 0;
        if (trail.length) {
          // Saturating accumulator: g = 1 - Π(1 - contrib)
          let inv = 1;
          for (let j = trail.length - 1; j >= 0; j--) {
            const p = trail[j];
            const age = (trailNow - p.t) / 1000;
            const wgt = Math.exp(-age * 3.6); // ~0.03 at ~1s
            if (wgt < 0.01) continue;
            const tx = p.x * w;
            const ty = p.y * h;
            const td = Math.hypot(s.x - tx, s.y - ty);
            const contrib = glowFalloff(td, glowRadius * 0.95) * wgt * 0.95;
            inv *= 1 - clamp(contrib, 0, 0.98);
            // Early exit if already near max.
            if (inv < 0.08) break;
          }
          trailGlow = 1 - inv;
        }

        const glowTarget = clamp(Math.max(directGlow, trailGlow * 1.12), 0, 1);

        // Hover flare should be "alive" but not instant: fast rise, slower fade.
        const k = glowTarget > s.hf ? 14 : 5;
        const a = 1 - Math.exp(-dt * k);
        s.hf = s.hf + (glowTarget - s.hf) * a;

        // Elegant “light up” near cursor; no positional shift/parallax.
        const boost = 1 + s.hf * 4.2;
        const alpha = clamp(s.a * twinkle * boost, 0, 1);
        context.globalAlpha = alpha;

        // Stronger local halo (only near cursor / on bright stars). No full-canvas glow.
        const halo = Math.max(s.hf, s.bright ? 0.14 : 0);
        if (halo > 0.055) {
          context.shadowColor = 'rgba(255,255,255,0.98)';
          // Slightly stronger blur to sell the “brighter” impression, still strictly local.
          context.shadowBlur = (28 + 34 * s.hf) * halo;
        } else {
          context.shadowBlur = 0;
        }

        const outer = s.r * (1 + s.hf * 0.55);
        const inner = s.inner * (1 + s.hf * 0.42);

        context.fillStyle = star;
        drawStarPath(context, s.x, s.y, outer, inner, s.points, s.rot);
        context.fill();

        // Tiny bright core helps the shape read at small sizes.
        if (outer > 1.05) {
          context.shadowBlur = 0;
          context.globalAlpha = clamp(alpha * 0.92 + 0.16, 0, 1);
          context.beginPath();
          context.arc(s.x, s.y, Math.max(0.5, outer * 0.18), 0, Math.PI * 2);
          context.fill();
        }
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
      pointerTrailRef.current = [];
    };
  }, [reduceMotion]);

  return (
    <div aria-hidden="true" className="starfield-layer pointer-events-none fixed inset-0 z-0">
      <canvas ref={canvasRef} className="h-full w-full opacity-70" />
      {/* Minimal vignette for readability (avoid non-star haze). */}
      <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_0%,rgba(0,0,0,0.0),rgba(0,0,0,0.52))]" />
    </div>
  );
}
