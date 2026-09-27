import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/i18n';
import { fetchServices, fetchStudioRates, formatUsd } from '@/lib/api/catalog';
import { Button } from '@/components/ui/button';

export const revalidate = 60;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'shop' });
  return { title: `${t('heading')} — Pars Studios`, description: t('intro') };
}

export default async function ServicesPage({ params: { locale } }: { params: { locale: Locale } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations('shop');
  const [services, rates] = await Promise.all([fetchServices(), fetchStudioRates()]);

  return (
    <main>
      <section className="section pt-[clamp(160px,18vh,240px)]">
        <div className="shell">
          <header className="mb-[clamp(40px,6vh,72px)]">
            <div className="flex items-center gap-5">
              <span className="meta !text-accent">{t('section')}</span>
              <span className="h-px w-12 bg-rule" aria-hidden />
              <span className="meta">{t('label')}</span>
            </div>
            <h1 className="mt-7 max-w-[18ch] font-serif font-light leading-[1.04] tracking-[-0.012em] text-[clamp(34px,5vw,78px)]">
              {t('heading')}
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-[1.7] text-fg/[0.7]">{t('intro')}</p>
          </header>

          {services.length === 0 ? (
            <p className="meta py-16">{t('empty')}</p>
          ) : (
            <ul className="grid grid-cols-1 border-l border-t border-rule md:grid-cols-2">
              {services.map((service) => (
                <li key={service.id} className="flex flex-col gap-6 border-b border-r border-rule bg-bg p-6 md:p-8">
                  <header className="flex flex-col gap-2">
                    <span className="meta">{service.kind_label}</span>
                    <h2 className="font-serif text-3xl font-light leading-tight">{service.name}</h2>
                  </header>
                  {service.description && (
                    <p className="whitespace-pre-line text-[15px] leading-[1.7] text-fg/[0.7]">
                      {service.description}
                    </p>
                  )}
                  <dl className="grid grid-cols-3 gap-4 border-t border-rule pt-5">
                    <div>
                      <dt className="meta">{t('turnaround')}</dt>
                      <dd className="mt-1 font-mono text-[14px]">
                        {t('days', { count: service.turnaround_days })}
                      </dd>
                    </div>
                    <div>
                      <dt className="meta">{t('revisions')}</dt>
                      <dd className="mt-1 font-mono text-[14px]">{service.included_revisions}</dd>
                    </div>
                    <div>
                      <dt className="meta">{t('maxStems')}</dt>
                      <dd className="mt-1 font-mono text-[14px]">{service.max_stems}</dd>
                    </div>
                  </dl>
                  <footer className="mt-auto flex items-center justify-between">
                    <span className="font-mono text-[18px]">{formatUsd(service.price_usd)}</span>
                    <Button type="button" size="sm" disabled>
                      {t('order')}
                    </Button>
                  </footer>
                </li>
              ))}
            </ul>
          )}

          <section className="mt-[clamp(64px,9vh,120px)]">
            <div className="flex items-center gap-5">
              <span className="meta">{t('ratesLabel')}</span>
              <span className="h-px flex-1 bg-rule" aria-hidden />
            </div>
            <h2 className="mt-6 font-serif text-3xl font-light md:text-4xl">{t('ratesHeading')}</h2>
            <p className="mt-4 max-w-xl text-[15px] leading-[1.7] text-fg/[0.7]">{t('ratesIntro')}</p>
            {rates.length > 0 && (
              <table className="mt-8 w-full max-w-2xl border-collapse">
                <tbody>
                  {rates.map((rate) => (
                    <tr key={rate.service_type} className="border-t border-rule">
                      <td className="py-4 font-serif text-xl font-light">{rate.service_type_label}</td>
                      <td className="py-4 text-right font-mono text-[15px]">
                        {formatUsd(rate.hourly_price_usd)} <span className="meta">/ {t('hour')}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <Button asChild size="lg" className="mt-10">
              <Link href={`/${locale}/booking`}>{t('book')}</Link>
            </Button>
          </section>
        </div>
      </section>
    </main>
  );
}
