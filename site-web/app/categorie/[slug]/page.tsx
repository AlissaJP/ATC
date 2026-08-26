// ECR-01-002 — Page catégorie / liste produits. BF-01-001, BF-01-003, BF-02-002/003/004, RG-03-001/002/004.
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CatalogueBrowser } from "@/components/product/CatalogueBrowser";
import { listerCategories } from "@/lib/services/produits";
import { listerProduitsEnrichis } from "@/lib/services/catalogue";

export default async function CategoriePage(props: PageProps<"/categorie/[slug]">) {
  const { slug } = await props.params;
  const categories = await listerCategories();
  const categorie = categories.find((c) => c.slug === slug);

  if (!categorie) notFound();

  const categorieParente = categorie.parent_id
    ? categories.find((c) => c.id === categorie.parent_id)
    : undefined;

  const produits = await listerProduitsEnrichis(slug);

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
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal md:text-3xl">
        {produits.length} produit{produits.length !== 1 ? "s" : ""} dans {categorie.nom}
      </h1>
      <Suspense fallback={null}>
        <CatalogueBrowser produits={produits} />
      </Suspense>
    </main>
  );
}
