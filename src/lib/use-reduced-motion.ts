'use client';

import { useEffect, useState } from 'react';

/**
 * Subscribes to the OS `prefers-reduced-motion` setting.
 *
 * Defaults to `false` during SSR/first paint so animation-heavy components
 * (Lenis, GSAP, SpiralScene) can mount; the post-mount effect then disables
 * them on next tick if the user has opted out.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
