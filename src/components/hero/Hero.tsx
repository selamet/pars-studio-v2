'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useReducedMotion } from '@/lib/use-reduced-motion';
import RotatingWord from './RotatingWord';

// WebGL is browser-only — never server-render it.
const SpiralScene = dynamic(() => import('./SpiralScene'), { ssr: false });

export default function Hero() {
  const t = useTranslations('hero');
  const reduced = useReducedMotion();
  const titleWords = t.raw('titleWords') as string[];

  return (
    <section className="sticky top-0 z-0 h-[100svh] w-full overflow-hidden">
      {reduced ? (
        // Static, motion-free fallback — radial brass glow on the studio dark.
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 55%, rgba(201,169,110,0.10) 0%, rgba(201,169,110,0.04) 40%, rgba(10,9,8,0) 75%), #0a0908',
          }}
        />
      ) : (
        <SpiralScene />
      )}

      <div className="hero-vignette relative z-10 flex h-full flex-col justify-start px-[clamp(20px,4vw,64px)] py-[clamp(80px,12vh,140px)] sm:justify-between">
        {/* Meta row */}
        <div className="mx-auto flex w-full max-w-page items-center justify-between">
          <span className="meta">{t('meta')}</span>
          <span className="meta hidden sm:block">{t('eyebrow')}</span>
        </div>

        {/* Title — sits in the upper third on mobile; centred by the
            space-between distribution on sm and up. */}
        <div className="mx-auto mt-[10vh] w-full max-w-page sm:mt-0">
          <p className="meta mb-6 sm:hidden">{t('eyebrow')}</p>
          <h1 className="max-w-title font-serif font-light leading-[0.96] tracking-[-0.018em] text-[clamp(54px,9.6vw,160px)]">
            <span className="block">{t('titleLine1')}</span>
            {/* Bottom padding gives descenders room; the negative margin keeps
                the line spacing identical to the static lines. Same size as the
                rest of the headline, with the brass shimmer kept. */}
            <RotatingWord
              words={titleWords}
              className="hero-rotating accent-italic block pb-[0.6em] -mb-[0.6em]"
            />
            <span className="block">{t('titleLine3')}</span>
          </h1>
        </div>

        {/* Bottom — pinned to the bottom on mobile via mt-auto; the
            space-between layout handles it from sm up. */}
        <div className="mx-auto mt-auto flex w-full max-w-page flex-col gap-4 sm:mt-0 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-sm leading-[1.65] text-fg/70">
            {t('caption')}
          </p>
          <span className="meta flex items-center gap-2">
            <span aria-hidden>↓</span>
            {t('scroll')}
          </span>
        </div>
      </div>
    </section>
  );
}
