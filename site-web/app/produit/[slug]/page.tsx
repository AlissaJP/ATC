// ECR-03-001 — Fiche produit. BF-03-001 à BF-03-007, RG-03-001 à RG-03-004, RG-08-001.
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { GalerieImages } from "@/components/product/GalerieImages";
import { AchatProduit } from "@/components/product/AchatProduit";
import { ProduitsAssocies } from "@/components/product/ProduitsAssocies";
import { AvisProduit } from "@/components/product/AvisProduit";
import { obtenirProduitEnrichiParSlug, listerProduitsEnrichisParIds } from "@/lib/services/catalogue";
import { obtenirStock } from "@/lib/services/stock";
import { listerCategories } from "@/lib/services/produits";
import { trouverGarantieParCategorie } from "@/lib/mock-data/garanties";
import { listerCaracteristiques } from "@/lib/services/caracteristiques";

export default async function ProduitPage(props: PageProps<"/produit/[slug]">) {
  const { slug } = await props.params;
  const resultat = await obtenirProduitEnrichiParSlug(slug);

  if (!resultat) notFound();

  const { produit, niveauStock, paliers, marque } = resultat;
  const [stock, categories, produitsAssocies] = await Promise.all([
    obtenirStock(produit.id),
    listerCategories(),
    listerProduitsEnrichisParIds(produit.accessoires_compatibles_ids ?? []),
  ]);

  // Sélecteur affiché uniquement si au moins 2 valeurs existent réellement pour ce produit (point #29).
  const variantes = produit.variantes && produit.variantes.length > 1 ? produit.variantes : undefined;

  const categorie = categories.find((c) => c.id === produit.categorie_id);
  const categorieParente = categorie?.parent_id ? categories.find((c) => c.id === categorie.parent_id) : undefined;
  // Catalogue ATC : aucune garantie générique par catégorie sur un produit du catalogue client (`ref`) —
  // le client n'en a pas communiqué ; une garantie fabricant figure le cas échéant dans ses caractéristiques.
  const garantie = produit.ref ? undefined : trouverGarantieParCategorie(produit.categorie_id);
  const caracteristiques = listerCaracteristiques(produit.caracteristiques);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
      <Breadcrumb
        items={[
          ...(categorieParente
            ? [{ label: categorieParente.nom, href: `/categorie/${categorieParente.slug}` }]
            : []),
          ...(categorie ? [{ label: categorie.nom, href: `/categorie/${categorie.slug}` }] : []),
          { label: produit.nom },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <GalerieImages produit={produit} />

        <div>
          {marque && <p className="text-sm font-semibold text-primaire-clair">{marque.nom}</p>}
          <h1 className="mt-1 font-titres text-2xl font-bold text-texte-principal md:text-3xl">{produit.nom}</h1>
          {produit.ref && <p className="mt-1 text-sm text-texte-secondaire">Réf. {produit.ref}</p>}
          {/* Description générale toujours affichée (catalogue ATC : les variantes n'ont pas de description
              propre) ; une description « points forts » de variante (#29), si elle existe, s'ajoute sous le
              sélecteur dans AchatProduit. */}
          <p className="mt-3 text-texte-secondaire">{produit.description}</p>

          <div className="mt-6">
            <AchatProduit
              produit={produit}
              niveauStock={niveauStock}
              paliers={paliers}
              // Sans ligne de stock = rupture (0) ; stock_actuel null = non suivi (undefined).
              stockActuel={stock ? (stock.stock_actuel ?? undefined) : 0}
              variantes={variantes}
            />
          </div>

          {caracteristiques.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 font-titres text-base font-semibold text-texte-principal">Caractéristiques</h2>
              <ul className="divide-y divide-bordure rounded-lg border border-bordure text-sm text-texte-principal">
                {caracteristiques.map((ligne, i) => (
                  <li key={i} className="px-3 py-2">
                    {ligne}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {produit.specifications && Object.keys(produit.specifications).length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 font-titres text-base font-semibold text-texte-principal">
                Spécifications techniques
              </h2>
              <dl className="divide-y divide-bordure rounded-lg border border-bordure text-sm">
                {Object.entries(produit.specifications).map(([cle, valeur]) => (
                  <div key={cle} className="flex justify-between px-3 py-2">
                    <dt className="capitalize text-texte-secondaire">{cle}</dt>
                    <dd className="font-medium text-texte-principal">{valeur}</dd>
                  </div>
                ))}
                {garantie && (
                  <div className="flex justify-between px-3 py-2">
                    <dt className="text-texte-secondaire">Garantie</dt>
                    <dd className="font-medium text-texte-principal">{garantie.duree_mois} mois</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      </div>

      <AvisProduit produitId={produit.id} />

      <ProduitsAssocies produits={produitsAssocies} />
    </main>
  );
}
