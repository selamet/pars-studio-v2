'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Pause, Play, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePlayer } from './PlayerProvider';

/** Slim bottom bar shown while a preview is loaded. */
export default function PlayerBar() {
  const t = useTranslations('beats.player');
  const { track, playing, progress, toggle, pause } = usePlayer();
  if (!track) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-bg/85 backdrop-blur-md">
      <div
        className="h-px bg-accent transition-[width] duration-300 ease-linear"
        style={{ width: `${Math.round(progress * 100)}%` }}
        aria-hidden
      />
      <div className="mx-auto flex max-w-page items-center gap-4 px-[clamp(20px,4vw,64px)] py-3">
        <button
          type="button"
          onClick={() => toggle(track)}
          aria-label={playing ? t('pause') : t('play')}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-fg/40 text-fg transition-colors hover:border-accent hover:text-accent"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 translate-x-px" />}
        </button>
        {track.coverUrl && (
          <span className="relative hidden h-9 w-9 shrink-0 overflow-hidden bg-bg-soft sm:block">
            <Image src={track.coverUrl} alt="" fill sizes="36px" className="object-cover" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          {track.href ? (
            <Link href={track.href} className="block truncate font-serif text-lg leading-tight hover:text-accent">
              {track.title}
            </Link>
          ) : (
            <span className="block truncate font-serif text-lg leading-tight">{track.title}</span>
          )}
          {track.subtitle && <span className="meta block truncate">{track.subtitle}</span>}
        </div>
        <span className="meta hidden sm:block">{t('preview')}</span>
        <button
          type="button"
          onClick={pause}
          aria-label={t('close')}
          className="text-fg-dim transition-colors hover:text-fg"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
