// Types miroir du Cahier des Données (Cahier 9) — noms de champs fidèles au dictionnaire
// pour faciliter la transition ultérieure vers un schéma PostgreSQL réel.

export type Langue = "fr" | "en" | "es";
export type TypeCompte = "particulier" | "entreprise";
export type StatutCompte = "actif" | "suspendu";

export interface Utilisateur {
  id: string;
  type_compte: TypeCompte;
  email: string;
  nom: string;
  telephone?: string;
  langue_preferee: Langue;
  date_creation: string;
  statut_compte: StatutCompte;
}

export type StatutValidationEntreprise =
  | "en_attente"
  | "valide"
  | "rejete"
  | "complement_demande";

export interface ProfilEntreprise {
  id: string;
  utilisateur_id: string;
  nom_legal: string;
  nom_commercial?: string;
  nif: string;
  registre_commerce?: string;
  adresse_entreprise: string;
  telephone_professionnel: string;
  email_professionnel: string;
  representant_nom: string;
  representant_fonction: string;
  secteur_activite: string;
  taille_entreprise?: string;
  statut_validation: StatutValidationEntreprise;
  date_soumission: string;
  date_validation?: string;
  commentaire_admin?: string;
}

export type TypeDocumentEntreprise =
  | "patente"
  | "nif"
  | "registre_commerce"
  | "piece_identite";

export interface DocumentEntreprise {
  id: string;
  profil_entreprise_id: string;
  type_document: TypeDocumentEntreprise;
  fichier_url: string;
  date_televersement: string;
}

export type StatutPublicationProduit = "publié" | "brouillon";

export interface Produit {
  id: string;
  slug: string;
  nom: string;
  description: string;
  categorie_id: string;
  marque_id?: string;
  prix_public: number; // USD — RG-03-001
  eligible_b2b: boolean; // RG-03-004
  eligible_package: boolean; // BF-03-004
  statut_publication: StatutPublicationProduit;
  images: string[];
  accessoires_compatibles_ids?: string[]; // RG-03-003
  specifications?: Record<string, string>;
  // Raffinement Design (point #29 — remplace le mécanisme à SKU séparés du point #23) : options de
  // variantes avec prix, imbriquées directement sur la fiche produit plutôt qu'en fiches Produit
  // distinctes reliées par un `groupe` — plus proche d'une vraie relation SQL `product_variants` →
  // `products` (variantes.id, produit_id en clé étrangère implicite). `attribut` est libre (« Puissance »,
  // « Résolution »...) ; plusieurs attributs différents peuvent coexister sur un même produit, mais SANS
  // matrice combinée (chaque variante reste une valeur indépendante avec son propre prix/stock — pas de
  // combinaison croisée entre attributs, volontairement, pour rester simple). Le sélecteur ne s'affiche
  // que si `variantes` contient au moins 2 entrées (components/product/AchatProduit.tsx).
  variantes?: VarianteProduit[];
}

export interface VarianteProduit {
  id: string;
  attribut: string; // ex. "Puissance", "Résolution"
  valeur: string; // ex. "405 Wc", "4K"
  prix: number;
  stock?: number; // non renseigné = stock non suivi pour cette variante (toujours disponible)
  // Extension au-delà de l'exemple du point #29 — préserve la description "points forts" par valeur déjà
  // exigée au point #23 (ex. "4K : idéal pour l'identification de plaques à distance").
  description?: string;
}

export interface Categorie {
  id: string;
  slug: string;
  nom: string;
  parent_id?: string;
}

export interface Marque {
  id: string;
  nom: string;
}

export interface Stock {
  produit_id: string;
  stock_actuel: number;
  stock_reference: number; // défaut 100 — décision actée n°28 (RG-03-002)
}

export interface PalierPrixB2B {
  id: string;
  produit_id: string;
  quantite_min: number;
  quantite_max?: number; // illimité si vide
  prix_unitaire: number; // USD — RG-03-004
}

export type TypeOrigineDevis = "package_preconfigure" | "configurateur_personnalise";
export type StatutDevis =
  | "en_attente"
  | "repondu"
  | "accepte"
  | "refuse"
  | "expire"
  | "converti";

