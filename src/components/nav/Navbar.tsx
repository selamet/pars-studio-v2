'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import LangSwitcher from './LangSwitcher';

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Landing path is exactly /<locale>. On landing we can use raw #anchors
  // (Lenis smooth-scrolls them). Off-landing we route to /<locale>#anchor
  // so Next navigates home and then jumps to the section.
  const isLanding = /^\/[a-z]{2}\/?$/.test(pathname ?? '');
  const sectionHref = (id: string) =>
    isLanding ? `#${id}` : `/${locale}#${id}`;

  // Track whether we've scrolled past the hero. When yes, swap
  // mix-blend-difference (great over the spiral) for a subtle dark glass
  // backdrop (clean over the rest of the dark page).
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.6);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: sectionHref('studio'), label: t('studio') },
    { href: sectionHref('services'), label: t('services') },
    { href: sectionHref('process'), label: t('process') },
    { href: sectionHref('contact'), label: t('contact') },
  ];

  const bookHref = `/${locale}/booking`;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-bg/70 backdrop-blur-md border-b border-rule'
          : 'mix-blend-difference'
      )}
    >
      <nav className="mx-auto flex max-w-page items-center justify-between px-[clamp(20px,4vw,64px)] py-6">
        {/* Logo */}
        <Link href={`/${locale}`} className="shrink-0">
          <Image
            src="/pars-studios-logo.png"
            alt={`${t('logoTop')} ${t('logoBottom')}`}
            width={1007}
            height={320}
            priority
            className="h-8 w-auto sm:h-9"
          />
        </Link>

        {/* Center links — desktop */}
        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              {isLanding ? (
                <a
                  href={l.href}
                  className="font-mono text-[11px] uppercase tracking-meta text-fg transition-opacity duration-300 hover:opacity-60"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  href={l.href}
                  className="font-mono text-[11px] uppercase tracking-meta text-fg transition-opacity duration-300 hover:opacity-60"
                >
                  {l.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Right cluster */}
        <div className="flex items-center gap-4 text-fg sm:gap-5">
          <LangSwitcher />

          <span className="hidden items-center gap-2 lg:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
            <span className="font-mono text-[11px] uppercase tracking-meta">
              {t('status')}
            </span>
          </span>

          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href={bookHref}>{t('book')}</Link>
          </Button>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label={t('menu')}
                className="text-fg md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent closeLabel={t('close')}>
              <SheetTitle>{t('menu')}</SheetTitle>
              <ul className="mt-4 flex flex-col gap-6">
                {links.map((l) => (
                  <li key={l.href}>
                    <SheetClose asChild>
                      {isLanding ? (
                        <a
                          href={l.href}
                          className="font-serif text-3xl text-fg transition-colors hover:text-accent"
                        >
                          {l.label}
                        </a>
                      ) : (
                        <Link
                          href={l.href}
                          className="font-serif text-3xl text-fg transition-colors hover:text-accent"
                        >
                          {l.label}
                        </Link>
                      )}
                    </SheetClose>
                  </li>
                ))}
              </ul>
              <SheetClose asChild>
                <Button asChild className="mt-auto w-full">
                  <Link href={bookHref}>{t('book')}</Link>
                </Button>
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
