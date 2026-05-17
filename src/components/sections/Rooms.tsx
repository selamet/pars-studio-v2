import { useTranslations } from 'next-intl';
import SectionHeader from './SectionHeader';
import RoomCard from './RoomCard';

type Room = {
  name: string;
  gear: string;
  image: string;
};

/** Section 004 — studio rooms grid with click-to-expand lightbox. */
export default function Rooms() {
  const t = useTranslations('rooms');
  const tNav = useTranslations('nav');
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
            <RoomCard
              key={room.name}
              name={room.name}
              gear={room.gear}
              image={room.image}
              closeLabel={tNav('close')}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
