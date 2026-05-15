'use client';

import { useEffect, useRef } from 'react';
import { scrollState } from '@/lib/scroll-state';

/**
 * Recurring section-break motif: a very thin animated audio-signal line
 * in the brass accent. Idle = slow sine "breathing"; scroll velocity
 * briefly lifts the amplitude, then it settles. Lightweight 2D canvas,
 * pointer-events none. Respects prefers-reduced-motion (renders a flat
 * static hairline-style line instead).
 */
export default function SignalDivider() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let raf = 0;
    let w = 0;
    let h = 0;
    let energy = 0; // smoothed scroll-driven amplitude boost
    const ACCENT = '201, 169, 110';

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const strokeGradient = () => {
      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, `rgba(${ACCENT}, 0)`);
      g.addColorStop(0.5, `rgba(${ACCENT}, 0.32)`);
      g.addColorStop(1, `rgba(${ACCENT}, 0)`);
      return g;
    };

    if (reduce) {
      // Static, motion-free fallback.
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = strokeGradient();
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      return () => window.removeEventListener('resize', resize);
    }

    const draw = (time: number) => {
      raf = requestAnimationFrame(draw);

      // Scroll energy: spike on velocity, decay back to calm.
      const vel = Math.min(Math.abs(scrollState.scrollVelocity) / 38, 1);
      energy += (vel - energy) * (vel > energy ? 0.25 : 0.04);

      const t = time * 0.001;
      const mid = h / 2;
      const baseAmp = h * 0.06;
      const amp = baseAmp * (1 + energy * 6);
      // Gentle idle breathing so it is alive even at rest.
      const breathe = 0.65 + 0.35 * Math.sin(t * 0.8);

      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = strokeGradient();
      ctx.lineWidth = 1;
      ctx.beginPath();

      const step = 6;
      for (let x = 0; x <= w; x += step) {
        const p = x / w;
        // Two layered sines + a soft horizontal envelope.
        const env = Math.sin(p * Math.PI);
        const y =
          mid +
          (Math.sin(p * 14 + t * 1.6) * 0.6 +
            Math.sin(p * 31 - t * 2.3) * 0.4) *
            amp *
            breathe *
            env;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="relative z-20 h-20 w-full overflow-hidden bg-bg"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
