"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { ProductCard } from "@/components/product/ProductCard";
import { categories } from "@/lib/mock-data/categories";
import type { ProduitEnrichi } from "@/lib/services/catalogue";
import { nomCategorie as nomSousCategorie } from "@/lib/i18n/catalogue";

// BF-01-008 — Mise en avant des catégories phares (structure : Raffinement Design Section 1.2, validé ;
// approfondissement demandé — intro par catégorie + produits en extérieur + bouton "Voir tous").
// Sous-catégories affichées en tags (liens vers leur page) dès qu'une catégorie en compte au moins deux —
// même règle que les onglets de la page catégorie (catalogue ATC : Énergie solaire et Climatisation ;
// Sécurité n'a qu'une sous-catégorie, Caméras).
const BLOCS = [
  { slug: "energie-solaire", cleTraduction: "nav.energieSolaire", cleIntro: "accueil.introEnergieSolaire" },
  { slug: "securite", cleTraduction: "nav.securite", cleIntro: "accueil.introSecurite" },
  { slug: "climatisation", cleTraduction: "nav.climatisation", cleIntro: "accueil.introClimatisation" },
] as const;

function sousCategoriesAffichees(slugRacine: string) {
  const racine = categories.find((c) => c.slug === slugRacine);
  const sousCategories = racine ? categories.filter((c) => c.parent_id === racine.id) : [];
  return sousCategories.length > 1 ? sousCategories : [];
}

export function CategoriesPhares({
  produitsParCategorie,
}: {
  produitsParCategorie: Record<string, ProduitEnrichi[]>;
}) {
  const { t, langue } = useTranslation();

  return (
    <section className="flex flex-col gap-12">
      <h2 className="font-titres text-2xl font-bold text-texte-principal">{t("accueil.categoriesPhares")}</h2>

      {BLOCS.map((bloc) => {
        const produits = produitsParCategorie[bloc.slug] ?? [];
        if (produits.length === 0) return null;
        const nomCategorie = t(bloc.cleTraduction);
        const sousCategories = sousCategoriesAffichees(bloc.slug);

        return (
          <div key={bloc.slug}>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Link href={`/categorie/${bloc.slug}`} className="hover:text-primaire">
                  <h3 className="font-titres text-xl font-bold text-texte-principal sm:text-2xl">{nomCategorie}</h3>
                </Link>
                <p className="mt-1.5 max-w-2xl text-sm text-texte-secondaire">{t(bloc.cleIntro)}</p>
                {sousCategories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sousCategories.map((sc) => (
                      <Link
                        key={sc.id}
                        href={`/categorie/${sc.slug}`}
                        className="rounded-full border border-bordure px-3 py-1 text-xs font-medium text-texte-principal transition-colors hover:border-primaire hover:text-primaire"
                      >
                        {nomSousCategorie(sc, langue)}
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
