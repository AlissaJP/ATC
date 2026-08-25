"use client";

import { Award, MessageCircle, ShieldCheck, Building2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { lienWhatsApp } from "@/lib/constants/contact";

// BF-01-008 (adjacent) — Bloc de réassurance homepage à 4 éléments (structure : Raffinement Design
// Section 1.4, validé) ; pas d'élément "livraison" — ATC n'en propose pas (décision actée n°27) ; le 4e
// emplacement va à la qualité produit à la place. L'élément Support WhatsApp est cliquable (Raffinement
// Design) — seul élément du bloc qui ouvre une action, les 3 autres restent informatifs.
const ELEMENTS = [
  { Icone: ShieldCheck, cleTitre: "accueil.reassuranceTitre1", cleTexte: "accueil.reassuranceTexte1", whatsapp: false },
  { Icone: Building2, cleTitre: "accueil.reassuranceTitre2", cleTexte: "accueil.reassuranceTexte2", whatsapp: false },
  { Icone: MessageCircle, cleTitre: "accueil.reassuranceTitre3", cleTexte: "accueil.reassuranceTexte3", whatsapp: true },
  { Icone: Award, cleTitre: "accueil.reassuranceTitre4", cleTexte: "accueil.reassuranceTexte4", whatsapp: false },
] as const;

export function BlocReassurance() {
  const { t } = useTranslation();

  return (
    <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
      {ELEMENTS.map(({ Icone, cleTitre, cleTexte, whatsapp }) => {
        const contenu = (
          <>
            <Icone className="mt-0.5 shrink-0 text-primaire" size={22} />
            <div>
              <p className="font-titres text-sm font-semibold text-texte-principal">{t(cleTitre)}</p>
              <p className="text-sm text-texte-secondaire">{t(cleTexte)}</p>
            </div>
          </>
        );

        if (whatsapp) {
          return (
            <a
              key={cleTitre}
              href={lienWhatsApp("Bonjour, j'ai une question.")}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 rounded-lg transition-colors hover:text-primaire focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaire-clair"
            >
              {contenu}
            </a>
          );
        }

        return (
          <div key={cleTitre} className="flex items-start gap-3">
            {contenu}
          </div>
        );
      })}
    </section>
  );
}
