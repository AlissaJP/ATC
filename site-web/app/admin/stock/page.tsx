import { produits } from "@/lib/mock-data/produits";
import { stock } from "@/lib/mock-data/stock";
import { categories } from "@/lib/mock-data/categories";
import { mouvementsStock } from "@/lib/mock-data/mouvements-stock";
import { SuiviStock } from "@/components/admin/SuiviStock";
import { GardeRoleAdmin } from "@/components/admin/GardeRoleAdmin";

// Raffinement Design — gestion du stock (back-office, Général uniquement — RG-12-001), distincte de
// Catalogue : présentée par catégorie (comme Catalogue, mêmes 3 onglets), avec le statut coloré de
// chaque produit (vert/jaune/rouge, RG-03-002) et l'historique des mouvements de stock (entrées/sorties,
// décision actée n°47) pour une vue globale des transactions. Éditable directement ici (bouton
// "Mouvement" par ligne) — c'est la seule section pour gérer le stock, le Catalogue ne le montre plus
// (cf. GestionCatalogue.tsx).
export default function AdminStockPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <h1 className="mb-2 font-titres text-2xl font-bold text-texte-principal">Stock</h1>
      <p className="mb-6 text-sm text-texte-secondaire">
        Par catégorie, avec statut coloré et historique des entrées/sorties (RG-03-002).
      </p>
      <GardeRoleAdmin rolesAutorises={["general"]}>
        <SuiviStock produits={produits} stock={stock} categories={categories} mouvements={mouvementsStock} />
      </GardeRoleAdmin>
    </main>
  );
}
