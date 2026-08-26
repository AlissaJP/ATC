"use client";

import { useMemo } from "react";
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
// Raffinement Design (#22) — synthèse (note moyenne + répartition par étoile) ajoutée au-dessus des
// cartes d'avis individuels, même structure à 2 colonnes que le bloc avis de la fiche produit
// (AvisProduit.tsx) pour rester cohérent sur le site, avec la couleur d'accent de marque pour les
// barres plutôt que la couleur d'avertissement utilisée là-bas. Libellés en français comme le reste du
// contenu de cette section (mock, décision actée n°42) — non traduits, même choix que AvisProduit.tsx.
export function AvisClientsAccueil() {
  const { t } = useTranslation();

  const moyenne = useMemo(
    () => (temoignages.length > 0 ? temoignages.reduce((s, a) => s + a.note, 0) / temoignages.length : 0),
    []
  );
  const repartition = useMemo(() => {
    const compte = [0, 0, 0, 0, 0]; // index 0 = 1 étoile ... index 4 = 5 étoiles
    for (const a of temoignages) compte[a.note - 1] += 1;
    return [5, 4, 3, 2, 1].map((n) => ({ note: n, nombre: compte[n - 1] }));
  }, []);

  return (
    <section>
      <h2 className="mb-6 font-titres text-2xl font-bold text-texte-principal">{t("accueil.avisClientsTitre")}</h2>

      <div className="mb-8 grid gap-8 rounded-2xl border border-bordure bg-background p-6 sm:p-8 md:grid-cols-[minmax(0,220px)_1fr] md:gap-10">
        <div>
          <div className="flex items-center gap-2">
            <Etoiles note={Math.round(moyenne)} taille={22} />
            <span className="font-titres text-2xl font-bold text-texte-principal">{moyenne.toFixed(1)} sur 5</span>
          </div>
          <p className="mt-2 text-sm text-texte-secondaire">Basé sur {temoignages.length} avis</p>
        </div>
        <div className="flex flex-col gap-3">
          {repartition.map(({ note: n, nombre }) => (
            <div key={n} className="flex items-center gap-3 text-sm">
              <span className="w-16 shrink-0 whitespace-nowrap text-texte-secondaire">
                {n} étoile{n > 1 ? "s" : ""}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-fond">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${temoignages.length > 0 ? (nombre / temoignages.length) * 100 : 0}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-texte-secondaire">{nombre}</span>
            </div>
          ))}
        </div>
      </div>

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
