import { produits } from "@/lib/mock-data/produits";
import { trouverStockParProduit } from "@/lib/mock-data/stock";
import { determinerNiveauAlerteStock } from "@/lib/business-rules/stock-alerte";
import { TableauDeBord } from "@/components/admin/TableauDeBord";

// ECR-12-001 — Tableau de bord admin (back-office). Le compteur de produits en alerte de stock est
// calculé côté serveur (catalogue lu depuis lib/mock-data/produits.ts et stock.ts, cf. lib/actions/
// catalogue-admin.ts) ; les autres widgets lisent les stores Zustand côté client (TableauDeBord).
export default function AdminAccueilPage() {
  const produitsEnAlerte = produits.filter((p) => {
    const s = trouverStockParProduit(p.id);
    const niveau = determinerNiveauAlerteStock(s?.stock_actuel ?? 0, s?.stock_reference ?? 100);
    return niveau === "alerte_rouge" || niveau === "rupture";
  }).length;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Tableau de bord</h1>
      <TableauDeBord produitsEnAlerte={produitsEnAlerte} />
    </main>
  );
}
