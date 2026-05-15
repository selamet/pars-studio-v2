'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DISABLED_WEEKDAYS } from '@/lib/booking/services';
import { cn } from '@/lib/utils';

type Locale = 'tr' | 'en';

const MAX_MONTHS_AHEAD = 3;

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(1);
  x.setMonth(x.getMonth() + n);
  return x;
}

/** Inline editorial calendar — one month, hairline grid, brass-gold selection. */
export default function DateCalendar({
  value,
  onChange,
  locale,
}: {
  value: string;
  onChange: (iso: string) => void;
  locale: Locale;
}) {
  const t = useTranslations('booking.schedule');
  const months = t.raw('months') as string[];
  const weekdays = t.raw('weekdays') as string[];

  const today = useMemo(() => startOfDay(new Date()), []);
  const maxDate = useMemo(() => addMonths(today, MAX_MONTHS_AHEAD), [today]);

  const [view, setView] = useState<Date>(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const days = useMemo(() => buildGrid(view), [view]);

  const canPrev =
    view.getFullYear() > today.getFullYear() ||
    (view.getFullYear() === today.getFullYear() &&
      view.getMonth() > today.getMonth());
  const canNext =
    view.getFullYear() < maxDate.getFullYear() ||
    (view.getFullYear() === maxDate.getFullYear() &&
      view.getMonth() < maxDate.getMonth());

  return (
    <div className="border hairline bg-bg-soft/40 p-5 md:p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => canPrev && setView(addMonths(view, -1))}
          disabled={!canPrev}
          aria-label="previous month"
          className="h-8 w-8 flex items-center justify-center text-fg-dim transition-colors hover:text-fg disabled:opacity-25"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="font-mono text-[11px] uppercase tracking-meta text-fg">
          {locale === 'tr'
            ? `${months[view.getMonth()]} ${view.getFullYear()}`
            : `${months[view.getMonth()]} ${view.getFullYear()}`}
        </div>
        <button
          type="button"
          onClick={() => canNext && setView(addMonths(view, 1))}
          disabled={!canNext}
          aria-label="next month"
          className="h-8 w-8 flex items-center justify-center text-fg-dim transition-colors hover:text-fg disabled:opacity-25"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 pb-2">
        {weekdays.map((w) => (
          <div
            key={w}
            className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-fg-dim/60"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) {
            return <div key={`e-${i}`} className="aspect-square" />;
          }
          const iso = toIso(d);
          const disabled =
            d < today ||
            d > maxDate ||
            DISABLED_WEEKDAYS.includes(d.getDay());
          const selected = iso === value;
          const isToday = iso === toIso(today);

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onChange(iso)}
              aria-pressed={selected}
              className={cn(
                'aspect-square flex items-center justify-center font-mono text-[12px] transition-all duration-200 border',
                'tracking-[0.05em]',
                selected
                  ? 'border-accent bg-accent text-bg'
                  : isToday
                  ? 'border-fg-dim/40 text-fg'
                  : 'border-transparent text-fg-dim hover:border-fg-dim/40 hover:text-fg',
                disabled &&
                  'cursor-not-allowed text-fg-dim/20 hover:border-transparent hover:text-fg-dim/20'
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** A 6x7 grid (with leading/trailing nulls) for the given month. */
function buildGrid(view: Date): (Date | null)[] {
  const year = view.getFullYear();
  const month = view.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = first.getDay(); // 0..6, Sunday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
