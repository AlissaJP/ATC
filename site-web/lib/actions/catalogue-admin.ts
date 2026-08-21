"use server";

// ECR-12-002 — Gestion catalogue / stock / barème B2B (back-office, Phase 6). RG-03-002, RG-03-004.
//
// Note d'architecture (à ne pas re-questionner à chaque lecture) : cette démo n'a pas de session serveur —
// le rôle admin (Général / Agent SAV, RG-12-001) vit uniquement dans lib/store/session-store.ts, un store
// Zustand côté client (décision actée n°41 : sandbox sans backend réel). Il n'existe donc aucun mécanisme
// équivalent à `auth()` côté serveur pour vérifier le rôle avant mutation ici. L'autorisation par rôle est
// appliquée uniquement côté UI (composants/pages qui masquent ou désactivent ces actions pour l'Agent SAV) —
// cohérent avec le reste de la démo, mais à refaire correctement (vraie session serveur) le jour d'un
// backend réel.
//
// Les tableaux mock-data (produits/stock/paliersPrixB2B) sont mutés en place (push/splice) pour que les
// Server Components vitrine (accueil, catégories, fiches produit, recherche, packages) voient la donnée
// à jour dès la prochaine requête serveur. revalidatePath invalide le cache de rendu Next.js pour que ce
// soit également vrai sans redémarrage du serveur de dev.
import { revalidatePath } from "next/cache";
import {
  creerProduitMock,
  modifierProduitMock,
  supprimerProduitMock,
  type ProduitInputMock,
} from "@/lib/mock-data/produits";
import { definirStockMock, supprimerStockMock } from "@/lib/mock-data/stock";
import {
  ajouterPalierMock,
  ajouterPaliersMock,
  genererPaliersParDefaut,
  paliersParProduit,
  supprimerPalierMock,
  supprimerPaliersDuProduitMock,
  type PalierInputMock,
} from "@/lib/mock-data/paliers-prix-b2b";
import { detecterChevauchementsPaliers } from "@/lib/business-rules/bareme-b2b";
import {
  creerPackageMock,
  modifierPackageMock,
  supprimerPackageMock,
  type PackageInputMock,
} from "@/lib/mock-data/packages-preconfigures";

export interface ActionResult<T = undefined> {
  succes: boolean;
  erreur?: string;
  donnees?: T;
}

function revaliderCatalogue() {
  // Catalogue de taille modeste (démo) : une invalidation globale par layout racine suffit à couvrir
  // toutes les pages vitrine sans avoir à énumérer chaque route de catégorie/produit.
  revalidatePath("/", "layout");
}

export async function creerProduitAction(
  input: ProduitInputMock
): Promise<ActionResult<{ id: string }>> {
  if (!input.nom.trim() || !input.categorie_id || !(input.prix_public > 0)) {
    return { succes: false, erreur: "Nom, catégorie et prix public (supérieur à 0) sont obligatoires." };
  }

  const produit = creerProduitMock(input);
  definirStockMock(produit.id, 0, 100); // RG-03-002 — stock_reference par défaut 100 (décision n°28)
  if (produit.eligible_b2b) {
    ajouterPaliersMock(genererPaliersParDefaut(produit.id, produit.prix_public));
  }

  revaliderCatalogue();
  return { succes: true, donnees: { id: produit.id } };
}

export async function modifierProduitAction(
  id: string,
  patch: Partial<ProduitInputMock>
): Promise<ActionResult> {
  if (patch.prix_public !== undefined && !(patch.prix_public > 0)) {
    return { succes: false, erreur: "Le prix public doit être supérieur à 0." };
  }

  const produit = modifierProduitMock(id, patch);
  if (!produit) return { succes: false, erreur: "Produit introuvable." };

  // Un produit qui devient éligible B2B et n'a encore aucun palier reçoit le barème par défaut,
  // comme à la création (sinon un configurateur/devis B2B ne trouverait aucun prix applicable).
  if (produit.eligible_b2b && paliersParProduit(id).length === 0) {
    ajouterPaliersMock(genererPaliersParDefaut(id, produit.prix_public));
  }

  revaliderCatalogue();
  return { succes: true };
}

export async function supprimerProduitAction(id: string): Promise<ActionResult> {
  supprimerStockMock(id);
  supprimerPaliersDuProduitMock(id);
  const ok = supprimerProduitMock(id);
  if (!ok) return { succes: false, erreur: "Produit introuvable." };

  revaliderCatalogue();
  return { succes: true };
}

export async function definirStockAction(
  produitId: string,
  stockActuel: number,
  stockReference: number
): Promise<ActionResult> {
  if (stockActuel < 0 || !(stockReference > 0)) {
    return { succes: false, erreur: "Stock actuel ≥ 0 et stock de référence > 0 requis." };
  }

  definirStockMock(produitId, stockActuel, stockReference);
  revaliderCatalogue();
  return { succes: true };
}

export async function ajouterPalierAction(input: PalierInputMock): Promise<ActionResult> {
  if (
    input.quantite_min < 1 ||
    (input.quantite_max !== undefined && input.quantite_max < input.quantite_min) ||
    !(input.prix_unitaire > 0)
  ) {
    return { succes: false, erreur: "Plage de quantité ou prix unitaire invalide." };
  }

  // Détection de chevauchement (Cahier 9, section 6 / UC-12-001 E1) avant insertion.
  const provisoire = { id: "provisoire", ...input };
  const conflits = detecterChevauchementsPaliers([...paliersParProduit(input.produit_id), provisoire]);
  if (conflits.length > 0) {
    return { succes: false, erreur: "Ce palier chevauche un palier existant pour ce produit." };
  }

  ajouterPalierMock(input);
  revaliderCatalogue();
  return { succes: true };
}

export async function supprimerPalierAction(id: string): Promise<ActionResult> {
  const ok = supprimerPalierMock(id);
  if (!ok) return { succes: false, erreur: "Palier introuvable." };

  revaliderCatalogue();
  return { succes: true };
}

// --- BF-12-003 : création/édition des packages pré-configurés ---
export async function creerPackageAction(input: PackageInputMock): Promise<ActionResult<{ id: string }>> {
  if (!input.nom.trim() || input.produits.length === 0) {
    return { succes: false, erreur: "Nom et au moins un produit dans la composition sont obligatoires." };
  }
  const pack = creerPackageMock(input);
  revaliderCatalogue();
  return { succes: true, donnees: { id: pack.id } };
}

export async function modifierPackageAction(id: string, patch: Partial<PackageInputMock>): Promise<ActionResult> {
  if (patch.produits !== undefined && patch.produits.length === 0) {
    return { succes: false, erreur: "La composition doit contenir au moins un produit." };
  }
  const pack = modifierPackageMock(id, patch);
  if (!pack) return { succes: false, erreur: "Package introuvable." };
  revaliderCatalogue();
  return { succes: true };
}

export async function supprimerPackageAction(id: string): Promise<ActionResult> {
  const ok = supprimerPackageMock(id);
  if (!ok) return { succes: false, erreur: "Package introuvable." };
  revaliderCatalogue();
  return { succes: true };
}
