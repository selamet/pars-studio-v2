import Image from 'next/image';
import { useTranslations } from 'next-intl';
import SectionHeader from './SectionHeader';

type Room = {
  name: string;
  gear: string;
  image: string;
};

/** Section 003 — studio rooms grid with monospace equipment captions. */
export default function Rooms() {
  const t = useTranslations('rooms');
  const items = t.raw('items') as Room[];

  return (
    <section id="rooms" className="section">
      <div className="shell">
        <SectionHeader
          section={t('section')}
          label={t('label')}
          heading={t('heading')}
        />

        <div className="grid gap-px bg-rule sm:grid-cols-2">
          {items.map((room) => (
            <figure
              key={room.name}
              className="reveal-text group bg-bg"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-bg-soft">
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover opacity-80 grayscale transition-all duration-700 group-hover:scale-[1.03] group-hover:opacity-100 group-hover:grayscale-0"
                />
              </div>
              <figcaption className="flex flex-col gap-3 py-7">
                <h3 className="font-serif text-2xl font-light text-fg">
                  {room.name}
                </h3>
                <p className="meta normal-case tracking-[0.12em] text-fg-dim">
                  {room.gear}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
