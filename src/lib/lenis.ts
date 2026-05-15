'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollState } from './scroll-state';

// Mirrors SpiralScene CONFIG. Kept in sync by hand — see the CONFIG block
// at the top of components/hero/SpiralScene.tsx (the canonical source).
const SCROLL_ROTATION_MULTIPLIER = 0.0035;
const SCROLL_MULTIPLIER = 1.25;

/**
 * The single scroll source for the whole app.
 *
 * Initialises Lenis, drives its requestAnimationFrame loop, and on every
 * scroll event updates the shared `scrollState` (read by the Three.js loop)
 * and pumps GSAP ScrollTrigger so reveals fire on the smoothed scroll.
 */
export function useLenis() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      // smoothTouch is off by default in Lenis v1 (the spec's `smoothTouch:false`);
      // the option was removed from the typed surface so it is omitted here.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: true, // same-page #section links smooth-scroll through Lenis
    });

    const onScroll = ({
      scroll,
      limit,
      velocity,
    }: {
      scroll: number;
      limit: number;
      velocity: number;
    }) => {
      scrollState.scrollProgress = Math.min(scroll / Math.max(limit, 1), 1);
      scrollState.scrollVelocity = velocity;
      scrollState.spinVelocity +=
        velocity * SCROLL_ROTATION_MULTIPLIER * SCROLL_MULTIPLIER;
      ScrollTrigger.update();
    };

    lenis.on('scroll', onScroll);

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.off('scroll', onScroll);
      lenis.destroy();
    };
  }, []);
}
