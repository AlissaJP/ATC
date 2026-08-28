// Catalogue produit fictif de démonstration — décision actée n°42, reflète le dictionnaire du Cahier 9.
// BF-03-001 à BF-03-007.
import type { Produit, StatutPublicationProduit, VarianteProduit } from "@/lib/types/entities";

const img = {
  energie: (n: number) => `/images/energie-solaire/energie-${String(n).padStart(2, "0")}.webp`,
  clim: (n: number) => `/images/climatisation/climatisation-${String(n).padStart(2, "0")}.webp`,
  securite: (name: string) => `/images/securite/${name}`,
};

export const produits: Produit[] = [
  // --- Énergie solaire : panneaux ---
  // Panneau solaire monocristallin — options de variantes avec prix (point #29, remplace le mécanisme à
  // SKU séparés du point #23) : une seule fiche produit, deux valeurs de puissance imbriquées dans
  // `variantes`, chacune avec son propre prix/stock. `puissance` retiré de specifications (déjà porté par
  // le sélecteur, pas d'affichage en double).
  {
    id: "prod-panneau-405w",
    slug: "panneau-solaire-monocristallin-405w",
    nom: "Panneau solaire monocristallin",
    description: "Panneau photovoltaïque monocristallin haute performance, plusieurs puissances disponibles.",
    categorie_id: "cat-panneaux",
    marque_id: "marque-solarmax",
    prix_public: 189,
    eligible_b2b: true,
    eligible_package: true,
    statut_publication: "publié",
    images: [img.energie(17), img.energie(15)],
    specifications: { technologie: "Monocristallin" },
    accessoires_compatibles_ids: ["prod-regulateur-mppt-60a", "prod-kit-cables-mc4", "prod-structure-montage"],
    variantes: [
      {
        id: "var-panneau-405w",
        attribut: "Puissance",
        valeur: "405 Wc",
        prix: 189,
        stock: 65,
        description:
          "405 Wc : très bon rapport qualité-prix, la puissance de référence pour la plupart des installations résidentielles et commerciales.",
      },
      {
        id: "var-panneau-550w",
        attribut: "Puissance",
        valeur: "550 Wc",
        prix: 245,
        stock: 38,
        description:
          "550 Wc : puissance élevée pour maximiser la production sur une surface de toiture réduite, idéal si l'espace disponible est limité.",
      },
    ],
  },

  // --- Énergie solaire : batteries ---
  {
    id: "prod-batterie-lithium-100ah",
    slug: "batterie-lithium-lifepo4-100ah",
    nom: "Batterie lithium LiFePO4 100Ah",
    description: "Batterie longue durée de vie, idéale pour le stockage solaire résidentiel.",
    categorie_id: "cat-batteries",
    marque_id: "marque-ecotech",
    prix_public: 520,
    eligible_b2b: true,
    eligible_package: true,
    statut_publication: "publié",
    // Aucune photo propre disponible (visuels fournisseur avec marque tierce
    // incohérente avec marque-ecotech) — placeholder "Image à venir" (Audit Axe 2).
    images: [],
    specifications: { capacite: "100 Ah", technologie: "LiFePO4", cycles: "6000+" },
    accessoires_compatibles_ids: ["prod-onduleur-hybride-5kva", "prod-regulateur-mppt-60a"],
  },
  {
    id: "prod-batterie-gel-200ah",
    slug: "batterie-gel-200ah",
    nom: "Batterie gel 200Ah",
    description: "Batterie gel robuste, adaptée aux cycles de décharge profonds.",
    categorie_id: "cat-batteries",
    marque_id: "marque-ecotech",
    prix_public: 410,
    eligible_b2b: true,
    eligible_package: true,
    statut_publication: "publié",
    images: [img.energie(2), img.energie(6)],
    specifications: { capacite: "200 Ah", technologie: "Gel" },
  },

  // --- Énergie solaire : régulateurs / onduleurs ---
  {
    id: "prod-regulateur-mppt-60a",
    slug: "regulateur-mppt-60a",
    nom: "Régulateur de charge MPPT 60A",
    description: "Régulateur MPPT haute efficacité pour optimiser la charge des batteries.",
    categorie_id: "cat-regulateurs",
    marque_id: "marque-ecotech",
    prix_public: 165,
    eligible_b2b: true,
    eligible_package: true,
    statut_publication: "publié",
    images: [img.energie(7), img.energie(8)],
    specifications: { courant: "60 A", technologie: "MPPT" },
  },
  {
    id: "prod-onduleur-hybride-5kva",
    slug: "onduleur-hybride-5kva",
    nom: "Onduleur hybride 5kVA",
    description: "Onduleur hybride pour installation solaire avec basculement automatique sur batterie.",
    categorie_id: "cat-regulateurs",
    marque_id: "marque-ecotech",
    prix_public: 890,
    eligible_b2b: true,
    eligible_package: true,
    statut_publication: "publié",
    images: [img.energie(10), img.energie(11)],
    specifications: { puissance: "5 kVA" },
  },

  // --- Énergie solaire : accessoires ---
  {
    id: "prod-kit-cables-mc4",
    slug: "kit-cables-connecteurs-mc4",
    nom: "Kit câbles & connecteurs MC4",
    description: "Kit complet de câblage solaire avec connecteurs étanches MC4.",
    categorie_id: "cat-accessoires-solaires",
    prix_public: 35,
    eligible_b2b: false,
    eligible_package: true,
    statut_publication: "publié",
    images: [img.energie(5)],
  },
  {
    id: "prod-structure-montage",
    slug: "structure-montage-toiture",
    nom: "Structure de montage toiture",
    description: "Structure de fixation en aluminium pour panneaux solaires en toiture inclinée.",
    categorie_id: "cat-accessoires-solaires",
    prix_public: 78,
    eligible_b2b: false,
    eligible_package: true,
    statut_publication: "publié",
    images: [img.energie(14)],
  },
  {
    id: "prod-kit-mise-a-la-terre",
    slug: "kit-mise-a-la-terre",
    nom: "Kit de mise à la terre",
    description: "Kit de protection et mise à la terre pour installation solaire conforme.",
    categorie_id: "cat-accessoires-solaires",
    prix_public: 42,
    eligible_b2b: false,
    eligible_package: true,
    statut_publication: "publié",
    images: [img.energie(12)],
  },

  // --- Sécurité ---
  {
    id: "prod-sonnette-video",
    slug: "sonnette-video-connectee",
    nom: "Sonnette vidéo connectée",
    description: "Sonnette intelligente en 1080p avec vision nocturne et détection de mouvement, notification mobile en temps réel.",
    categorie_id: "cat-securite",
    marque_id: "marque-securvision",
    prix_public: 89,
    eligible_b2b: true,
    eligible_package: false,
    statut_publication: "publié",
    // Aucune photo propre disponible (visuels fournisseur : texte marketing
    // anglais + logo "SMART+" tiers) — placeholder "Image à venir" (Audit Axe 2).
    images: [],
    // Résolution retirée des filtres de catalogue (Raffinement Design) — intégrée à la description
    // ci-dessus plutôt qu'en critère de filtrage.
    specifications: { alimentation: "Secteur" },
  },
  // Caméra PTZ standard — options de variantes avec prix (point #29, remplace le mécanisme à SKU
  // séparés du point #23) : une seule fiche produit, trois valeurs de résolution imbriquées dans
  // `variantes`, chacune avec son propre prix/stock/description.
  {
    id: "prod-camera-ptz-standard",
    slug: "camera-ptz-standard",
    nom: "Caméra PTZ standard",
    description: "Caméra de surveillance motorisée (Pan-Tilt-Zoom), plusieurs résolutions disponibles, suivi automatique et vision nocturne inclus.",
    categorie_id: "cat-securite",
    marque_id: "marque-securvision",
    prix_public: 99,
    eligible_b2b: true,
    eligible_package: false,
    statut_publication: "publié",
    // Aucune photo propre disponible (visuels fournisseur : texte marketing
    // anglais + badges Tuya/Smart Life tiers) — placeholder "Image à venir" (Audit Axe 2).
    images: [],
    specifications: { alimentation: "Secteur" },
    variantes: [
      {
        id: "var-camera-1080p",
        attribut: "Résolution",
        valeur: "1080p",
        prix: 99,
        stock: 60,
        description: "1080p : bon rapport qualité-prix, adapté à une surveillance générale de proximité.",
      },
      {
        id: "var-camera-2k",
        attribut: "Résolution",
        valeur: "2K",
        prix: 145,
        stock: 25,
        description: "2K : définition intermédiaire offrant un bon équilibre netteté/coût, pour une surveillance résidentielle ou commerciale standard.",
      },
      {
        id: "var-camera-4k",
        attribut: "Résolution",
        valeur: "4K",
        prix: 199,
        stock: 8,
        description: "4K : détails ultra-nets, idéal pour l'identification de plaques d'immatriculation ou de visages à distance.",
      },
    ],
  },
  {
    id: "prod-camera-ptz-solaire",
    slug: "camera-ptz-solaire-autonome",
    nom: "Caméra PTZ solaire autonome",
    description: "Caméra de surveillance motorisée en définition 3 MP, alimentée par panneau solaire intégré, idéale pour sites isolés.",
    categorie_id: "cat-securite",
    marque_id: "marque-securvision",
    prix_public: 310,
    eligible_b2b: true,
    eligible_package: false,
    statut_publication: "publié",
    // Une seule image du lot fournisseur est exploitable (produit-isole-03 :
    // logo tiers uniquement, sans bandeau marketing anglais) ; les 4 autres
    // ont été retirées (Audit Axe 2).
    images: [img.securite("camera-ptz-solaire-produit-isole-produit-isole-03.webp")],
    specifications: { alimentation: "Solaire" },
  },

  // --- Climatisation ---
  {
    id: "prod-climatiseur-split-12000",
    slug: "climatiseur-split-residentiel-carrier",
    nom: "Climatiseur split résidentiel Carrier",
    description: "Climatiseur split Carrier, basse consommation, idéal pour chambre ou petit bureau.",
    categorie_id: "cat-climatisation",
    marque_id: "marque-carrier",
    prix_public: 425,
    eligible_b2b: true,
    eligible_package: false,
    statut_publication: "publié",
    images: [img.clim(6), img.clim(1)],
    specifications: { puissance: "12000 BTU", technologie: "Split mural" },
  },
  {
    id: "prod-climatiseur-split-18000",
    slug: "climatisation-gainable-carrier",
    nom: "Système de climatisation gainable Carrier",
    description: "Système centralisé Carrier avec unité de traitement d'air et réseau de gaines, pour un confort homogène sur plusieurs pièces.",
    categorie_id: "cat-climatisation",
    marque_id: "marque-carrier",
    prix_public: 610,
    eligible_b2b: true,
    eligible_package: false,
    statut_publication: "publié",
    images: [img.clim(5), img.clim(8)],
    specifications: { puissance: "18000 BTU", technologie: "Gainable (centralisé)" },
  },
  {
    id: "prod-climatiseur-tgm",
    slug: "climatiseur-vertical-tgm",
    nom: "Climatiseur vertical TGM",
    description: "Unité verticale TGM pour bureaux et espaces commerciaux, installation murale sur conduit dédié.",
    categorie_id: "cat-climatisation",
    marque_id: "marque-tgm",
    prix_public: 340,
    eligible_b2b: true,
    eligible_package: false,
    statut_publication: "publié",
    images: [img.clim(2), img.clim(3), img.clim(4)],
    specifications: { type: "Unité verticale", usage: "Bureaux / commercial" },
  },
];

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
  const base =
    nom
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "produit";
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
