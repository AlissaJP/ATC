// Couche d'accès aux données — packages solaires pré-configurés. ECR-04-001.
import { packagesPreconfigures, trouverPackageParSlug } from "@/lib/mock-data/packages-preconfigures";
import { quantiteDisponible } from "@/lib/mock-data/stock";
import { produits } from "@/lib/mock-data/produits";
import type { PackagePreconfigure, Produit } from "@/lib/types/entities";

// RG-03-002 — un package n'est proposé à l'achat direct que si tous ses composants sont en stock
// (stock non suivi = disponible) et ont un prix (un composant « Prix sur demande » ne peut pas aller au panier).
// Une composition vide (package proposé, à valider par le client) n'est jamais achetable directement.
export function packageEstDisponible(pkg: PackagePreconfigure): boolean {
  return pkg.produits.length > 0 && pkg.produits.every((c) => {
    const produit = produits.find((p) => p.id === c.produit_id);
    const quantite = quantiteDisponible(c.produit_id);
    return !!produit?.prix_disponible && (quantite === undefined || quantite > 0);
  });
}

export async function listerPackages(): Promise<PackagePreconfigure[]> {
  return packagesPreconfigures;
}

export async function obtenirPackageParSlug(slug: string): Promise<PackagePreconfigure | undefined> {
  return trouverPackageParSlug(slug);
}

export interface LigneCompositionPackage {
  produit: Produit;
  quantite: number;
}

export function compositionDetaillee(pkg: PackagePreconfigure): LigneCompositionPackage[] {
  return pkg.produits
    .map((c) => {
      const produit = produits.find((p) => p.id === c.produit_id);
      return produit ? { produit, quantite: c.quantite } : undefined;
    })
    .filter((l): l is LigneCompositionPackage => Boolean(l));
}
