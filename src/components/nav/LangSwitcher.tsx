'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { locales } from '@/i18n';
import { cn } from '@/lib/utils';

/** TR / EN toggle that preserves the current pathname. */
export default function LangSwitcher() {
  const active = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (next: string) => {
    if (next === active) return;
    const segments = pathname.split('/');
    segments[1] = next; // [ '', 'tr', ...rest ]
    router.push(segments.join('/') || '/');
  };

  return (
    <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-meta">
      {locales.map((l, i) => (
        <span key={l} className="flex items-center gap-2">
          {i > 0 && <span className="text-rule">/</span>}
          <button
            type="button"
            onClick={() => switchTo(l)}
            className={cn(
              'transition-colors duration-300',
              l === active
                ? 'text-accent'
                : 'text-fg-dim hover:text-fg'
            )}
            aria-current={l === active ? 'true' : undefined}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}
