'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

// WebGL is browser-only — never server-render it.
const SpiralScene = dynamic(() => import('./SpiralScene'), { ssr: false });

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="sticky top-0 z-0 h-[100svh] w-full overflow-hidden">
      <SpiralScene />

      <div className="hero-vignette relative z-10 flex h-full flex-col justify-between px-[clamp(20px,4vw,64px)] py-[clamp(80px,12vh,140px)]">
        {/* Meta row */}
        <div className="mx-auto flex w-full max-w-page items-center justify-between">
          <span className="meta">{t('meta')}</span>
          <span className="meta hidden sm:block">{t('eyebrow')}</span>
        </div>

        {/* Title */}
        <div className="mx-auto w-full max-w-page">
          <p className="meta mb-6 sm:hidden">{t('eyebrow')}</p>
          <h1 className="max-w-title font-serif font-light leading-[0.96] tracking-[-0.018em] text-[clamp(54px,9.6vw,160px)]">
            <span className="block">{t('titleLine1')}</span>
            <span className="accent-italic block">{t('titleLine2')}</span>
            <span className="block">{t('titleLine3')}</span>
          </h1>
        </div>

        {/* Bottom */}
        <div className="mx-auto flex w-full max-w-page flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
