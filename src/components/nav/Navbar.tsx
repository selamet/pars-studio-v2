'use client';

import Link from 'next/link';
import { useState } from 'react';
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
import LangSwitcher from './LangSwitcher';

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '#studio', label: t('studio') },
    { href: '#services', label: t('services') },
    { href: '#process', label: t('process') },
    { href: '#contact', label: t('contact') },
  ];

  const bookHref = `/${locale}/booking`;

  return (
    <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
      <nav className="mx-auto flex max-w-page items-center justify-between px-[clamp(20px,4vw,64px)] py-6">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="font-mono text-[11px] uppercase leading-[1.15] tracking-meta text-fg"
        >
          <span className="block">{t('logoTop')}</span>
          <span className="block">{t('logoBottom')}</span>
        </Link>

        {/* Center links — desktop */}
        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="font-mono text-[11px] uppercase tracking-meta text-fg transition-opacity duration-300 hover:opacity-60"
              >
                {l.label}
              </a>
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
                      <a
                        href={l.href}
                        className="font-serif text-3xl text-fg transition-colors hover:text-accent"
                      >
                        {l.label}
                      </a>
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
