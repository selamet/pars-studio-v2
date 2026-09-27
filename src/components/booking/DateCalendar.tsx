'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  disabledWeekdays,
  maxDaysAhead,
}: {
  value: string;
  onChange: (iso: string) => void;
  /** JavaScript getDay() values (0 = Sunday) the studio is closed on. */
  disabledWeekdays: number[];
  maxDaysAhead: number;
}) {
  const t = useTranslations('booking.schedule');
  const months = t.raw('months') as string[];
  const weekdays = t.raw('weekdays') as string[];

  const today = useMemo(() => startOfDay(new Date()), []);
  const maxDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + maxDaysAhead);
    return d;
  }, [today, maxDaysAhead]);

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
    (view.getFullYear() === today.getFullYear() && view.getMonth() > today.getMonth());
  const canNext =
    view.getFullYear() < maxDate.getFullYear() ||
    (view.getFullYear() === maxDate.getFullYear() && view.getMonth() < maxDate.getMonth());

  return (
    <div className="border hairline bg-bg-soft/40 p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => canPrev && setView(addMonths(view, -1))}
          disabled={!canPrev}
          aria-label="previous month"
          className="flex h-8 w-8 items-center justify-center text-fg-dim transition-colors hover:text-fg disabled:opacity-25"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="font-mono text-[11px] uppercase tracking-meta text-fg">
          {months[view.getMonth()]} {view.getFullYear()}
        </div>
        <button
          type="button"
          onClick={() => canNext && setView(addMonths(view, 1))}
          disabled={!canNext}
          aria-label="next month"
          className="flex h-8 w-8 items-center justify-center text-fg-dim transition-colors hover:text-fg disabled:opacity-25"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 pb-2">
        {weekdays.map((w) => (
          <div key={w} className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-fg-dim/60">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <div key={`e-${i}`} className="aspect-square" />;
          const iso = toIso(d);
          const disabled = d < today || d > maxDate || disabledWeekdays.includes(d.getDay());
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
                'flex aspect-square items-center justify-center border font-mono text-[12px] tracking-[0.05em] transition-all duration-200',
                selected
                  ? 'border-accent bg-accent text-bg'
                  : isToday
                    ? 'border-fg-dim/40 text-fg'
                    : 'border-transparent text-fg-dim hover:border-fg-dim/40 hover:text-fg',
                disabled && 'cursor-not-allowed text-fg-dim/20 hover:border-transparent hover:text-fg-dim/20'
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

function buildGrid(view: Date): (Date | null)[] {
  const year = view.getFullYear();
  const month = view.getMonth();
  const startOffset = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
