// ECR-04-001 (détail) — Composition et disponibilité d'un package pré-configuré.
// Intégration du catalogue ATC (étape 7) : les packages PK-01 à PK-07 sont des propositions sans
// composition définitive ni prix — « Prix sur demande », bouton « Demander un prix » (WhatsApp) à la place
// de l'ajout au panier, composition proposée affichée depuis leurs caractéristiques. Un package composé
// depuis l'admin (composition + prix) garde le parcours d'achat direct inchangé.
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { AjouterPackageBouton } from "@/components/packages/AjouterPackageBouton";
import { BoutonDemanderPrix } from "@/components/product/BoutonDemanderPrix";
import { ImageCatalogue, estPhotoProduit } from "@/components/ui/ImageCatalogue";
import { obtenirPackageParSlug, packageEstDisponible, compositionDetaillee } from "@/lib/services/packages";
import { listerCaracteristiques } from "@/lib/services/caracteristiques";
import { formaterPrix } from "@/lib/services/prix";

export default async function PackageDetailPage(props: PageProps<"/packages/[slug]">) {
  const { slug } = await props.params;
  const pkg = await obtenirPackageParSlug(slug);

  if (!pkg) notFound();

  const disponible = packageEstDisponible(pkg);
  const composition = compositionDetaillee(pkg);
  const caracteristiques = listerCaracteristiques(pkg.caracteristiques);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <Breadcrumb items={[{ label: "Packages solaires", href: "/packages" }, { label: pkg.nom }]} />

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Même règle que la fiche produit (GalerieImages) : photo carrée entière sur fond blanc, bannière
            à son format 2:1 sans recadrage carré. */}
        <div
          className={`relative w-full self-start overflow-hidden rounded-xl ${
            !pkg.image || estPhotoProduit(pkg.image) ? "aspect-square border border-bordure bg-white" : "aspect-[2/1] bg-fond"
          }`}
        >
          {pkg.image ? (
            <ImageCatalogue src={pkg.image} alt={pkg.nom} preload sizes="(max-width: 1024px) 100vw, 50vw" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-texte-secondaire">
              Image à venir
            </div>
          )}
        </div>

        <div>
          <h1 className="font-titres text-2xl font-bold text-texte-principal md:text-3xl">{pkg.nom}</h1>
          {pkg.ref && <p className="mt-1 text-sm text-texte-secondaire">Réf. {pkg.ref}</p>}
          <p className="mt-3 text-texte-secondaire">{pkg.description}</p>

          <p className="mt-6 font-titres text-3xl font-bold text-primaire">
            {formaterPrix(pkg.prix_total)}
            {pkg.prix_total !== null && <span className="text-base font-normal text-texte-secondaire"> tout compris</span>}
          </p>
          {/* Composition vide = package proposé, pas encore composé : rien à déclarer en rupture. */}
          {!disponible && pkg.produits.length > 0 && (
            <p className="mt-2 text-sm font-medium text-danger">
              Un ou plusieurs composants sont actuellement en rupture de stock.
            </p>
          )}

          <div className="mt-6 flex">
            {pkg.prix_total === null ? (
              <BoutonDemanderPrix type="package" reference={pkg.ref} nom={pkg.nom} />
            ) : (
              <AjouterPackageBouton lignes={composition} disponible={disponible} />
            )}
          </div>

          {caracteristiques.length > 0 && (
            <>
              <h2 className="mt-8 mb-3 font-titres text-base font-semibold text-texte-principal">Caractéristiques</h2>
              <ul className="divide-y divide-bordure rounded-lg border border-bordure text-sm text-texte-principal">
                {caracteristiques.map((ligne, i) => (
                  <li key={i} className="px-3 py-2.5">
                    {ligne}
                  </li>
                ))}
              </ul>
            </>
          )}

          {composition.length > 0 && (
            <>
              <h2 className="mt-8 mb-3 font-titres text-base font-semibold text-texte-principal">Composition</h2>
              <ul className="divide-y divide-bordure rounded-lg border border-bordure text-sm">
                {composition.map(({ produit, quantite }) => (
                  <li key={produit.id} className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-texte-principal">{produit.nom}</span>
                    <span className="text-texte-secondaire">× {quantite}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
