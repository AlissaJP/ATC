"use client";

import { Award, MessageCircle, ShieldCheck, Building2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

// BF-01-008 (adjacent) — Bloc de réassurance homepage à 4 éléments (structure : Raffinement Design
// Section 1.4, validé). Distinct du bloc 3 éléments du Footer (celui-ci est sitewide, propre à l'accueil) ;
// pas d'élément "livraison" — ATC n'en propose pas (décision actée n°27) ; le 4e emplacement va à la
// qualité produit à la place.
const ELEMENTS = [
  { Icone: ShieldCheck, cleTitre: "accueil.reassuranceTitre1", cleTexte: "accueil.reassuranceTexte1" },
  { Icone: Building2, cleTitre: "accueil.reassuranceTitre2", cleTexte: "accueil.reassuranceTexte2" },
  { Icone: MessageCircle, cleTitre: "accueil.reassuranceTitre3", cleTexte: "accueil.reassuranceTexte3" },
  { Icone: Award, cleTitre: "accueil.reassuranceTitre4", cleTexte: "accueil.reassuranceTexte4" },
] as const;

export function BlocReassurance() {
  const { t } = useTranslation();

  return (
    <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
      {ELEMENTS.map(({ Icone, cleTitre, cleTexte }) => (
        <div key={cleTitre} className="flex items-start gap-3">
          <Icone className="mt-0.5 shrink-0 text-primaire" size={22} />
          <div>
            <p className="font-titres text-sm font-semibold text-texte-principal">{t(cleTitre)}</p>
            <p className="text-sm text-texte-secondaire">{t(cleTexte)}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
