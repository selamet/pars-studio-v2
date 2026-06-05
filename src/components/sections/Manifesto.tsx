import Image from 'next/image';
import { useTranslations } from 'next-intl';
import RotatingWord from '@/components/hero/RotatingWord';

/** Section 001 — editorial "about" block with a tall cinematic image. */
export default function Manifesto() {
  const t = useTranslations('manifesto');
  const headingWords = t.raw('headingWords') as string[];

  return (
    <section id="studio" className="section">
      <div className="shell">
        {/* Chapter label — same horizontal pattern as every other section. */}
        <div className="reveal-text flex items-center gap-5">
          <span className="meta !text-accent">{t('section')}</span>
          <span className="h-px w-12 bg-rule" aria-hidden />
          <span className="meta">{t('label')}</span>
        </div>

        <div className="mt-[clamp(40px,7vh,90px)] grid gap-[clamp(32px,5vw,80px)] md:grid-cols-[0.85fr_1.15fr]">
          {/* Image */}
          <figure className="reveal-text">
            <div className="relative aspect-[4/5] overflow-hidden bg-bg-soft md:aspect-[3/4]">
              <Image
                src={t('image')}
                alt={t('label')}
                fill
                sizes="(max-width: 768px) 100vw, 42vw"
                className="object-cover opacity-90 transition-all duration-700 hover:opacity-100"
              />
            </div>
            <figcaption className="meta mt-4 normal-case tracking-[0.18em] text-fg-dim">
              {t('imageCaption')}
            </figcaption>
          </figure>

          {/* Text */}
          <div>
            <h2 className="reveal-text max-w-[16ch] font-serif font-light leading-[1.05] tracking-[-0.012em] text-[clamp(36px,4.4vw,68px)]">
              {t('headingPre')}
              {/* overflow-hidden makes an inline-block's baseline its bottom
                  edge, lifting the word; the negative margin drops the edge
                  back onto the text baseline. The bottom padding gives italic
                  descenders (y, g) room inside the clip box, and the extra
                  negative margin keeps the baseline where it was. */}
              <RotatingWord
                words={headingWords}
                className="accent-italic inline-block pb-[0.12em] -mb-[0.32em]"
              />
              {t('headingPost')}
            </h2>
            <div className="mt-10 grid gap-7 text-[15px] leading-[1.65] text-fg/[0.78] sm:max-w-2xl">
              <p className="reveal-text">{t('p1')}</p>
              <p className="reveal-text">{t('p2')}</p>
              <p className="reveal-text">{t('p3')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
