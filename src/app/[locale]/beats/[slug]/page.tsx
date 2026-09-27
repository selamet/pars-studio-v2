import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n";
import { fetchBeat, localizedCopy } from "@/lib/api/catalog";
import PlayButton from "@/components/player/PlayButton";
import LicensePicker from "@/components/beats/LicensePicker";

type Props = { params: { locale: Locale; slug: string } };

export async function generateMetadata({
  params: { locale, slug },
}: Props): Promise<Metadata> {
  const beat = await fetchBeat(slug);
  if (!beat) return {};
  const t = await getTranslations({ locale, namespace: "beats" });
  return {
    title: `${beat.title} — ${t("heading")} — Pars Studios`,
    description: localizedCopy(beat, "description", locale) || t("intro"),
    openGraph: beat.cover_url ? { images: [beat.cover_url] } : undefined,
  };
}

export default async function BeatPage({ params: { locale, slug } }: Props) {
  unstable_setRequestLocale(locale);
  const beat = await fetchBeat(slug);
  if (!beat) notFound();
  const t = await getTranslations("beats");
  const description = localizedCopy(beat, "description", locale);

  const meta = [beat.genre, beat.bpm ? `${beat.bpm} BPM` : null, beat.key]
    .filter(Boolean)
    .join(" · ");
  const track = beat.preview_url
    ? {
        id: beat.slug,
        title: beat.title,
        subtitle: meta,
        url: beat.preview_url,
        coverUrl: beat.cover_url,
      }
    : null;

  return (
    <main>
      <section className="section pt-[clamp(140px,16vh,220px)]">
        <div className="shell">
          <Link
            href={`/${locale}/beats`}
            className="meta transition-colors hover:text-fg"
          >
            ← {t("backToBeats")}
          </Link>

          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
            <div className="relative aspect-square w-full overflow-hidden bg-bg-soft">
              {beat.cover_url ? (
                <Image
                  src={beat.cover_url}
                  alt={beat.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-serif text-[20vw] font-light text-fg/15 lg:text-[10vw]">
                  {beat.title.charAt(0)}
                </span>
              )}
              <PlayButton
                track={track}
                size="lg"
                label={{
                  play: t("player.play"),
                  pause: t("player.pause"),
                  unavailable: t("player.unavailable"),
                }}
                className="absolute bottom-6 right-6"
              />
            </div>

            <div className="flex flex-col gap-10">
              <header>
                <span className="meta !text-accent">{meta}</span>
                <h1 className="mt-5 font-serif font-light leading-[1.04] tracking-[-0.012em] text-[clamp(34px,4.5vw,64px)]">
                  {beat.title}
                </h1>
                {description && (
                  <p className="mt-6 max-w-xl whitespace-pre-line text-[15px] leading-[1.7] text-fg/[0.7]">
                    {description}
                  </p>
                )}
                {(beat.tags ?? []).length > 0 && (
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {(beat.tags ?? []).map((tag) => (
                      <li key={tag}>
                        <Link
                          href={`/${locale}/beats?tag=${encodeURIComponent(tag)}`}
                          className="border border-rule px-3 py-1.5 font-mono text-[10px] uppercase tracking-meta text-fg-dim transition-colors hover:border-fg/40 hover:text-fg"
                        >
                          #{tag}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </header>

              <section>
                <h2 className="meta mb-5">{t("licenses.heading")}</h2>
                <LicensePicker
                  beat={beat}
                  licenses={beat.licenses}
                  locale={locale}
                />
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
