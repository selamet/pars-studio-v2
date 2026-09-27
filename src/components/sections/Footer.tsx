import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

/** Minimal monospace footer. */
export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="relative z-20 bg-bg px-[clamp(20px,4vw,64px)] py-12">
      <div className="shell flex flex-col gap-3 sm:grid sm:grid-cols-3 sm:items-center">
        <span className="meta flex flex-col gap-1 sm:justify-self-start">
          <span>{t('copy')}</span>
          <Link href={`/${locale}/privacy`} className="text-fg-dim transition-opacity hover:opacity-70">
            {t('privacy')}
          </Link>
        </span>
        <span className="meta flex flex-col gap-1 sm:items-center sm:justify-self-center sm:text-center">
          <span>{t('city')}</span>
          <span className="text-fg-dim">{t('rights')}</span>
        </span>
        <span className="meta normal-case sm:justify-self-end sm:text-right">
          {t('poweredBy')}{' '}
          <a
            href={t('poweredByHref')}
            target="_blank"
            rel="noreferrer noopener"
            className="text-accent transition-opacity hover:opacity-70"
          >
            {t('poweredByName')}
          </a>
        </span>
      </div>
    </footer>
  );
}
