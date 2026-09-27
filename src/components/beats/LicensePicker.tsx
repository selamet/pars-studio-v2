"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";
import {
  formatUsd,
  type BeatDetail,
  type BeatLicense,
} from "@/lib/api/catalog";
import { cn } from "@/lib/utils";

/** Tier selector for a beat; the selected license goes into the cart (one license per beat). */
export default function LicensePicker({
  beat,
  licenses,
  locale,
}: {
  beat: Pick<BeatDetail, "slug" | "title" | "cover_url">;
  licenses: BeatLicense[];
  locale: string;
}) {
  const t = useTranslations("beats.licenses");
  const tCatalog = useTranslations("catalog");
  const tierLabel = (license: BeatLicense) => tCatalog(`tiers.${license.tier}`);
  const { add, has } = useCart();
  const [selectedId, setSelectedId] = useState<number | null>(
    licenses[0]?.id ?? null,
  );
  const selected = licenses.find((l) => l.id === selectedId) ?? null;
  const inCart = selected ? has("beat_license", selected.id) : false;

  if (licenses.length === 0) {
    return <p className="meta">{t("none")}</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <ul
        className="flex flex-col gap-px bg-rule"
        role="radiogroup"
        aria-label={t("heading")}
      >
        {licenses.map((license) => {
          const active = license.id === selectedId;
          return (
            <li key={license.id} className="bg-bg">
              <button
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelectedId(license.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-6 px-5 py-5 text-left transition-colors md:px-6",
                  active ? "bg-bg-soft" : "hover:bg-bg-soft/60",
                )}
              >
                <span className="flex items-center gap-4">
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border",
                      active
                        ? "border-accent text-accent"
                        : "border-fg/30 text-transparent",
                    )}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="font-serif text-xl font-light">
                      {tierLabel(license)}
                    </span>
                    <span className="meta">
                      {license.includes
                        .map((kind) => t(`files.${kind}` as never))
                        .join(" · ")}
                    </span>
                  </span>
                </span>
                <span className="font-mono text-[15px] text-fg">
                  {formatUsd(license.price_usd)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {selected && (
        <div className="flex flex-col gap-6">
          {selected.terms && (
            <details className="group border-t border-rule pt-5">
              <summary className="meta cursor-pointer list-none transition-colors hover:text-fg">
                {t("terms")} <span className="ml-1 group-open:hidden">+</span>
                <span className="ml-1 hidden group-open:inline">−</span>
              </summary>
              <p className="mt-4 whitespace-pre-line text-[14px] leading-[1.7] text-fg/[0.7]">
                {selected.terms}
              </p>
            </details>
          )}
          {inCart ? (
            <Button asChild size="lg" variant="outline" className="w-full">
              <Link href={`/${locale}/cart`}>{t("inCart")}</Link>
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={() =>
                add({
                  type: "beat_license",
                  id: selected.id,
                  title: `${beat.title} — ${tierLabel(selected)}`,
                  subtitle: selected.includes
                    .map((k) => t(`files.${k}` as never))
                    .join(" · "),
                  price: selected.price_usd,
                  href: `/${locale}/beats/${beat.slug}`,
                  coverUrl: beat.cover_url,
                  beatSlug: beat.slug,
                })
              }
            >
              {t("addToCart")} · {formatUsd(selected.price_usd)}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
