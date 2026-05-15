import { useTranslations } from 'next-intl';
import SectionHeader from './SectionHeader';

type Work = {
  artist: string;
  project: string;
  year: string;
  role: string;
};

/** Section 005 — selected works, hairline table layout. */
export default function Works() {
  const t = useTranslations('works');
  const items = t.raw('items') as Work[];

  return (
    <section id="works" className="section">
      <div className="shell">
        <SectionHeader
          section={t('section')}
          label={t('label')}
          heading={t('heading')}
        />

        {/* Column labels */}
        <div className="hidden grid-cols-[1.4fr_1.6fr_0.5fr_1fr] gap-8 border-b hairline pb-5 md:grid">
          <span className="meta">{t('colArtist')}</span>
          <span className="meta">{t('colProject')}</span>
          <span className="meta">{t('colYear')}</span>
          <span className="meta md:text-right">{t('colRole')}</span>
        </div>

        <ul>
          {items.map((w) => (
            <li
              key={`${w.artist}-${w.project}`}
              className="reveal-text group flex flex-col gap-1.5 border-b hairline py-6 transition-colors duration-300 hover:bg-[rgba(255,255,255,0.015)] md:grid md:grid-cols-[1.4fr_1.6fr_0.5fr_1fr] md:items-baseline md:gap-8"
            >
              <span className="font-serif text-xl font-light text-fg transition-colors group-hover:text-accent">
                {w.artist}
              </span>
              <span className="text-[15px] text-fg/[0.7]">{w.project}</span>
              <div className="mt-1 flex items-center gap-3 md:contents md:mt-0">
                <span className="meta md:self-center">{w.year}</span>
                <span className="meta text-rule md:hidden" aria-hidden>
                  ·
                </span>
                <span className="meta md:self-center md:text-right">
                  {w.role}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
