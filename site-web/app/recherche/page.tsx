// ECR-02-001 — Résultats de recherche complets, prolonge les suggestions de l'en-tête. Gabarit
// partagé avec la page catégorie (ECR-01-002) via CatalogueBrowser — Raffinement Design.
import { CatalogueBrowser } from "@/components/product/CatalogueBrowser";
import { rechercherProduits } from "@/lib/services/recherche";
import { obtenirNiveauAlerteStock } from "@/lib/services/stock";
import { obtenirPaliersProduit } from "@/lib/services/bareme";
import { trouverMarqueParId } from "@/lib/mock-data/marques";

export default async function RecherchePage(props: PageProps<"/recherche">) {
  const { q } = await props.searchParams;
  const requete = typeof q === "string" ? q : "";
  const produits = await rechercherProduits(requete);

  const resultats = await Promise.all(
    produits.map(async (produit) => ({
      produit,
      niveauStock: await obtenirNiveauAlerteStock(produit.id),
      paliers: await obtenirPaliersProduit(produit.id),
      marque: produit.marque_id ? trouverMarqueParId(produit.marque_id) : undefined,
    }))
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal md:text-3xl">
        {resultats.length} résultat{resultats.length !== 1 ? "s" : ""} pour « {requete} »
      </h1>

      {resultats.length === 0 ? (
        <div className="rounded-xl border border-dashed border-bordure py-16 text-center">
          <p className="font-titres text-sm font-semibold text-texte-principal">Aucun résultat</p>
          <p className="mt-1 text-sm text-texte-secondaire">
            Essayez un autre terme ou parcourez nos catégories depuis le menu.
          </p>
        </div>
      ) : (
        <CatalogueBrowser produits={resultats} />
      )}
    </main>
  );
}
