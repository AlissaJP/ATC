"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";

// RAFF-A-PROPOS, section 2 — ⚠️ texte de démonstration (doc de raffinement) : à remplacer par le
// texte définitif d'ATC dès qu'il sera disponible.
export function BlocMission() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-2xl text-center">
      <h2 className="mb-3 font-titres text-2xl font-bold text-texte-principal">{t("aPropos.missionTitre")}</h2>
      <p className="text-sm leading-relaxed text-texte-secondaire md:text-base">{t("aPropos.missionTexte")}</p>
    </section>
  );
}
