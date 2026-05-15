import { useTranslations } from 'next-intl';
import SectionHeader from './SectionHeader';

type ServiceItem = {
  no: string;
  name: string;
  desc: string;
  price: string;
};

/** Section 002 — disciplines as hairline-bordered rows. */
export default function Services() {
  const t = useTranslations('services');
  const items = t.raw('items') as ServiceItem[];
  const fromLabel = t('fromLabel');

  return (
    <section id="services" className="section">
      <div className="shell">
        <SectionHeader
          section={t('section')}
          label={t('label')}
          heading={t('heading')}
        />

        <ul className="border-t hairline">
          {items.map((item) => (
            <li
              key={item.no}
              className="reveal-text group border-b hairline transition-all duration-300 hover:bg-[rgba(255,255,255,0.015)] hover:pl-4"
            >
              <div className="grid grid-cols-1 items-baseline gap-4 py-8 md:grid-cols-[64px_1fr_1fr_auto] md:gap-10">
                <span className="meta">{item.no}</span>
                <h3 className="font-serif text-3xl font-light leading-tight text-fg md:text-4xl">
                  {item.name}
                </h3>
                <p className="max-w-md text-[14px] leading-[1.6] text-fg/[0.62]">
                  {item.desc}
                </p>
                <span className="meta whitespace-nowrap md:text-right">
                  {fromLabel} · {item.price}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
