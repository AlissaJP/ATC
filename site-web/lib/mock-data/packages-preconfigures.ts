// ECR-04-001 — Catalogue de packages solaires pré-configurés. BF-04-001.
import type { PackagePreconfigure } from "@/lib/types/entities";
import { produits } from "./produits";

function prixPackage(composition: { produit_id: string; quantite: number }[]): number {
  return composition.reduce((total, c) => {
    const produit = produits.find((p) => p.id === c.produit_id);
    return total + (produit?.prix_public ?? 0) * c.quantite;
  }, 0);
}

const compositionSecours = [
  { produit_id: "prod-panneau-405w", quantite: 2 },
  { produit_id: "prod-batterie-gel-200ah", quantite: 1 },
  { produit_id: "prod-regulateur-mppt-60a", quantite: 1 },
  { produit_id: "prod-kit-cables-mc4", quantite: 1 },
];

const compositionResidentiel = [
  { produit_id: "prod-panneau-405w", quantite: 6 },
  { produit_id: "prod-batterie-lithium-100ah", quantite: 2 },
  { produit_id: "prod-onduleur-hybride-5kva", quantite: 1 },
  { produit_id: "prod-structure-montage", quantite: 6 },
  { produit_id: "prod-kit-cables-mc4", quantite: 1 },
];

const compositionCommercial = [
  { produit_id: "prod-panneau-550w", quantite: 14 },
  { produit_id: "prod-batterie-lithium-100ah", quantite: 4 },
  { produit_id: "prod-onduleur-hybride-5kva", quantite: 2 },
  { produit_id: "prod-structure-montage", quantite: 14 },
  { produit_id: "prod-kit-mise-a-la-terre", quantite: 1 },
];

export const packagesPreconfigures: PackagePreconfigure[] = [
  {
    id: "package-secours-1kw",
    slug: "kit-solaire-secours-1kw",
    nom: "Kit solaire de secours 1 kW",
    description:
      "Une solution d'appoint pour maintenir l'essentiel (éclairage, routeur, réfrigérateur) actif pendant une coupure.",
    produits: compositionSecours,
    prix_total: prixPackage(compositionSecours),
    image: "/images/energie-solaire/energie-14.webp",
  },
  {
    id: "package-residentiel-3kw",
    slug: "kit-solaire-residentiel-3kw",
    nom: "Kit solaire résidentiel 3 kW",
    description:
      "Système complet pour une maison familiale : panneaux, batteries lithium et onduleur hybride avec basculement automatique.",
    produits: compositionResidentiel,
    prix_total: prixPackage(compositionResidentiel),
    image: "/images/energie-solaire/energie-17.webp",
  },
  {
    id: "package-commercial-7kw",
    slug: "kit-solaire-commercial-7kw",
    nom: "Kit solaire commercial 7 kW",
    description:
      "Dimensionné pour un commerce ou un petit bureau : forte capacité de production et de stockage, structure de montage incluse.",
    produits: compositionCommercial,
    prix_total: prixPackage(compositionCommercial),
    image: "/images/energie-solaire/energie-16.webp",
  },
];

export function trouverPackageParSlug(slug: string): PackagePreconfigure | undefined {
  return packagesPreconfigures.find((p) => p.slug === slug);
}

// --- BF-12-003 (Must have) : création/édition des packages pré-configurés depuis le back-office ---
// Gap identifié lors de l'audit qualité (seul le traitement des demandes personnalisées — ECR-04-004 —
// était construit). Mutation en place (voir lib/mock-data/produits.ts) ; invoquée uniquement depuis
// lib/actions/catalogue-admin.ts. prix_total est toujours recalculé côté serveur à partir de la
// composition et des prix publics actuels — jamais saisi directement, pour rester cohérent avec les
// prix affichés ailleurs sur le site.
export interface PackageInputMock {
  nom: string;
  description: string;
  image: string;
  produits: { produit_id: string; quantite: number }[];
}

function genererSlugPackage(nom: string): string {
  const base =
    nom
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "package";
  let slug = base;
  let compteur = 1;
  while (packagesPreconfigures.some((p) => p.slug === slug)) {
    compteur += 1;
    slug = `${base}-${compteur}`;
  }
  return slug;
}

let compteurPackageId = 0;
function genererIdPackage(): string {
  compteurPackageId += 1;
  return `package-admin-${Date.now()}-${compteurPackageId}`;
}

export function creerPackageMock(input: PackageInputMock): PackagePreconfigure {
  const pack: PackagePreconfigure = {
    id: genererIdPackage(),
    slug: genererSlugPackage(input.nom),
    nom: input.nom,
    description: input.description,
    image: input.image,
    produits: input.produits,
    prix_total: prixPackage(input.produits),
  };
  packagesPreconfigures.push(pack);
  return pack;
}

export function modifierPackageMock(id: string, patch: Partial<PackageInputMock>): PackagePreconfigure | undefined {
  const index = packagesPreconfigures.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  const actuel = packagesPreconfigures[index];
  const produitsMaj = patch.produits ?? actuel.produits;
  const maj: PackagePreconfigure = {
    ...actuel,
    ...patch,
    produits: produitsMaj,
    prix_total: prixPackage(produitsMaj),
  };
  packagesPreconfigures.splice(index, 1, maj);
  return maj;
}

export function supprimerPackageMock(id: string): boolean {
  const index = packagesPreconfigures.findIndex((p) => p.id === id);
  if (index === -1) return false;
  packagesPreconfigures.splice(index, 1);
  return true;
}
