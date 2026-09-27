"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";
import type { ServiceProduct } from "@/lib/api/catalog";

export default function AddServiceButton({
  service,
  locale,
  title,
  subtitle,
}: {
  service: ServiceProduct;
  locale: string;
  /** Localized name/kind for the cart line; defaults to the English API copy. */
  title?: string;
  subtitle?: string;
}) {
  const t = useTranslations("shop");
  const { add, has } = useCart();
  const inCart = has("service", service.id);

  if (inCart) {
    return (
      <Button asChild size="sm" variant="outline">
        <Link href={`/${locale}/cart`}>{t("inCart")}</Link>
      </Button>
    );
  }
  return (
    <Button
      type="button"
      size="sm"
      onClick={() =>
        add({
          type: "service",
          id: service.id,
          title: title ?? service.name,
          subtitle: subtitle ?? service.kind_label,
          price: service.price_usd,
          href: `/${locale}/services`,
        })
      }
    >
      {t("order")}
    </Button>
  );
}
