'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from '@/lib/lenis';

/**
 * App-wide client shell:
 *  - boots Lenis (the sole scroll source)
 *  - wires the one-shot GSAP `.reveal-text` reveals
 *
 * The 3D hero is intentionally never touched here.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  useLenis();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.reveal-text').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1.4,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              toggleActions: 'play none none none',
              once: true,
            },
          }
        );
      });
    }, root);

    // Recalculate trigger positions once fonts/layout settle.
    const refresh = setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      clearTimeout(refresh);
      ctx.revert();
    };
  }, []);

  return <div ref={root}>{children}</div>;
}
