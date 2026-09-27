import type { Metadata } from 'next';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n';

type Section = { heading: string; paragraphs: string[] };

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'privacy' });
  return { title: `${t('heading')} — Pars Studios`, description: t('intro') };
}

/** Privacy policy: what the store collects, why, and who processes it. */
export default async function PrivacyPage({ params: { locale } }: { params: { locale: Locale } }) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations('privacy');
  const sections = t.raw('sections') as Section[];

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
            <p className="meta mt-6">{t('effective')}</p>
          </header>

          <div className="border-t hairline">
            {sections.map((section, index) => (
              <article
                key={section.heading}
                className="grid grid-cols-1 gap-4 border-b hairline py-10 md:grid-cols-[64px_1fr_1.4fr] md:gap-10"
              >
                <span className="meta">{String(index + 1).padStart(2, '0')}</span>
                <h2 className="font-serif text-2xl font-light leading-tight text-fg md:text-3xl">{section.heading}</h2>
                <div className="flex max-w-xl flex-col gap-4">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-[14px] leading-[1.7] text-fg/[0.7]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <p className="meta mt-10 normal-case">
            {t('contactLead')}{' '}
            <a href={`mailto:${t('contactEmail')}`} className="text-accent transition-opacity hover:opacity-70">
              {t('contactEmail')}
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
