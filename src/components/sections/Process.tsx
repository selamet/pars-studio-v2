import { useTranslations } from 'next-intl';
import SectionHeader from './SectionHeader';

type Step = {
  no: string;
  name: string;
  desc: string;
};

/** Section 004 — numbered working-flow chapter list. */
export default function Process() {
  const t = useTranslations('process');
  const items = t.raw('items') as Step[];

  return (
    <section id="process" className="section">
      <div className="shell">
        <SectionHeader
          section={t('section')}
          label={t('label')}
          heading={t('heading')}
        />

        <ol className="border-t hairline">
          {items.map((step) => (
            <li
              key={step.no}
              className="reveal-text grid grid-cols-1 gap-3 border-b hairline py-10 md:grid-cols-[120px_0.6fr_1.4fr] md:gap-12"
            >
              <span className="meta !text-accent">{step.no}</span>
              <h3 className="font-serif text-3xl font-light leading-tight text-fg">
                {step.name}
              </h3>
              <p className="max-w-xl text-[15px] leading-[1.65] text-fg/[0.7]">
                {step.desc}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
