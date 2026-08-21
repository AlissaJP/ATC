"use client";

// ECR-08-004 — Favoris. BF-08-004.
import Link from "next/link";
import { Heart } from "lucide-react";
import { GardeClient } from "@/components/compte/GardeClient";
import { useComptesStore } from "@/lib/store/comptes-store";
import { ProductCard } from "@/components/product/ProductCard";
import { produits } from "@/lib/mock-data/produits";
import { trouverStockParProduit } from "@/lib/mock-data/stock";
import { paliersParProduit } from "@/lib/mock-data/paliers-prix-b2b";
import { determinerNiveauAlerteStock } from "@/lib/business-rules/stock-alerte";

export default function FavorisPage() {
  const tousLesFavoris = useComptesStore((s) => s.favoris);

  return (
    <GardeClient>
      {(session) => {
        const idsFavoris = new Set(
          tousLesFavoris.filter((f) => f.utilisateur_id === session.utilisateur_id).map((f) => f.produit_id)
        );
        const produitsFavoris = produits
          .filter((p) => idsFavoris.has(p.id))
          .map((produit) => {
            const stock = trouverStockParProduit(produit.id);
            return {
              produit,
              niveauStock: determinerNiveauAlerteStock(stock?.stock_actuel ?? 0, stock?.stock_reference ?? 100),
              paliers: paliersParProduit(produit.id),
            };
          });

        return (
          <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
            <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Mes favoris</h1>

            {produitsFavoris.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-bordure py-16 text-center">
                <Heart size={28} className="text-texte-secondaire" />
                <p className="font-titres text-sm font-semibold text-texte-principal">Aucun favori pour le moment</p>
                <Link href="/" className="text-sm font-medium text-primaire hover:underline">
                  Parcourir le catalogue
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {produitsFavoris.map(({ produit, niveauStock, paliers }) => (
                  <ProductCard key={produit.id} produit={produit} niveauStock={niveauStock} paliers={paliers} />
                ))}
              </div>
            )}
          </main>
        );
      }}
    </GardeClient>
  );
}
