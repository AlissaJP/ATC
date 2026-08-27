import { produits } from "@/lib/mock-data/produits";
import { stock } from "@/lib/mock-data/stock";
import { categories } from "@/lib/mock-data/categories";
import { SuiviStock } from "@/components/admin/SuiviStock";
import { GardeRoleAdmin } from "@/components/admin/GardeRoleAdmin";

// Raffinement Design — vue d'ensemble du stock (back-office, Général uniquement — RG-12-001), distincte
// de Catalogue : 3 paniers par niveau d'alerte (vert/jaune/rouge), tous produits des 3 catégories
// confondus. Lecture seule — l'édition du stock reste dans Catalogue (par produit sélectionné).
export default function AdminStockPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <h1 className="mb-2 font-titres text-2xl font-bold text-texte-principal">Stock</h1>
      <p className="mb-6 text-sm text-texte-secondaire">
        Vue d&apos;ensemble par niveau d&apos;alerte, tous produits confondus (RG-03-002).
      </p>
      <GardeRoleAdmin rolesAutorises={["general"]}>
        <SuiviStock produits={produits} stock={stock} categories={categories} />
      </GardeRoleAdmin>
    </main>
  );
}
