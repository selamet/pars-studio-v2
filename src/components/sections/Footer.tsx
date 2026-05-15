import { useTranslations } from 'next-intl';

/** Minimal monospace footer. */
export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="relative z-20 bg-bg px-[clamp(20px,4vw,64px)] py-12">
      <div className="shell flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="meta">
          {t('copy')}
          <span aria-hidden className="mx-3 text-fg-dim/50">·</span>
          {t('rights')}
        </span>
        <span className="meta">{t('city')}</span>
        <span className="meta">
          {t('poweredBy')}{' '}
          <a
            href={t('poweredByHref')}
            target="_blank"
            rel="noreferrer noopener"
            className="text-fg transition-colors hover:text-accent"
          >
            {t('poweredByName')}
          </a>
        </span>
      </div>
    </footer>
  );
}
