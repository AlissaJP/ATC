"use client";

import { Award, Globe, HeartHandshake, Wrench } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

// RAFF-A-PROPOS, section 3 — 4 blocs icône + texte, même style que BlocReassurance (Section 1.4).
const VALEURS = [
  { Icone: Award, cleTitre: "aPropos.valeur1Titre", cleTexte: "aPropos.valeur1Texte" },
  { Icone: Globe, cleTitre: "aPropos.valeur2Titre", cleTexte: "aPropos.valeur2Texte" },
  { Icone: Wrench, cleTitre: "aPropos.valeur3Titre", cleTexte: "aPropos.valeur3Texte" },
  { Icone: HeartHandshake, cleTitre: "aPropos.valeur4Titre", cleTexte: "aPropos.valeur4Texte" },
] as const;

export function BlocValeurs() {
  const { t } = useTranslation();

  return (
    <section>
      <h2 className="mb-6 font-titres text-2xl font-bold text-texte-principal">{t("aPropos.valeursTitre")}</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
        {VALEURS.map(({ Icone, cleTitre, cleTexte }) => (
          <div key={cleTitre} className="flex items-start gap-3">
            <Icone className="mt-0.5 shrink-0 text-primaire" size={22} />
            <div>
              <p className="font-titres text-sm font-semibold text-texte-principal">{t(cleTitre)}</p>
              <p className="text-sm text-texte-secondaire">{t(cleTexte)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
