"use server";

// Raffinement Design — enregistrement des mouvements de stock (entrées/sorties, décision actée n°47).
// Même note d'architecture que lib/actions/catalogue-admin.ts : pas de session serveur réelle dans cette
// démo (décision actée n°41), autorisation par rôle appliquée uniquement côté UI.
import { revalidatePath } from "next/cache";
import { produits, definirStockVarianteMock } from "@/lib/mock-data/produits";
import { definirStockMock, trouverStockParProduit } from "@/lib/mock-data/stock";
import { enregistrerMouvementMock } from "@/lib/mock-data/mouvements-stock";
import type { TypeMouvementStock } from "@/lib/types/entities";

export interface ActionResult<T = undefined> {
  succes: boolean;
  erreur?: string;
  donnees?: T;
}

export interface MouvementStockInput {
  produitId: string;
  varianteId?: string;
  type: TypeMouvementStock;
  quantite: number;
  date: string; // ISO
  reference?: string;
}

// RG-03-002 — le stock d'un produit sans variantes vit dans lib/mock-data/stock.ts (stock_actuel), celui
// d'une variante (point #29) directement sur Produit.variantes[].stock : ce mouvement met à jour la
// bonne source selon le cas, puis journalise la transaction pour la vue globale de SuiviStock.tsx.
export async function enregistrerMouvementStockAction(input: MouvementStockInput): Promise<ActionResult> {
  if (!(input.quantite > 0)) {
    return { succes: false, erreur: "La quantité doit être supérieure à 0." };
  }

  const produit = produits.find((p) => p.id === input.produitId);
  if (!produit) return { succes: false, erreur: "Produit introuvable." };

  if (input.varianteId) {
    const variante = produit.variantes?.find((v) => v.id === input.varianteId);
    if (!variante) return { succes: false, erreur: "Variante introuvable." };
    const actuel = variante.stock ?? 0;
    const nouveau = input.type === "entree" ? actuel + input.quantite : actuel - input.quantite;
    if (nouveau < 0) return { succes: false, erreur: "Stock insuffisant pour cette sortie." };
    definirStockVarianteMock(input.produitId, input.varianteId, nouveau);
  } else {
    const stock = trouverStockParProduit(input.produitId);
    const actuel = stock?.stock_actuel ?? 0;
    const reference = stock?.stock_reference ?? 100; // décision actée n°28
    const nouveau = input.type === "entree" ? actuel + input.quantite : actuel - input.quantite;
    if (nouveau < 0) return { succes: false, erreur: "Stock insuffisant pour cette sortie." };
    definirStockMock(input.produitId, nouveau, reference);
  }

  enregistrerMouvementMock({
    produit_id: input.produitId,
    variante_id: input.varianteId,
    type: input.type,
    quantite: input.quantite,
    date: input.date,
    reference: input.reference,
  });

  revalidatePath("/", "layout");
  return { succes: true };
}
