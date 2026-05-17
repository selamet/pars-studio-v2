import { useTranslations } from 'next-intl';
import SectionHeader from './SectionHeader';

type Member = {
  name: string;
  role: string;
  bio: string;
  signature: string;
};

/** Section 002 — the people behind the studio. */
export default function Team() {
  const t = useTranslations('team');
  const items = t.raw('items') as Member[];

  return (
    <section id="team" className="section">
      <div className="shell">
        <SectionHeader
          section={t('section')}
          label={t('label')}
          heading={t('heading')}
        />

        <ul className="grid gap-px bg-rule md:grid-cols-3">
          {items.map((m, i) => (
            <li
              key={m.name}
              className="reveal-text relative flex flex-col gap-8 bg-bg p-8 transition-colors duration-300 hover:bg-bg-soft md:p-10"
            >
              {/* Oversize index number (substitutes for headshot) */}
              <span
                aria-hidden
                className="font-serif text-[88px] font-light leading-none text-accent/15 md:text-[112px]"
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              <div className="flex flex-col gap-4">
                <h3 className="font-serif text-2xl font-light leading-tight text-fg md:text-3xl">
                  {m.name}
                </h3>
                <span className="meta">{m.role}</span>
                <p className="max-w-md text-[14.5px] leading-[1.65] text-fg/[0.72]">
                  {m.bio}
                </p>
              </div>

              <footer className="mt-auto border-t hairline pt-5">
                <span className="meta !text-accent">{m.signature}</span>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
