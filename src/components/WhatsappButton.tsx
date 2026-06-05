'use client';

import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import WhatsappIcon from './WhatsappIcon';

/**
 * Sticky bottom-right WhatsApp button. Hidden on admin routes
 * (/[locale]/admin and below) so it never overlaps studio-only UI.
 *
 * Number + greeting come from messages/*.json → contact.whatsappNumber /
 * whatsappMessage so the studio can edit them without code changes.
 */
export default function WhatsappButton() {
  const t = useTranslations('contact');
  const pathname = usePathname() ?? '';

  // Hide on the admin area only.
  if (/^\/[a-z]{2}\/admin(\/|$)/.test(pathname)) return null;

  const number = t('whatsappNumber').replace(/\D/g, '');
  const href = `https://wa.me/${number}?text=${encodeURIComponent(
    t('whatsappMessage')
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={t('whatsappAria')}
      className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center bg-accent text-bg shadow-[0_8px_28px_-6px_rgba(201,169,110,0.5)] ring-1 ring-black/10 transition-all duration-300 hover:scale-105 hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg sm:bottom-7 sm:right-7 sm:h-[58px] sm:w-[58px]"
      style={{ borderRadius: '9999px' }}
    >
      {/* Subtle pulse halo */}
      <span
        aria-hidden
        className="absolute inset-0 -z-10 animate-ping rounded-full bg-accent/40"
      />
      <WhatsappIcon className="h-7 w-7 sm:h-[30px] sm:w-[30px]" />
    </a>
  );
}
