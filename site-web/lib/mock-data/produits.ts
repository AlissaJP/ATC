// Catalogue produit fictif de démonstration — décision actée n°42, reflète le dictionnaire du Cahier 9.
// BF-03-001 à BF-03-007.
import type { Produit, StatutPublicationProduit } from "@/lib/types/entities";

const img = {
  energie: (n: number) => `/images/energie-solaire/energie-${String(n).padStart(2, "0")}.webp`,
  clim: (n: number) => `/images/climatisation/climatisation-${String(n).padStart(2, "0")}.webp`,
  securite: (name: string) => `/images/securite/${name}`,
};

export const produits: Produit[] = [
  // --- Énergie solaire : panneaux ---
  {
    id: "prod-panneau-405w",
    slug: "panneau-solaire-monocristallin-405w",
    nom: "Panneau solaire monocristallin 405W",
    description:
      "Panneau photovoltaïque monocristallin haute performance, idéal pour installations résidentielles et commerciales.",
    categorie_id: "cat-panneaux",
    marque_id: "marque-solarmax",
    prix_public: 189,
    eligible_b2b: true,
    eligible_package: true,
    statut_publication: "publié",
    images: [img.energie(17), img.energie(15)],
    specifications: { puissance: "405 Wc", technologie: "Monocristallin" },
    accessoires_compatibles_ids: ["prod-regulateur-mppt-60a", "prod-kit-cables-mc4", "prod-structure-montage"],
  },
  {
    id: "prod-panneau-550w",
    slug: "panneau-solaire-monocristallin-550w",
    nom: "Panneau solaire monocristallin 550W",
    description: "Panneau haute puissance pour maximiser la production sur une surface réduite.",
    categorie_id: "cat-panneaux",
    marque_id: "marque-solarmax",
    prix_public: 245,
    eligible_b2b: true,
    eligible_package: true,
    statut_publication: "publié",
    images: [img.energie(16), img.energie(4)],
    specifications: { puissance: "550 Wc", technologie: "Monocristallin" },
    accessoires_compatibles_ids: ["prod-regulateur-mppt-60a", "prod-kit-cables-mc4", "prod-structure-montage"],
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
  // Caméra PTZ standard — 3 SKU distincts par résolution (Raffinement Design, sélecteur de résolution
  // ECR-03-001) : chacun a son propre prix et son propre stock (lib/mock-data/stock.ts), pas une simple
  // variante d'affichage. `variante_resolution.groupe` identique sur les 3 relie le sélecteur. Correction
  // #23 : une seule fiche produit publique (2K, canonique) — 1080p et 4K sont `masque: true`, retirés du
  // catalogue/de la recherche, et n'existent plus que comme SKU sélectionnables sur la fiche canonique.
  {
    id: "prod-camera-ptz-standard-1080p",
    slug: "camera-ptz-standard-1080p",
    nom: "Caméra PTZ standard 1080p",
    description:
      "1080p : bon rapport qualité-prix, adapté à une surveillance générale de proximité. Suivi automatique et vision nocturne inclus.",
    categorie_id: "cat-securite",
    marque_id: "marque-securvision",
    prix_public: 99,
    eligible_b2b: true,
    eligible_package: false,
    statut_publication: "publié",
    images: [],
    specifications: { alimentation: "Secteur" },
    variante_resolution: { groupe: "camera-ptz-standard", resolution: "1080p", masque: true },
  },
  {
    id: "prod-camera-ptz-standard",
    slug: "camera-ptz-standard",
    nom: "Caméra PTZ standard",
    description:
      "2K : définition intermédiaire offrant un bon équilibre netteté/coût, pour une surveillance résidentielle ou commerciale standard. Suivi automatique et vision nocturne inclus.",
    categorie_id: "cat-securite",
    marque_id: "marque-securvision",
    prix_public: 145,
    eligible_b2b: true,
    eligible_package: false,
    statut_publication: "publié",
    // Aucune photo propre disponible (visuels fournisseur : texte marketing
    // anglais + badges Tuya/Smart Life tiers) — placeholder "Image à venir" (Audit Axe 2).
    images: [],
    specifications: { alimentation: "Secteur" },
    variante_resolution: { groupe: "camera-ptz-standard", resolution: "2K" },
  },
  {
    id: "prod-camera-ptz-standard-4k",
    slug: "camera-ptz-standard-4k",
    nom: "Caméra PTZ standard 4K",
    description:
      "4K : détails ultra-nets, idéal pour l'identification de plaques d'immatriculation ou de visages à distance. Suivi automatique et vision nocturne inclus.",
    categorie_id: "cat-securite",
    marque_id: "marque-securvision",
    prix_public: 199,
    eligible_b2b: true,
    eligible_package: false,
    statut_publication: "publié",
    images: [],
    specifications: { alimentation: "Secteur" },
    variante_resolution: { groupe: "camera-ptz-standard", resolution: "4K", masque: true },
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
