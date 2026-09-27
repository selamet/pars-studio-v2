import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n';
import { beatQueryString, fetchBeats, type BeatQuery } from '@/lib/api/catalog';
import BeatCard from '@/components/beats/BeatCard';
import BeatFilters from '@/components/beats/BeatFilters';

const QUERY_KEYS = ['genre', 'key', 'bpm_min', 'bpm_max', 'tag', 'search', 'ordering', 'page'] as const;

type Props = {
  params: { locale: Locale };
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'beats' });
  return { title: `${t('heading')} — Pars Studios`, description: t('intro') };
}

function pickQuery(searchParams: Props['searchParams']): BeatQuery {
  const query: BeatQuery = {};
  for (const key of QUERY_KEYS) {
    const value = searchParams[key];
    if (typeof value === 'string' && value) query[key] = value;
  }
  return query;
}

export default async function BeatsPage({ params: { locale }, searchParams }: Props) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations('beats');
  const query = pickQuery(searchParams);
  const [page, all] = await Promise.all([
    fetchBeats(query),
    // Genres for the chip row come from the unfiltered catalog (first page is enough).
    fetchBeats({ ordering: 'title' }),
  ]);
  const genres = Array.from(
    new Set(all.results.map((b) => b.genre).filter((g): g is string => Boolean(g)))
  ).sort();
  const currentPage = Number(query.page ?? '1');
  const labels = {
    from: t('from'),
    play: t('player.play'),
    pause: t('player.pause'),
    unavailable: t('player.unavailable'),
  };

  return (
    <main>
      <section className="section pt-[clamp(160px,18vh,240px)]">
        <div className="shell">
          <header className="mb-[clamp(40px,6vh,72px)]">
            <div className="flex items-center gap-5">
              <span className="meta !text-accent">{t('section')}</span>
              <span className="h-px w-12 bg-rule" aria-hidden />
              <span className="meta">{t('label')}</span>
            </div>
            <h1 className="mt-7 max-w-[18ch] font-serif font-light leading-[1.04] tracking-[-0.012em] text-[clamp(34px,5vw,78px)]">
              {t('heading')}
            </h1>
            <p className="mt-6 max-w-xl text-[15px] leading-[1.7] text-fg/[0.7]">{t('intro')}</p>
          </header>

          <BeatFilters query={query} genres={genres} />

          {page.results.length === 0 ? (
            <p className="meta py-24 text-center">{t('empty')}</p>
          ) : (
            <ul className="grid grid-cols-1 border-l border-t border-rule sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {page.results.map((beat) => (
                <BeatCard key={beat.id} beat={beat} locale={locale} labels={labels} />
              ))}
            </ul>
          )}

          {(page.previous || page.next) && (
            <nav className="mt-12 flex items-center justify-between border-t border-rule pt-6">
              <PageLink
                href={page.previous ? beatQueryString({ ...query, page: String(currentPage - 1) }) : null}
                label={t('prev')}
              />
              <span className="meta">
                {t('pageOf', { page: currentPage, total: Math.max(1, Math.ceil(page.count / 24)) })}
              </span>
              <PageLink
                href={page.next ? beatQueryString({ ...query, page: String(currentPage + 1) }) : null}
                label={t('next')}
              />
            </nav>
          )}
        </div>
      </section>
    </main>
  );
}

function PageLink({ href, label }: { href: string | null; label: string }) {
  if (!href) return <span className="meta opacity-30">{label}</span>;
  return (
    <Link href={href} className="meta transition-colors hover:text-fg">
      {label}
    </Link>
  );
}
