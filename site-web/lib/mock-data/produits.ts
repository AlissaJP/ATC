// Catalogue produit ATC — vrai catalogue client (intégration du catalogue ATC, étape 4), en remplacement
// des produits fictifs de démonstration. Source de vérité : catalogue-atc.json (copie du
// catalogue-data.json fourni par le client, prix en USD), converti ici vers le type Produit — même rôle
// qu'un futur import vers les tables PostgreSQL `products` / `product_variants`. Pour mettre à jour un prix,
// une description ou une photo : remplacer catalogue-atc.json, pas ce code. Les 7 packages
// (categorie "packages-solaires") sont convertis dans packages-preconfigures.ts. BF-03-001 à BF-03-007.
import type { Produit, StatutPublicationProduit, VarianteProduit } from "@/lib/types/entities";
import catalogueAtc from "./catalogue-atc.json";

export interface VarianteCatalogueAtc {
  id: string;
  attribut: string | null; // null = produit à prix unique (pas de sélecteur)
  valeur: string | null;
  prixUSD: number;
  stock: number | null;
}

export interface EntreeCatalogueAtc {
  ref: string;
  categorie: string;
  sousCategorie: string;
  nom: string;
  description: string;
  caracteristiques: string;
  prixUSD: number | null;
  prixDisponible: boolean;
  variantes: VarianteCatalogueAtc[];
  image: string | null;
  imageBanniere: string | null;
}

const catalogue = catalogueAtc as { devise: string; produits: EntreeCatalogueAtc[] };

// Garde-fous d'import : une incohérence du fichier bloque le chargement plutôt que d'afficher un prix faux.
function verifierEntree(e: EntreeCatalogueAtc): EntreeCatalogueAtc {
  const prixVariantes = e.variantes.map((v) => v.prixUSD);
  if (e.prixDisponible !== (e.prixUSD !== null)) {
    throw new Error(`Catalogue ATC — ${e.ref} : prixDisponible incohérent avec prixUSD.`);
  }
  if (e.prixUSD === null ? prixVariantes.length > 0 : e.prixUSD !== Math.min(...prixVariantes)) {
    throw new Error(`Catalogue ATC — ${e.ref} : prixUSD doit être le plus bas des prix de variantes.`);
  }
  return e;
}

if (catalogue.devise !== "USD") {
  throw new Error(`Catalogue ATC — devise "${catalogue.devise}" non prise en charge : le site affiche ses prix en USD.`);
}

export const entreesCatalogueAtc: EntreeCatalogueAtc[] = catalogue.produits.map(verifierEntree);

// Sous-catégorie du fichier client → sous-catégorie du site (lib/mock-data/categories.ts).
const CATEGORIE_PAR_SOUS_CATEGORIE: Record<string, string> = {
  "Panneaux solaires": "cat-panneaux",
  Onduleurs: "cat-onduleurs",
  "Batteries lithium": "cat-batteries-lithium",
  "Stockage commercial et industriel": "cat-stockage-commercial",
  "Structures et accessoires": "cat-structures-accessoires",
  "Climatiseurs résidentiels (split mural)": "cat-climatiseurs-residentiels",
  "Climatisation centrale et commerciale": "cat-climatisation-centrale",
  "Gaines et distribution d'air": "cat-gaines",
  "Service associé": "cat-service-climatisation",
  Caméras: "cat-cameras",
};

