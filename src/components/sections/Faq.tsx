import { useTranslations } from 'next-intl';
import SectionHeader from './SectionHeader';

type Item = {
  q: string;
  a: string;
};

/** Section 007 — frequently asked questions, native <details> accordion. */
export default function Faq() {
  const t = useTranslations('faq');
  const items = t.raw('items') as Item[];

  return (
    <section id="faq" className="section">
      <div className="shell">
        <SectionHeader
          section={t('section')}
          label={t('label')}
          heading={t('heading')}
        />

        <ul className="border-t hairline">
          {items.map((it, i) => (
            <li
              key={i}
              className="reveal-text border-b hairline transition-colors duration-300 hover:bg-[rgba(255,255,255,0.015)]"
            >
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 marker:hidden md:py-8 [&::-webkit-details-marker]:hidden">
                  <h3 className="font-serif text-xl font-light leading-snug text-fg transition-colors group-open:text-accent md:text-2xl">
                    {it.q}
                  </h3>
                  <span
                    aria-hidden
                    className="relative h-6 w-6 shrink-0 transition-transform duration-300 group-open:rotate-45"
                  >
                    <span className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-accent" />
                    <span className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-accent" />
                  </span>
                </summary>
                <p className="max-w-3xl pb-8 pr-12 text-[15px] leading-[1.65] text-fg/[0.72]">
                  {it.a}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
