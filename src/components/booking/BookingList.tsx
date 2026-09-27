"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { CalendarPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  fetchReservations,
  reservationIcsUrl,
  type Reservation,
} from "@/lib/api/bookings";
import { formatUsd } from "@/lib/api/catalog";

const TONE: Record<
  string,
  "pending" | "confirmed" | "completed" | "cancelled" | "neutral"
> = {
  hold: "pending",
  confirmed: "confirmed",
  completed: "completed",
  cancelled: "cancelled",
  expired: "cancelled",
};

export default function BookingList({ locale }: { locale: string }) {
  const t = useTranslations("booking.mine");
  const tCatalog = useTranslations("catalog");
  const format = useFormatter();
  const router = useRouter();
  const { status } = useAuth();
  const [items, setItems] = useState<Reservation[] | null>(null);

  useEffect(() => {
    if (status === "anonymous") {
      router.replace(
        `/${locale}/account/login?next=${encodeURIComponent(`/${locale}/account/bookings`)}`,
      );
    }
    if (status === "authenticated")
      fetchReservations()
        .then(setItems)
        .catch(() => setItems([]));
  }, [status, router, locale]);

  if (items === null)
    return <p className="meta animate-pulse">{t("loading")}</p>;
  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[15px] text-fg/[0.7]">{t("empty")}</p>
        <Link
          href={`/${locale}/booking`}
          className="meta underline underline-offset-4 hover:text-fg"
        >
          {t("book")}
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col border-t border-rule">
      {items.map((r) => (
        <li
          key={r.id}
          className="flex flex-col gap-3 border-b border-rule py-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-serif text-xl font-light">
                {tCatalog(`serviceTypes.${r.service_type}`)}
              </span>
              <span className="meta block">
                {format.dateTime(new Date(`${r.session_date}T00:00:00`), {
                  dateStyle: "long",
                })}{" "}
                · {r.start_time.slice(0, 5)}–{r.end_time.slice(0, 5)} · #
                {r.code}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Badge tone={TONE[r.status ?? "hold"] ?? "neutral"}>
                {t(`status.${r.status ?? "hold"}` as never)}
              </Badge>
              <span className="font-mono text-[14px]">
                {formatUsd(r.price_usd)}
              </span>
            </div>
          </div>
          {r.status === "confirmed" && (
            <a
              href={reservationIcsUrl(r.id)}
              className="flex w-fit items-center gap-2 border border-fg/40 px-3 py-2 font-mono text-[10px] uppercase tracking-meta transition-colors hover:border-accent hover:text-accent"
            >
              <CalendarPlus className="h-3.5 w-3.5" /> {t("ics")}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
