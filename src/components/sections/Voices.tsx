import { useTranslations } from 'next-intl';
import SectionHeader from './SectionHeader';

type Voice = {
  quote: string;
  artist: string;
  role: string;
};

/** Section 006 — testimonials as editorial pull-quotes. */
export default function Voices() {
  const t = useTranslations('voices');
  const items = t.raw('items') as Voice[];

  return (
    <section id="voices" className="section">
      <div className="shell">
        <SectionHeader
          section={t('section')}
          label={t('label')}
          heading={t('heading')}
        />

        <ul className="grid gap-px bg-rule md:grid-cols-3">
          {items.map((v, i) => (
            <li
              key={`${v.artist}-${i}`}
              className="reveal-text relative flex flex-col justify-between gap-10 bg-bg p-8 transition-colors duration-300 hover:bg-bg-soft md:p-10"
            >
              {/* Oversize brass quote glyph */}
              <span
                aria-hidden
                className="font-serif text-[64px] leading-none text-accent/40 md:text-[80px]"
              >
                &ldquo;
              </span>

              <blockquote className="font-serif text-[19px] font-light leading-[1.45] tracking-[-0.005em] text-fg/90 md:text-[21px]">
                {v.quote}
              </blockquote>

              <footer className="flex flex-col gap-1 border-t hairline pt-5">
                <cite className="not-italic font-serif text-lg text-fg">
                  {v.artist}
                </cite>
                <span className="meta">{v.role}</span>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
