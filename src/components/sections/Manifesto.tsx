import Image from 'next/image';
import { useTranslations } from 'next-intl';

/** Section 001 — editorial "about" block with a tall cinematic image. */
export default function Manifesto() {
  const t = useTranslations('manifesto');

  return (
    <section id="studio" className="section">
      <div className="shell">
        {/* Chapter label */}
        <div className="reveal-text flex items-baseline gap-5">
          <span className="meta !text-accent">{t('section')}</span>
          <span className="font-serif text-2xl italic text-accent">
            {t('roman')}
          </span>
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
                className="object-cover opacity-85 grayscale transition-all duration-700 hover:opacity-100 hover:grayscale-0"
              />
            </div>
            <figcaption className="meta mt-4 normal-case tracking-[0.18em] text-fg-dim">
              {t('imageCaption')}
            </figcaption>
          </figure>

          {/* Text */}
          <div>
            <h2 className="reveal-text max-w-[16ch] font-serif font-light leading-[1.05] tracking-[-0.012em] text-[clamp(30px,4.4vw,68px)]">
              {t('heading')}
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
