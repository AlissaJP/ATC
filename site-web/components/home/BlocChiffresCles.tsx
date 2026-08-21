"use client";

import { Zap } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

// Nouvelle section (Raffinement Design Section 1.5, validé) — chiffres clés de confiance.
// ⚠️ Valeurs fictives de démonstration (décision actée n°42), à remplacer par les vrais chiffres ATC.
const STATISTIQUES = [
  { valeur: "500+", cleLabel: "accueil.chiffresLabel1" },
  { valeur: "80+", cleLabel: "accueil.chiffresLabel2" },
  { valeur: "300+", cleLabel: "accueil.chiffresLabel3" },
] as const;

export function BlocChiffresCles() {
  const { t } = useTranslation();

  return (
    <section className="rounded-2xl bg-background px-6 py-12 sm:px-10">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primaire-clair/10">
          <Zap size={26} className="text-primaire-clair" />
        </div>
        <h2 className="mt-4 font-titres text-2xl font-bold text-texte-principal md:text-3xl">
          {t("accueil.chiffresTitre")}
        </h2>
        <p className="mt-2 text-sm text-texte-secondaire md:text-base">{t("accueil.chiffresSousTitre")}</p>
      </div>

      <div className="mx-auto mt-10 flex max-w-3xl flex-col divide-y divide-bordure sm:flex-row sm:divide-x sm:divide-y-0">
        {STATISTIQUES.map((stat) => (
          <div key={stat.cleLabel} className="flex flex-1 flex-col items-center gap-1 py-6 text-center sm:py-0">
            <p className="font-titres text-4xl font-bold text-accent">{stat.valeur}</p>
            <p className="text-sm text-texte-secondaire">{t(stat.cleLabel)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
