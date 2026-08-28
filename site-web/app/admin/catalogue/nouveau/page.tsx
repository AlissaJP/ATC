import { categories } from "@/lib/mock-data/categories";
import { marques } from "@/lib/mock-data/marques";
import { CreationProduit } from "@/components/admin/CreationProduit";
import { GardeRoleAdmin } from "@/components/admin/GardeRoleAdmin";

// ECR-12-002 — Page dédiée à la création d'un produit (Général uniquement — RG-12-001), distincte de la
// fenêtre modale d'édition (GestionCatalogue.tsx, Raffinement Design).
//
// `categorie` (slug) : reçu du bouton "Nouveau produit" cliqué depuis un onglet donné, pour présélectionner
// la catégorie du formulaire. Résolu ici (id de la catégorie racine) plutôt que dans CreationProduit.tsx
// pour ne pas dupliquer l'accès à `categories` côté client.
export default async function AdminNouveauProduitPage(props: PageProps<"/admin/catalogue/nouveau">) {
  const { categorie } = await props.searchParams;
  const slug = typeof categorie === "string" ? categorie : undefined;
  const categorieInitiale = slug ? categories.find((c) => c.slug === slug)?.id : undefined;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Nouveau produit</h1>
      <GardeRoleAdmin rolesAutorises={["general"]}>
        <CreationProduit categories={categories} marques={marques} categorieInitiale={categorieInitiale} />
      </GardeRoleAdmin>
    </main>
  );
}
