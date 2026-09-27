import Link from 'next/link';
import Image from 'next/image';
import { formatUsd, type BeatList } from '@/lib/api/catalog';
import PlayButton from '@/components/player/PlayButton';

export default function BeatCard({
  beat,
  locale,
  labels,
}: {
  beat: BeatList;
  locale: string;
  labels: { from: string; play: string; pause: string; unavailable: string };
}) {
  const href = `/${locale}/beats/${beat.slug}`;
  const track = beat.preview_url
    ? {
        id: beat.slug,
        title: beat.title,
        subtitle: [beat.genre, beat.bpm ? `${beat.bpm} BPM` : null, beat.key].filter(Boolean).join(' · '),
        url: beat.preview_url,
        coverUrl: beat.cover_url,
        href,
      }
    : null;

  return (
    <li className="group flex flex-col gap-5 border-b border-r border-rule bg-bg p-5 transition-colors duration-300 hover:bg-bg-soft md:p-6">
      <div className="relative aspect-square w-full overflow-hidden bg-bg-soft">
        <Link href={href} className="absolute inset-0" aria-label={beat.title}>
          {beat.cover_url ? (
            <Image
              src={beat.cover_url}
              alt={beat.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover opacity-85 transition-all duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-serif text-6xl font-light text-fg/20">
              {beat.title.charAt(0)}
            </span>
          )}
        </Link>
        <PlayButton
          track={track}
          label={labels}
          className="absolute bottom-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-visible:opacity-100 data-[active=true]:opacity-100"
        />
      </div>

      <header className="flex flex-col gap-1">
        <span className="meta">
          {[beat.genre, beat.bpm ? `${beat.bpm} BPM` : null, beat.key].filter(Boolean).join(' · ')}
        </span>
        <Link href={href}>
          <h3 className="font-serif text-2xl font-light leading-tight text-fg transition-colors group-hover:text-accent">
            {beat.title}
          </h3>
        </Link>
      </header>

      <footer className="mt-auto flex items-center justify-between">
        <span className="meta">
          {beat.min_price_usd ? `${labels.from} ${formatUsd(beat.min_price_usd)}` : ''}
        </span>
        {(beat.tags ?? []).length > 0 && (
          <span className="meta normal-case tracking-[0.12em] text-fg-dim/80">
            {(beat.tags ?? []).slice(0, 3).map((tag) => `#${tag}`).join(' ')}
          </span>
        )}
      </footer>
    </li>
  );
}
