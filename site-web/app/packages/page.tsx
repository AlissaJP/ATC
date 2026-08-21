// ECR-04-001 — Catalogue de packages solaires pré-configurés. BF-04-001.
import Image from "next/image";
import Link from "next/link";
import { PackageCheck } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { listerPackages, packageEstDisponible } from "@/lib/services/packages";

export default async function PackagesPage() {
  const packages = await listerPackages();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
      <Breadcrumb items={[{ label: "Packages solaires" }]} />
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-titres text-2xl font-bold text-texte-principal md:text-3xl">
            Packages solaires pré-configurés
          </h1>
          <p className="mt-1 text-texte-secondaire">
            Une solution complète à prix tout compris, prête à ajouter au panier.
          </p>
        </div>
        <Link
          href="/packages/configurateur"
          className="inline-flex w-fit items-center gap-2 rounded-lg border-2 border-primaire px-4 py-2.5 text-sm font-semibold text-primaire transition-colors hover:bg-primaire/5"
        >
          Composer un package sur-mesure
        </Link>
      </div>

      {packages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-bordure py-16 text-center">
          <p className="font-titres text-sm font-semibold text-texte-principal">
            Aucun package disponible pour le moment
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => {
            const disponible = packageEstDisponible(pkg);
            return (
              <Link
                key={pkg.id}
                href={`/packages/${pkg.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-bordure bg-background transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-fond">
                  {pkg.image ? (
                    <Image
                      src={pkg.image}
                      alt={pkg.nom}
                      fill
                      className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-texte-secondaire">
                      Image à venir
                    </div>
                  )}
                  {disponible && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-[11px] font-semibold text-succes shadow-sm">
                      <PackageCheck size={12} /> Disponible
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h2 className="font-titres text-base font-semibold text-texte-principal">{pkg.nom}</h2>
                  <p className="text-sm text-texte-secondaire">{pkg.description}</p>
                  <p className="mt-auto pt-2 font-titres text-lg font-bold text-primaire">
                    ${pkg.prix_total.toFixed(2)} <span className="text-sm font-normal text-texte-secondaire">tout compris</span>
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
