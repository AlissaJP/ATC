// ECR-03-001 — Fiche produit. BF-03-001 à BF-03-007, RG-03-001 à RG-03-004, RG-08-001.
import { notFound, redirect } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { GalerieImages } from "@/components/product/GalerieImages";
import { AchatProduit } from "@/components/product/AchatProduit";
import { ProduitsAssocies } from "@/components/product/ProduitsAssocies";
import { AvisProduit } from "@/components/product/AvisProduit";
import { obtenirProduitEnrichiParSlug, listerProduitsEnrichisParIds, listerVariantesProduit } from "@/lib/services/catalogue";
import { obtenirStock } from "@/lib/services/stock";
import { listerCategories } from "@/lib/services/produits";
import { trouverGarantieParCategorie } from "@/lib/mock-data/garanties";

export default async function ProduitPage(props: PageProps<"/produit/[slug]">) {
  const { slug } = await props.params;
  const resultat = await obtenirProduitEnrichiParSlug(slug);

  if (!resultat) notFound();

  const { produit, niveauStock, paliers, marque } = resultat;
  const [stock, categories, produitsAssocies, variantesBrutes] = await Promise.all([
    obtenirStock(produit.id),
    listerCategories(),
    listerProduitsEnrichisParIds(produit.accessoires_compatibles_ids ?? []),
    produit.variante ? listerVariantesProduit(produit.variante.groupe) : Promise.resolve([]),
  ]);

  // Correction #23 — une seule fiche produit publique par groupe de variantes : visiter directement
  // l'URL d'un SKU non canonique (variante.masque) redirige vers le SKU canonique du groupe, qui porte
  // le sélecteur de variante (jamais de fiche produit distincte par valeur de variante).
  if (produit.variante?.masque) {
    const canonique = variantesBrutes.find((v) => !v.produit.variante?.masque);
    if (canonique) redirect(`/produit/${canonique.produit.slug}`);
  }

  // Sélecteur affiché uniquement si au moins 2 valeurs existent réellement pour ce produit.
  const variantes = variantesBrutes.length > 1 ? variantesBrutes : undefined;

  // Stock exact par variante (au-delà du simple niveau d'alerte déjà présent dans variantes) pour borner
  // le sélecteur de quantité une fois une valeur choisie sur la fiche canonique.
  const stocksVariantes = Object.fromEntries(
    await Promise.all(
      variantesBrutes.map(async (v) => [v.produit.id, (await obtenirStock(v.produit.id))?.stock_actuel ?? 0] as const)
    )
  );

  const categorie = categories.find((c) => c.id === produit.categorie_id);
  const categorieParente = categorie?.parent_id ? categories.find((c) => c.id === categorie.parent_id) : undefined;
  const garantie = trouverGarantieParCategorie(produit.categorie_id);

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
        <GalerieImages images={produit.images} alt={produit.nom} />

        <div>
          {marque && <p className="text-sm font-semibold text-primaire-clair">{marque.nom}</p>}
          <h1 className="mt-1 font-titres text-2xl font-bold text-texte-principal md:text-3xl">{produit.nom}</h1>
          {/* Variante (#23) : la description « points forts » dédiée à la valeur choisie est affichée
              dans AchatProduit, juste sous le sélecteur, et se met à jour dynamiquement — pas de
              paragraphe statique redondant ici dans ce cas. */}
          {!variantes && <p className="mt-3 text-texte-secondaire">{produit.description}</p>}

          <div className="mt-6">
            <AchatProduit
              produit={produit}
              niveauStock={niveauStock}
              paliers={paliers}
              stockActuel={stock?.stock_actuel ?? 0}
              variantes={variantes}
              stocksVariantes={stocksVariantes}
            />
          </div>

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
