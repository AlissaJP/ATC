// ECR-04-001 — Catalogue de packages solaires pré-configurés. BF-04-001.
// Intégration du catalogue ATC (étape 4) : les 3 kits de démonstration sont remplacés par les 7 packages
// du catalogue client (PK-01 à PK-07, catalogue-atc.json). Ce sont des propositions à faire valider par le
// client : sans composition définitive ni prix, donc composition vide et « Prix sur demande ».
import type { PackagePreconfigure } from "@/lib/types/entities";
import { entreesCatalogueAtc, produits, slugifier } from "./produits";

// null dès qu'un total « tout compris » serait faux : composition vide ou composant sans prix.
function prixPackage(composition: { produit_id: string; quantite: number }[]): number | null {
  if (composition.length === 0) return null;
  let total = 0;
  for (const c of composition) {
    const prix = produits.find((p) => p.id === c.produit_id)?.prix_public ?? null;
    if (prix === null) return null;
    total += prix * c.quantite;
  }
  return total;
}

export const packagesPreconfigures: PackagePreconfigure[] = entreesCatalogueAtc
  .filter((e) => e.categorie === "packages-solaires")
  .map((e) => {
    const image = e.image ?? e.imageBanniere;
    if (!image) throw new Error(`Catalogue ATC — ${e.ref} : package sans image.`);
    if (e.prixDisponible) throw new Error(`Catalogue ATC — ${e.ref} : un package avec prix demande une composition.`);
    return {
      id: e.ref,
      ref: e.ref,
      slug: slugifier(e.nom),
      nom: e.nom,
      description: e.description,
      caracteristiques: e.caracteristiques,
      produits: [],
      prix_total: null,
      image,
    };
  });

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
