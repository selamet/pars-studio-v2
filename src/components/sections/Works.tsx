import { useTranslations } from 'next-intl';
import SectionHeader from './SectionHeader';

type Work = {
  artist: string;
  project: string;
  year: string;
  role: string;
  spotifyId: string;
};

/** Section 005 — selected works as a Spotify-embed grid. */
export default function Works() {
  const t = useTranslations('works');
  const items = t.raw('items') as Work[];
  const previewSoon = t('previewSoon');

  return (
    <section id="works" className="section">
      <div className="shell">
        <SectionHeader
          section={t('section')}
          label={t('label')}
          heading={t('heading')}
        />

        <ul className="grid grid-cols-1 gap-px bg-rule md:grid-cols-2">
          {items.map((w, i) => (
            <li
              key={`${w.artist}-${w.project}`}
              className="reveal-text group flex flex-col gap-5 bg-bg p-6 transition-colors duration-300 hover:bg-bg-soft md:p-8"
            >
              {/* Header — artist + project */}
              <header className="flex flex-col gap-1">
                <span className="meta">{w.year}</span>
                <h3 className="font-serif text-2xl font-light leading-tight text-fg transition-colors group-hover:text-accent md:text-3xl">
                  {w.artist}
                </h3>
                <p className="text-[15px] text-fg/[0.7]">{w.project}</p>
              </header>

              {/* Spotify embed or placeholder */}
              {w.spotifyId ? (
                <div className="relative aspect-[4/1] w-full overflow-hidden bg-bg-soft">
                  <iframe
                    src={`https://open.spotify.com/embed/track/${w.spotifyId}?utm_source=generator&theme=0`}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading={i < 2 ? 'eager' : 'lazy'}
                    title={`${w.artist} — ${w.project}`}
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              ) : (
                <div className="relative flex aspect-[4/1] w-full items-center justify-center overflow-hidden border hairline bg-bg-soft/40">
                  <span className="meta text-fg/40">{previewSoon}</span>
                </div>
              )}

              {/* Meta footer — role */}
              <footer>
                <span className="meta">{w.role}</span>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
