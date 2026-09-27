'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type Track = {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  coverUrl?: string | null;
  href?: string;
};

type PlayerContextValue = {
  track: Track | null;
  playing: boolean;
  progress: number; // 0..1
  toggle: (track: Track) => void;
  pause: () => void;
  isCurrent: (id: string) => boolean;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

/** Single shared <audio>: only one preview plays at a time across the site. */
export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none';
    audioRef.current = audio;
    const onTime = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
    };
    const onPause = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('play', onPlay);
    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('play', onPlay);
      audioRef.current = null;
    };
  }, []);

  const toggle = useCallback(
    (next: Track) => {
      const audio = audioRef.current;
      if (!audio) return;
      if (track?.id === next.id) {
        if (audio.paused) void audio.play();
        else audio.pause();
        return;
      }
      setTrack(next);
      setProgress(0);
      audio.src = next.url;
      void audio.play();
    },
    [track]
  );

  const pause = useCallback(() => audioRef.current?.pause(), []);
  const isCurrent = useCallback((id: string) => track?.id === id, [track]);

  const value = useMemo(
    () => ({ track, playing, progress, toggle, pause, isCurrent }),
    [track, playing, progress, toggle, pause, isCurrent]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used inside <PlayerProvider>.');
  return ctx;
}
