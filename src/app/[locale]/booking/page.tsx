import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { locales, type Locale } from '@/i18n';
import BookingForm from '@/components/booking/BookingForm';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function BookingPage({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('booking');

  return (
    <main>
      <section className="section pt-[clamp(160px,18vh,240px)]">
        <div className="shell">
          <header className="mb-[clamp(48px,7vh,96px)]">
            <div className="flex items-center gap-5">
              <span className="meta !text-accent">{t('section')}</span>
              <span className="h-px w-12 bg-rule" aria-hidden />
              <span className="meta">{t('label')}</span>
            </div>
            <h1 className="mt-7 max-w-[18ch] font-serif font-light leading-[1.04] tracking-[-0.012em] text-[clamp(34px,5vw,78px)]">
              {t('heading')}
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-[1.7] text-fg/[0.7]">
              {t('intro')}
            </p>
          </header>

          <BookingForm locale={locale} />
        </div>
      </section>
    </main>
  );
}
