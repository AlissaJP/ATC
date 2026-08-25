"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ProductCard } from "@/components/product/ProductCard";
import { categories } from "@/lib/mock-data/categories";
import type { ProduitEnrichi } from "@/lib/services/catalogue";

// BF-01-008 — Mise en avant des catégories phares (structure : Raffinement Design Section 1.2, validé ;
// approfondissement demandé — intro par catégorie + produits en extérieur + bouton "Voir tous").
// Sous-catégories affichées en tags uniquement pour Énergie solaire, seule catégorie ayant une vraie
// structure de sous-catégories dans lib/mock-data/categories.ts (Sécurité et Climatisation n'ont que 3
// produits chacune, sans axe de regroupement propre et cohérent dans leurs specifications — un tag
// décoratif sans filtre réel aurait été trompeur, cf. "si pertinent" dans la demande).
const BLOCS = [
  { slug: "energie-solaire", cleTraduction: "nav.energieSolaire", cleIntro: "accueil.introEnergieSolaire" },
  { slug: "securite", cleTraduction: "nav.securite", cleIntro: "accueil.introSecurite" },
  { slug: "climatisation", cleTraduction: "nav.climatisation", cleIntro: "accueil.introClimatisation" },
] as const;

const sousCategoriesEnergieSolaire = categories.filter((c) => c.parent_id === "cat-energie-solaire");

export function CategoriesPhares({
  produitsParCategorie,
}: {
  produitsParCategorie: Record<string, ProduitEnrichi[]>;
}) {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col gap-12">
      <h2 className="font-titres text-2xl font-bold text-texte-principal">{t("accueil.categoriesPhares")}</h2>

      {BLOCS.map((bloc) => {
        const produits = produitsParCategorie[bloc.slug] ?? [];
        if (produits.length === 0) return null;
        const nomCategorie = t(bloc.cleTraduction);

        return (
          <div key={bloc.slug}>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Link href={`/categorie/${bloc.slug}`} className="hover:text-primaire">
                  <h3 className="font-titres text-xl font-bold text-texte-principal sm:text-2xl">{nomCategorie}</h3>
                </Link>
                <p className="mt-1.5 max-w-2xl text-sm text-texte-secondaire">{t(bloc.cleIntro)}</p>
                {bloc.slug === "energie-solaire" && sousCategoriesEnergieSolaire.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sousCategoriesEnergieSolaire.map((sc) => (
                      <Link
                        key={sc.id}
                        href={`/categorie/${sc.slug}`}
                        className="rounded-full border border-bordure px-3 py-1 text-xs font-medium text-texte-principal transition-colors hover:border-primaire hover:text-primaire"
                      >
                        {sc.nom}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link
                href={`/categorie/${bloc.slug}`}
                className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-bordure px-4 py-2 text-sm font-semibold text-texte-principal transition-colors hover:border-primaire hover:text-primaire sm:self-auto"
              >
                {t("accueil.voirTousLesProduits")} {nomCategorie}
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
              {produits.map(({ produit, niveauStock, paliers }) => (
                <ProductCard key={produit.id} produit={produit} niveauStock={niveauStock} paliers={paliers} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