export function slugifier(nom: string): string {
  return nom
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function versProduit(e: EntreeCatalogueAtc): Produit {
  const categorieId = CATEGORIE_PAR_SOUS_CATEGORIE[e.sousCategorie];
  if (!categorieId) throw new Error(`Catalogue ATC — ${e.ref} : sous-catégorie inconnue "${e.sousCategorie}".`);

  // Une variante sans attribut est un produit à prix unique : son prix est porté par prix_public.
  // Stock client non communiqué (null) = non suivi, donc champ `stock` omis.
  const variantes: VarianteProduit[] = e.variantes.flatMap((v) =>
    v.attribut !== null && v.valeur !== null
      ? [{ id: v.id, attribut: v.attribut, valeur: v.valeur, prix: v.prixUSD, ...(v.stock !== null && { stock: v.stock }) }]
      : []
  );

  return {
    id: e.ref, // la référence client sert d'identifiant stable
    ref: e.ref,
    slug: slugifier(e.nom),
    nom: e.nom,
    description: e.description,
    caracteristiques: e.caracteristiques,
    categorie_id: categorieId,
    prix_public: e.prixUSD,
    prix_disponible: e.prixDisponible,
    eligible_b2b: false, // aucun palier B2B communiqué par le client : mécanisme conservé, sans palier
    // Configurateur de package personnalisé : énergie solaire uniquement, et seulement avec un prix
    // (un produit « Prix sur demande » n'y est pas sélectionnable, cf. ConfigurateurPackage.tsx).
    eligible_package: e.categorie === "energies-solaires" && e.prixDisponible,
    statut_publication: "publié",
    images: e.image ? [e.image] : [],
    image_banniere: e.imageBanniere ?? undefined,
    variantes: variantes.length > 0 ? variantes : undefined,
  };
}

export const produits: Produit[] = entreesCatalogueAtc.filter((e) => e.categorie !== "packages-solaires").map(versProduit);

if (new Set(produits.map((p) => p.slug)).size !== produits.length) {
  throw new Error("Catalogue ATC — deux produits ont le même nom, donc la même URL.");
}

export function trouverProduitParSlug(slug: string): Produit | undefined {
  return produits.find((p) => p.slug === slug);
}

export function produitsParCategorie(categorieId: string): Produit[] {
  return produits.filter((p) => p.categorie_id === categorieId && p.statut_publication === "publié");
}

// --- ECR-12-002 : mutation du catalogue depuis le back-office ---
// Mutation en place (push/splice sur le tableau `produits`, jamais de réaffectation `produits = ...`)
// pour que les modules qui importent ce tableau par référence (services catalogue, stores devis/panier,
// composants) voient immédiatement l'effet côté serveur. Invoquées uniquement depuis les Server Actions
// de lib/actions/catalogue-admin.ts, qui portent la validation métier.
export interface ProduitInputMock {
  nom: string;
  description: string;
  categorie_id: string;
  marque_id?: string;
  prix_public: number;
  eligible_b2b: boolean;
  eligible_package: boolean;
  statut_publication: StatutPublicationProduit;
  images?: string[];
  specifications?: Record<string, string>;
  // Point #29 — section optionnelle "Options du produit" ; undefined/tableau vide = pas de variantes.
  variantes?: VarianteProduit[];
}

function genererSlug(nom: string): string {
  const base = slugifier(nom) || "produit";
  let slug = base;
  let compteur = 1;
  while (produits.some((p) => p.slug === slug)) {
    compteur += 1;
    slug = `${base}-${compteur}`;
  }
  return slug;
}

let compteurProduitId = 0;
function genererIdProduit(): string {
  compteurProduitId += 1;
  return `prod-admin-${Date.now()}-${compteurProduitId}`;
}

export function creerProduitMock(input: ProduitInputMock): Produit {
  const produit: Produit = {
    id: genererIdProduit(),
    slug: genererSlug(input.nom),
    nom: input.nom,
    description: input.description,
    categorie_id: input.categorie_id,
    marque_id: input.marque_id,
    prix_public: input.prix_public,
    prix_disponible: true, // l'admin saisit toujours un prix (> 0, lib/actions/catalogue-admin.ts)
    eligible_b2b: input.eligible_b2b,
    eligible_package: input.eligible_package,
    statut_publication: input.statut_publication,
    images: input.images ?? [],
    specifications: input.specifications,
    variantes: input.variantes,
  };
  produits.push(produit);
  return produit;
}

export function modifierProduitMock(id: string, patch: Partial<ProduitInputMock>): Produit | undefined {
  const index = produits.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  const maj: Produit = { ...produits[index], ...patch };
  // Un prix saisi depuis l'admin rend le produit achetable : prix_disponible suit toujours prix_public.
  maj.prix_disponible = maj.prix_public !== null;
  produits.splice(index, 1, maj);
  return maj;
}

export function supprimerProduitMock(id: string): boolean {
  const index = produits.findIndex((p) => p.id === id);
  if (index === -1) return false;
  produits.splice(index, 1);
  return true;
}

// Raffinement Design — édition du stock d'une variante (point #29) depuis la section Stock dédiée
// (/admin/stock, SuiviStock.tsx). Contrairement à un produit sans variantes, il n'y a pas de tableau
// `stock` séparé : la quantité vit directement sur la variante, donc on la met à jour en place ici.
export function definirStockVarianteMock(produitId: string, varianteId: string, quantite: number): Produit | undefined {
  const produit = produits.find((p) => p.id === produitId);
  const variante = produit?.variantes?.find((v) => v.id === varianteId);
  if (!variante) return undefined;
  variante.stock = quantite;
  return produit;
}
