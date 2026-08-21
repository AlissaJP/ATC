import { produits } from "@/lib/mock-data/produits";
import { stock } from "@/lib/mock-data/stock";
import { paliersPrixB2B } from "@/lib/mock-data/paliers-prix-b2b";
import { categories } from "@/lib/mock-data/categories";
import { marques } from "@/lib/mock-data/marques";
import { GestionCatalogue } from "@/components/admin/GestionCatalogue";
import { GardeRoleAdmin } from "@/components/admin/GardeRoleAdmin";

// ECR-12-002 — Gestion catalogue / stock / barème B2B (back-office, Général uniquement — RG-12-001).
// Server Component : lit les tableaux mock-data côté serveur à chaque requête, pour que les mutations
// admin (lib/actions/catalogue-admin.ts) restent visibles sans redémarrage du serveur de dev.
export default function AdminCataloguePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Catalogue</h1>
      <GardeRoleAdmin rolesAutorises={["general"]}>
        <GestionCatalogue
          produits={produits}
          stock={stock}
          paliers={paliersPrixB2B}
          categories={categories}
          marques={marques}
        />
      </GardeRoleAdmin>
    </main>
  );
}
