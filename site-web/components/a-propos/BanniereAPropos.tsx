"use client";

import Image from "next/image";
import { useTranslation } from "@/lib/i18n/useTranslation";

// RAFF-A-PROPOS, section 1 — bannière. energie-13.webp (suggestion initiale du doc) écartée : elle
// montre une batterie de marque tierce non liée à ATC (même famille de problème que l'Axe 2 de
// l'audit). energie-04.webp retenue : technicien ATC réel en action sur toit, sans logo tiers.
export function BanniereAPropos() {
  const { t } = useTranslation();

  return (
    <section className="relative h-[320px] overflow-hidden rounded-2xl md:h-[400px]">
      <Image
        src="/images/energie-solaire/energie-04.webp"
        alt="Technicien ATC en intervention sur une installation solaire en toiture"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-texte-principal/85 via-texte-principal/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 md:p-10">
        <h1 className="font-titres text-3xl font-bold text-white md:text-4xl">{t("aPropos.bannerTitre")}</h1>
        <p className="max-w-2xl text-sm text-white/85 md:text-base">{t("aPropos.bannerTagline")}</p>
      </div>
    </section>
  );
}
