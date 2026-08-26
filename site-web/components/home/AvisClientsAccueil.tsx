"use client";

import { MapPin } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Etoiles } from "@/components/product/Etoiles";
import { temoignages } from "@/lib/mock-data/temoignages";

function initiales(nom: string): string {
  const mots = nom.trim().split(/\s+/).filter(Boolean);
  return mots.slice(0, 2).map((m) => m[0].toUpperCase()).join("");
}

// Raffinement Design — section "Avis clients", directement au-dessus du bloc de confiance
// (BlocChiffresCles). Contenu mock (décision actée n°42) — cf. lib/mock-data/temoignages.ts pour la
// structure pensée en vue d'une vraie table "reviews"/"testimonials". Défilement horizontal natif sur
// mobile (même idiome que GalerieImages.tsx), grille sur desktop — pas de librairie de carrousel ajoutée.
//
// Correction (post-#22) — pas de synthèse notée (moyenne + répartition par étoile) ici : ces avis
// mélangent des produits sans rapport (caméra, batterie, service B2B...), une moyenne agrégée n'y a pas
// de sens réel. Ce résumé reste pertinent PAR PRODUIT, où il existe déjà (AvisProduit.tsx, fiche produit).
export function AvisClientsAccueil() {
  const { t } = useTranslation();

  return (
    <section>
      <h2 className="mb-6 font-titres text-2xl font-bold text-texte-principal">{t("accueil.avisClientsTitre")}</h2>
      <div className="flex snap-x gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
        {temoignages.map((temoin) => (
          <div
            key={temoin.id}
            className="flex w-72 shrink-0 snap-start flex-col gap-3 rounded-xl border border-bordure bg-background p-5 sm:w-auto"
          >
            <Etoiles note={temoin.note} taille={15} />
            <p className="flex-1 text-sm text-texte-principal">« {temoin.commentaire} »</p>
            <div className="flex items-center gap-3 border-t border-bordure pt-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primaire-clair text-xs font-semibold text-white">
                {initiales(temoin.nom)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-texte-principal">{temoin.nom}</p>
                {temoin.localisation && (
                  <p className="flex items-center gap-1 truncate text-xs text-texte-secondaire">
                    <MapPin size={11} className="shrink-0" />
                    {temoin.localisation}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
