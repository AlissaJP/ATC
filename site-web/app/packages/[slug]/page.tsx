// ECR-04-001 (détail) — Composition et disponibilité d'un package pré-configuré.
import { notFound } from "next/navigation";
import Image from "next/image";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { AjouterPackageBouton } from "@/components/packages/AjouterPackageBouton";
import { obtenirPackageParSlug, packageEstDisponible, compositionDetaillee } from "@/lib/services/packages";

export default async function PackageDetailPage(props: PageProps<"/packages/[slug]">) {
  const { slug } = await props.params;
  const pkg = await obtenirPackageParSlug(slug);

  if (!pkg) notFound();

  const disponible = packageEstDisponible(pkg);
  const composition = compositionDetaillee(pkg);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <Breadcrumb items={[{ label: "Packages solaires", href: "/packages" }, { label: pkg.nom }]} />

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-fond">
          {pkg.image ? (
            <Image src={pkg.image} alt={pkg.nom} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-texte-secondaire">
              Image à venir
            </div>
          )}
        </div>

        <div>
          <h1 className="font-titres text-2xl font-bold text-texte-principal md:text-3xl">{pkg.nom}</h1>
          <p className="mt-3 text-texte-secondaire">{pkg.description}</p>

          <p className="mt-6 font-titres text-3xl font-bold text-primaire">
            ${pkg.prix_total.toFixed(2)} <span className="text-base font-normal text-texte-secondaire">tout compris</span>
          </p>
          {!disponible && (
            <p className="mt-2 text-sm font-medium text-danger">
              Un ou plusieurs composants sont actuellement en rupture de stock.
            </p>
          )}

          <div className="mt-6">
            <AjouterPackageBouton lignes={composition} disponible={disponible} />
          </div>

          <h2 className="mt-8 mb-3 font-titres text-base font-semibold text-texte-principal">Composition</h2>
          <ul className="divide-y divide-bordure rounded-lg border border-bordure text-sm">
            {composition.map(({ produit, quantite }) => (
              <li key={produit.id} className="flex items-center justify-between px-3 py-2.5">
                <span className="text-texte-principal">{produit.nom}</span>
                <span className="text-texte-secondaire">× {quantite}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
