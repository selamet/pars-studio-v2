'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Menu, UserRound } from 'lucide-react';
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
import { useAuth } from '@/components/auth/AuthProvider';
import CartButton from '@/components/cart/CartButton';

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const { status, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Landing path is exactly /<locale>. On landing we can use raw #anchors
  // (Lenis smooth-scrolls them). Off-landing we route to /<locale>#anchor
  // so Next navigates home and then jumps to the section.
  const isLanding = /^\/[a-z]{2}\/?$/.test(pathname ?? '');
  const sectionHref = (id: string) =>
    isLanding ? `#${id}` : `/${locale}#${id}`;

  // Swap mix-blend-difference (great over the landing spiral) for a subtle
  // dark glass backdrop once content can slide under the header. On landing
  // that is after scrolling past the hero; elsewhere there is no hero, so
  // switch as soon as the page leaves the top. Re-runs on client navigation.
  useEffect(() => {
    const onScroll = () => {
      const threshold = isLanding ? window.innerHeight * 0.6 : 8;
      setScrolled(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isLanding, pathname]);

  // Landing sections (anchors) followed by store routes (always real links).
  const links = [
    { href: sectionHref('studio'), label: t('studio'), route: false },
    { href: `/${locale}/beats`, label: t('beats'), route: true },
    { href: `/${locale}/services`, label: t('shop'), route: true },
    { href: sectionHref('process'), label: t('process'), route: false },
    { href: sectionHref('contact'), label: t('contact'), route: false },
  ];

  const bookHref = `/${locale}/booking`;
  const accountHref =
    status === 'authenticated' ? `/${locale}/account` : `/${locale}/account/login`;
  const accountLabel =
    status === 'authenticated'
      ? user?.first_name || t('account')
      : t('signIn');

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-bg/70 backdrop-blur-md border-b border-rule'
          : 'mix-blend-difference'
      )}
    >
      <nav className="mx-auto flex max-w-page items-center justify-between px-[clamp(20px,4vw,64px)] py-2">
        {/* Logo */}
        <Link href={`/${locale}`} className="shrink-0">
          <span className="logo-shine">
            <Image
              src="/pars-studios-logo.png"
              alt={`${t('logoTop')} ${t('logoBottom')}`}
              width={1007}
              height={320}
              priority
              className="h-16 w-auto"
            />
          </span>
        </Link>

        {/* Center links — desktop */}
        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex xl:gap-9">
          {links.map((l) => (
            <li key={l.href}>
              {isLanding && !l.route ? (
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

          <span className="hidden items-center gap-2 2xl:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
            <span className="font-mono text-[11px] uppercase tracking-meta">
              {t('status')}
            </span>
          </span>

          <Link
            href={accountHref}
            aria-label={accountLabel}
            className={cn(
              'hidden items-center gap-2 font-mono text-[11px] uppercase tracking-meta transition-opacity duration-300 hover:opacity-60 sm:flex',
              status === 'loading' && 'invisible'
            )}
          >
            <UserRound className="h-4 w-4" />
            <span className="hidden xl:inline">{accountLabel}</span>
          </Link>

          <CartButton locale={locale} />

          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href={bookHref}>{t('book')}</Link>
          </Button>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label={t('menu')}
                className="text-fg lg:hidden"
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
                      {isLanding && !l.route ? (
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
                <Link
                  href={accountHref}
                  className="mt-8 flex items-center gap-3 font-mono text-[11px] uppercase tracking-meta text-fg transition-colors hover:text-accent"
                >
                  <UserRound className="h-4 w-4" />
                  {accountLabel}
                </Link>
              </SheetClose>
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
