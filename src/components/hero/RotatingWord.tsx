'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '@/lib/use-reduced-motion';

interface RotatingWordProps {
  /** Words to cycle through; the first is rendered server-side. */
  words: string[];
  /** Dwell time on each word before it swaps, in ms. */
  interval?: number;
  className?: string;
}

/**
 * The display headline's accent word, cycling through a list with a
 * blur-and-slide swap. Renders `words[0]` on the server so the line is
 * meaningful without JS; respects `prefers-reduced-motion` by staying static.
 */
export default function RotatingWord({
  words,
  interval = 2600,
  className = '',
}: RotatingWordProps) {
  const [index, setIndex] = useState(0);
  const wordRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || words.length <= 1) return;

    let i = 0;
    const tick = window.setInterval(() => {
      const el = wordRef.current;
      if (!el) return;

      // Out: lift, fade and blur the current word…
      gsap.to(el, {
        duration: 0.4,
        yPercent: -45,
        opacity: 0,
        filter: 'blur(7px)',
        ease: 'power2.in',
        onComplete: () => {
          i = (i + 1) % words.length;
          setIndex(i);
          // …then drop the next one in from below.
          gsap.fromTo(
            el,
            { yPercent: 55, opacity: 0, filter: 'blur(7px)' },
            {
              duration: 0.6,
              yPercent: 0,
              opacity: 1,
              filter: 'blur(0px)',
              ease: 'power3.out',
            },
          );
        },
      });
    }, interval);

    return () => {
      window.clearInterval(tick);
      if (wordRef.current) gsap.killTweensOf(wordRef.current);
    };
  }, [reduced, words, interval]);

  return (
    // Bottom padding gives descenders (y, g, ğ) room inside the clip box; the
    // equal negative margin keeps the line spacing identical to the static lines.
    <span
      className={`accent-italic block overflow-hidden pb-[0.18em] -mb-[0.18em] ${className}`}
    >
      <span ref={wordRef} className="inline-block will-change-transform">
        {words[index]}
      </span>
    </span>
  );
}
