'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BEAT_ORDERINGS, beatQueryString, type BeatQuery } from '@/lib/api/catalog';
import { cn } from '@/lib/utils';

/** Filter form that mirrors its state into the URL so results are shareable. */
export default function BeatFilters({
  query,
  genres,
}: {
  query: BeatQuery;
  genres: string[];
}) {
  const t = useTranslations('beats.filters');
  const router = useRouter();
  const pathname = usePathname();
  const [draft, setDraft] = useState<BeatQuery>(query);

  function apply(next: BeatQuery) {
    const { page: _page, ...rest } = next;
    router.push(`${pathname}${beatQueryString(rest)}`);
  }

  function set<K extends keyof BeatQuery>(key: K, value: string) {
    setDraft((d) => ({ ...d, [key]: value || undefined }));
  }

  const hasFilters = Object.entries(query).some(([k, v]) => k !== 'page' && v);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply(draft);
      }}
      className="mb-12 flex flex-col gap-8 border-y border-rule py-8"
    >
      <div className="grid gap-8 md:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <Label htmlFor="search">{t('search')}</Label>
          <div className="relative">
            <Input
              id="search"
              placeholder={t('searchPh')}
              value={draft.search ?? ''}
              onChange={(e) => set('search', e.target.value)}
              className="pr-8"
            />
            <Search className="pointer-events-none absolute right-0 top-3.5 h-4 w-4 text-fg-dim" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Label htmlFor="key">{t('key')}</Label>
          <Input
            id="key"
            placeholder="Am"
            value={draft.key ?? ''}
            onChange={(e) => set('key', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-3">
          <Label htmlFor="bpm_min">{t('bpmMin')}</Label>
          <Input
            id="bpm_min"
            type="number"
            inputMode="numeric"
            min={40}
            max={260}
            value={draft.bpm_min ?? ''}
            onChange={(e) => set('bpm_min', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-3">
          <Label htmlFor="bpm_max">{t('bpmMax')}</Label>
          <Input
            id="bpm_max"
            type="number"
            inputMode="numeric"
            min={40}
            max={260}
            value={draft.bpm_max ?? ''}
            onChange={(e) => set('bpm_max', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-3">
          <Label htmlFor="ordering">{t('ordering')}</Label>
          <select
            id="ordering"
            value={draft.ordering ?? '-published_at'}
            onChange={(e) => set('ordering', e.target.value)}
            className="w-full border-0 border-b border-rule bg-transparent px-0 py-3 font-sans text-[15px] text-fg outline-none focus:border-accent"
          >
            {BEAT_ORDERINGS.map((o) => (
              <option key={o} value={o} className="bg-bg text-fg">
                {t(`order.${o}` as never)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="meta mr-2">{t('genre')}</span>
        {genres.map((genre) => {
          const active = (query.genre ?? '').toLowerCase() === genre.toLowerCase();
          return (
            <button
              key={genre}
              type="button"
              onClick={() => apply({ ...draft, genre: active ? undefined : genre })}
              className={cn(
                'border px-3 py-1.5 font-mono text-[10px] uppercase tracking-meta transition-colors',
                active
                  ? 'border-accent text-accent'
                  : 'border-rule text-fg-dim hover:border-fg/40 hover:text-fg'
              )}
            >
              {genre}
            </button>
          );
        })}
        <span className="ml-auto flex items-center gap-4">
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setDraft({});
                apply({});
              }}
              className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-meta text-fg-dim transition-colors hover:text-fg"
            >
              <X className="h-3.5 w-3.5" />
              {t('clear')}
            </button>
          )}
          <button
            type="submit"
            className="border border-fg/40 px-5 py-2 font-mono text-[11px] uppercase tracking-meta text-fg transition-colors hover:border-accent hover:text-accent"
          >
            {t('apply')}
          </button>
        </span>
      </div>
    </form>
  );
}
