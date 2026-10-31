// ECR-01-002 — Page catégorie / liste produits. BF-01-001, BF-01-003, BF-02-002/003/004, RG-03-001/002/004.
// Intégration du catalogue ATC (étape 6) : bannière d'en-tête de la catégorie racine et onglets par
// sous-catégorie. Les onglets sont des liens vers les pages de sous-catégorie existantes (même route,
// URL partageable) : la pagination de CatalogueBrowser reste inchangée et repart de la page 1.
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CatalogueBrowser } from "@/components/product/CatalogueBrowser";
import { BanniereEnTete } from "@/components/ui/BanniereEnTete";
import { listerCategories, listerProduitsParCategorieSlug } from "@/lib/services/produits";
import { listerProduitsEnrichis } from "@/lib/services/catalogue";

export default async function CategoriePage(props: PageProps<"/categorie/[slug]">) {
  const { slug } = await props.params;
  const categories = await listerCategories();
  const categorie = categories.find((c) => c.slug === slug);

  if (!categorie) notFound();

  const categorieParente = categorie.parent_id
    ? categories.find((c) => c.id === categorie.parent_id)
    : undefined;
  const racine = categorieParente ?? categorie;

  const produits = await listerProduitsEnrichis(slug);

  // Onglets : « Tous » (catégorie racine) puis chaque sous-catégorie, avec son nombre de produits.
  // Masqués s'il n'y a qu'une sous-catégorie (Sécurité : Caméras) — l'onglet n'apporterait rien.
  const sousCategories = categories.filter((c) => c.parent_id === racine.id);
  const onglets =
    sousCategories.length > 1
      ? await Promise.all(
          [{ slug: racine.slug, nom: "Tous" }, ...sousCategories].map(async (o) => ({
            ...o,
            nombre: (await listerProduitsParCategorieSlug(o.slug)).length,
          }))
        )
      : [];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
      <Breadcrumb
        items={[
          ...(categorieParente
            ? [{ label: categorieParente.nom, href: `/categorie/${categorieParente.slug}` }]
            : []),
          { label: categorie.nom },
        ]}
      />

      <div className="mb-6 grid items-center gap-6 md:grid-cols-2">
        <div>
          {categorieParente && (
            <p className="font-titres text-sm font-semibold uppercase tracking-wide text-accent">
              {categorieParente.nom}
            </p>
          )}
          <h1 className="font-titres text-2xl font-bold text-texte-principal md:text-3xl">
            {produits.length} produit{produits.length !== 1 ? "s" : ""} dans {categorie.nom}
          </h1>
        </div>
        {racine.image_banniere && <BanniereEnTete src={racine.image_banniere} alt={racine.nom} />}
      </div>

      {onglets.length > 0 && (
        <nav aria-label={`Sous-catégories : ${racine.nom}`} className="-mx-4 mb-6 overflow-x-auto px-4 md:mx-0 md:px-0">
          <ul className="flex w-max gap-2">
            {onglets.map((o) => {
              const actif = o.slug === categorie.slug;
              return (
                <li key={o.slug}>
                  <Link
                    href={`/categorie/${o.slug}`}
                    aria-current={actif ? "page" : undefined}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      actif
                        ? "border-primaire bg-primaire text-white"
                        : "border-bordure text-texte-principal hover:border-primaire hover:text-primaire"
                    }`}
                  >
                    {o.nom}
                    <span className={actif ? "text-white/80" : "text-texte-secondaire"}>({o.nombre})</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <Suspense fallback={null}>
        {/* key : filtres et tri repartent à zéro à chaque changement d'onglet (même route, autre slug). */}
        <CatalogueBrowser key={slug} produits={produits} />
      </Suspense>
    </main>
  );
}
