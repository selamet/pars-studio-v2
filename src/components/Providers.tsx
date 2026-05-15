'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from '@/lib/lenis';

/**
 * App-wide client shell:
 *  - boots Lenis on the landing page only (booking + admin use native scroll
 *    so dialogs and long tables don't fight a smooth-scroll hijacker)
 *  - wires the one-shot GSAP `.reveal-text` reveals
 *
 * The 3D hero is intentionally never touched here.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Landing path is exactly /<locale> (no further segments).
  const isLanding = /^\/[a-z]{2}\/?$/.test(pathname ?? '');
  useLenis(isLanding);
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
