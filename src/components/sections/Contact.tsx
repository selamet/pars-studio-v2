import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SocialLink = { label: string; href: string };

/** Section 006 — big email link + three monospace columns. */
export default function Contact() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const studioLines = t.raw('studioLines') as string[];
  const socialLinks = t.raw('socialLinks') as SocialLink[];
  const bookHref = `/${locale}/booking`;

  return (
    <section id="contact" className="section">
      <div className="shell">
        <div className="reveal-text flex items-center gap-5">
          <span className="meta !text-accent">{t('section')}</span>
          <span className="h-px w-12 bg-rule" aria-hidden />
          <span className="meta">{t('label')}</span>
        </div>

        <h2 className="reveal-text mt-10 max-w-[14ch] font-serif font-light leading-[1.02] tracking-[-0.012em] text-[clamp(34px,5vw,78px)]">
          {t('heading')}
        </h2>

        {/* Email */}
        <a
          href={`mailto:${t('email')}`}
          className="reveal-text group mt-12 inline-flex items-center gap-4 font-serif font-light leading-tight text-[clamp(28px,5.5vw,72px)] text-fg transition-colors duration-300 hover:text-accent"
        >
          <span>{t('email')}</span>
          <ArrowUpRight
            className="h-[0.7em] w-[0.7em] -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
            strokeWidth={1.25}
          />
        </a>

        {/* Three columns */}
        <div className="mt-[clamp(64px,10vh,140px)] grid gap-12 border-t hairline pt-14 sm:grid-cols-3">
          <div className="reveal-text flex flex-col gap-4">
            <span className="meta">{t('studioTitle')}</span>
            <div className="flex flex-col gap-1 text-[14px] text-fg/[0.7]">
              {studioLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          </div>

          <div className="reveal-text flex flex-col gap-4">
            <span className="meta">{t('socialTitle')}</span>
            <div className="flex flex-col gap-1 text-[14px]">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-fit text-fg/[0.7] transition-colors hover:text-accent"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <div className="reveal-text flex flex-col items-start gap-4">
            <span className="meta">{t('bookingTitle')}</span>
            <Button asChild size="lg">
              <Link href={bookHref}>{t('bookingCta')}</Link>
            </Button>
            <span className="meta normal-case tracking-[0.12em] text-fg-dim">
              {t('bookingNote')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