export interface Devis {
  id: string;
  utilisateur_id: string;
  type_origine: TypeOrigineDevis;
  statut: StatutDevis;
  prix_total?: number; // nullable jusqu'à réponse — RG-04-003
  cout_installation?: number; // RG-09-002
  date_creation: string;
  date_reponse?: string;
  date_expiration_prevue?: string; // date_reponse + 3 jours — RG-04-005
  administrateur_id?: string;
}

export interface LigneDevis {
  id: string;
  devis_id: string;
  produit_id: string;
  quantite: number;
  prix_unitaire_applique: number; // figé au palier applicable au moment de la réponse
}

export type StatutCommande = "en_preparation" | "prete_retrait" | "retiree";

export interface Commande {
  id: string;
  utilisateur_id: string;
  devis_id?: string; // renseigné si issue d'un devis converti — RG-04-004
  montant_total: number; // USD
  statut: StatutCommande;
  date_creation: string;
  date_pret_retrait?: string;
  date_retrait?: string;
}

export interface LigneCommande {
  id: string;
  commande_id: string;
  produit_id: string;
  quantite: number;
  prix_unitaire_applique: number;
}

export type MethodePaiement = "moncash" | "carte" | "paypal"; // RG-06-001 — jamais virement
export type StatutTransaction = "réussie" | "échouée" | "en cours";

export interface Paiement {
  id: string;
  // Ordre de mise en œuvre acté (décision n°14) : Paiement (Phase 3) précède Panier & Commande (Phase 4).
  // Un règlement peut donc d'abord être rattaché à un devis accepté (RG-04-004), avant qu'une commande
  // n'existe — même logique de double rattachement optionnel que FACTURE_PRO_FORMA ci-dessus.
  commande_id?: string;
  devis_id?: string;
  methode: MethodePaiement;
  montant_usd: number;
  montant_htg?: number; // renseigné si moncash
  taux_change_applique?: number; // journalisé, jamais recalculé a posteriori
  statut_transaction: StatutTransaction;
  date_transaction: string;
}

export interface FactureProForma {
  id: string;
  numero_sequentiel: string;
  commande_id?: string;
  devis_id?: string;
  montant_ht: number;
  taux_taxe: number; // défaut 10 % — décision actée n°18
  montant_taxe: number;
  montant_ttc: number;
  date_generation: string;
}

export interface Garantie {
  categorie_id: string;
  duree_mois: number; // valeurs de travail — décision actée n°19
}

export type RoleAdmin = "general" | "agent_sav"; // exactement 2 valeurs — décision actée n°20

export interface Administrateur {
  id: string;
  email: string;
  nom: string;
  role: RoleAdmin;
}

// Raffinement Design (point #26) — annuaire des agents SAV, DISTINCT des 2 comptes de connexion stricts
// (Administrateur ci-dessus, RG-12-001, décision actée n°20 — inchangée, toujours exactement 2 rôles
// connectables). Un CompteAgentSav n'est pas un compte de connexion : c'est une fiche de suivi (nom,
// code généré, email, statut) que l'Admin Général gère pour un nombre quelconque d'agents SAV réels,
// indépendamment du fait que cette démo n'expose qu'une seule session Agent SAV connectable au total.
// `codeAgent` est généré par le système, jamais saisi — cf. lib/services/agents-sav.ts pour la
// génération/vérification d'unicité, isolée pour être remplacée par une séquence + contrainte UNIQUE
// PostgreSQL lors de l'intégration d'une vraie base, sans changer ce modèle. Décision actée n°45.
export type StatutCompteAgentSav = "actif" | "inactif";

export interface CompteAgentSav {
  id: string;
  codeAgent: string; // ex. "SAV-0001"
  nom: string;
  email: string;
  statut: StatutCompteAgentSav;
}

