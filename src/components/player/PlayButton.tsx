'use client';

import { Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlayer, type Track } from './PlayerProvider';

export default function PlayButton({
  track,
  label,
  size = 'md',
  className,
}: {
  track: Track | null;
  label: { play: string; pause: string; unavailable: string };
  size?: 'md' | 'lg';
  className?: string;
}) {
  const { toggle, playing, isCurrent } = usePlayer();
  const active = track ? isCurrent(track.id) && playing : false;
  const Icon = active ? Pause : Play;
  const disabled = !track;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={disabled ? label.unavailable : active ? label.pause : label.play}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (track) toggle(track);
      }}
      className={cn(
        'flex items-center justify-center rounded-full border border-fg/40 bg-bg/60 text-fg backdrop-blur-sm transition-all duration-300',
        'hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-30',
        size === 'lg' ? 'h-16 w-16' : 'h-11 w-11',
        active && 'border-accent text-accent',
        className
      )}
    >
      <Icon className={cn(size === 'lg' ? 'h-6 w-6' : 'h-4 w-4', !active && 'translate-x-px')} />
    </button>
  );
}
