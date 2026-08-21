import { ProductCard } from "./ProductCard";
import type { ProduitEnrichi } from "@/lib/services/catalogue";

// BF-03-006 — Produits associés / accessoires compatibles (association saisie manuellement — RG-03-003).
export function ProduitsAssocies({ produits }: { produits: ProduitEnrichi[] }) {
  if (produits.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-4 font-titres text-xl font-bold text-texte-principal">
        Produits associés &amp; accessoires compatibles
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {produits.map(({ produit, niveauStock, paliers }) => (
          <ProductCard key={produit.id} produit={produit} niveauStock={niveauStock} paliers={paliers} />
        ))}
      </div>
    </section>
  );
}