// Raffinement Design (point #27) — journal des actions par agent SAV, lecture seule pour l'Admin Général
// (RG-12-001). `codeAgent` relie logiquement chaque entrée à un CompteAgentSav.codeAgent — pas de clé
// étrangère typée ici (mock plat), mais la forme est pensée pour se transposer directement vers une table
// PostgreSQL dédiée `agent_actions_log` (codeAgent en clé étrangère vers agents_sav.code_agent) lors de
// l'intégration d'une vraie base, sans changement de modèle côté frontend. Décision actée n°46.
export type TypeActionAgentSav =
  | "commande_prise_en_charge"
  | "commande_traitee"
  | "ticket_pris_en_charge"
  | "reponse_client"
  | "ticket_resolu";

export interface JournalActionAgentSav {
  id: string;
  codeAgent: string;
  typeAction: TypeActionAgentSav;
  referenceCommande: string; // référence de la commande ou du ticket concerné
  date: string; // ISO 8601
}

export interface ParametresGeneraux {
  id: string; // singleton
  taux_change_htg_usd: number; // RG-06-003 — manuel, jamais automatique
  langues_actives: Langue[];
  date_derniere_maj_taux: string;
}

export interface PackagePreconfigure {
  id: string;
  slug: string;
  nom: string;
  description: string;
  produits: { produit_id: string; quantite: number }[];
  prix_total: number;
  image: string;
}

export type StatutAvis = "en_attente_moderation" | "publie" | "rejete"; // RG-12-002

export interface AvisClient {
  id: string;
  produit_id: string;
  utilisateur_id: string;
  note: number; // 1 à 5
  titre?: string; // Raffinement Design — bloc Avis clients (ECR-03-001), titre en gras au-dessus du texte
  commentaire?: string;
  statut: StatutAvis;
  date_creation: string;
}

// Témoignage de confiance affiché sur l'accueil (Raffinement Design, section "Avis clients") — distinct
// d'AvisClient (avis par produit, soumis par un utilisateur réel et modéré via RG-12-002). Contenu mock
// de démonstration (décision actée n°42), structure pensée pour être remplacée par une vraie table
// "reviews"/"testimonials" (Cahier 8) sans changer l'interface consommée par l'UI.
export interface TemoignageClient {
  id: string;
  nom: string; // nom complet ou initiales, au choix pour la confidentialité
  note: number; // 1 à 5
  commentaire: string;
  localisation?: string; // ville en Haïti ou pays de la diaspora
  photo?: string;
}

export type StatutTicketSAV = "ouvert" | "en_cours" | "resolu" | "ferme";

export interface TicketSAV {
  id: string;
  utilisateur_id: string;
  commande_id?: string;
  sujet: string;
  description: string;
  statut: StatutTicketSAV;
  date_creation: string;
}

export interface InstallationRdv {
  id: string;
  commande_id: string;
  date_prevue: string;
  statut: "planifie" | "realise" | "annule";
}

export interface Adresse {
  id: string;
  utilisateur_id: string;
  libelle: string;
  adresse: string;
}

export interface Favori {
  id: string;
  utilisateur_id: string;
  produit_id: string;
}

// RAFF-MOYENS-PAIEMENT — Moyens de paiement enregistrés (Espace Client + réutilisation à l'écran de
// paiement, ECR-06-001). RG-06-001 : uniquement MonCash, carte, PayPal — jamais de virement. Sécurité
// (Cahier 8 §7) : aucune donnée de carte complète stockée, seuls les 4 derniers chiffres et la date
// d'expiration sont conservés pour l'affichage.
export type TypeMoyenPaiementEnregistre = "carte" | "moncash" | "paypal";

export interface MoyenPaiementEnregistre {
  id: string;
  utilisateur_id: string;
  type: TypeMoyenPaiementEnregistre;
  libelle: string; // ex. "Carte •••• 1234", "MonCash — •••• 5678", "PayPal connecté"
  info_secondaire?: string; // ex. "Expire 06/2027", "Numéro enregistré", "j***@exemple.com"
  par_defaut: boolean;
}

export interface LogAudit {
  id: string;
  administrateur_id: string;
  action: string;
  date_action: string;
}

// Calculé dynamiquement, jamais stocké — RG-03-002
export type NiveauAlerteStock = "en_stock" | "alerte_orange" | "alerte_rouge" | "rupture";
