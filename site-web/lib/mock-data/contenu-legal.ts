// EPIC-11 — Contenu. BF-11-004 (CGV/Confidentialité/Mentions légales), BF-12-011 (Must have, décision
// actée n°9 : gestion de ces textes depuis le back-office). Les pages CGV et Confidentialité existaient
// déjà en JSX statique (Phase 7) ; leur contenu est repris ici tel quel, structuré en sections éditables,
// pour que l'admin puisse modifier le texte légal sans intervention développeur (app/{cgv,confidentialite,
// mentions-legales}/page.tsx lisent désormais ce tableau au lieu de JSX en dur).
export interface SectionLegale {
  id: string;
  titre: string;
  corps: string; // texte simple ; les paragraphes sont séparés par une ligne vide
}

export type SlugPageLegale = "cgv" | "confidentialite" | "mentions-legales";

export interface PageLegale {
  slug: SlugPageLegale;
  titre: string;
  sections: SectionLegale[];
}

export const pagesLegales: PageLegale[] = [
  {
    slug: "cgv",
    titre: "Conditions Générales de Vente",
    sections: [
      {
        id: "cgv-1",
        titre: "1. Objet",
        corps:
          "Les présentes conditions régissent toute commande passée sur la plateforme ATC (Alpha Tech Center), qu'elle soit passée par un client Particulier ou un client Entreprise vérifié.",
      },
      {
        id: "cgv-2",
        titre: "2. Prix",
        corps:
          "Tous les prix affichés sur le site sont exprimés en dollars américains (USD), quel que soit le pays ou la langue de consultation. Les clients Entreprise vérifiés bénéficient d'un tarif dégressif par palier de quantité, appliqué automatiquement selon la quantité commandée — aucune négociation tarifaire individuelle n'est proposée.",
      },
      {
        id: "cgv-3",
        titre: "3. Devis",
        corps:
          "Un devis répondu par notre équipe reste valable 3 jours à compter de sa réponse. Passé ce délai, il est automatiquement considéré comme expiré et une nouvelle demande doit être formulée.",
      },
      {
        id: "cgv-4",
        titre: "4. Moyens de paiement",
        corps:
          "Les commandes et devis acceptés se règlent par MonCash, carte bancaire (Visa/Mastercard) ou PayPal. Le virement bancaire et les codes promotionnels ne sont pas proposés. Pour un règlement par MonCash, le montant est converti en gourdes haïtiennes (HTG) au taux de change en vigueur au moment de la transaction ; ce taux est fixé manuellement par ATC et journalisé sur la transaction, il n'est jamais recalculé a posteriori.",
      },
      {
        id: "cgv-5",
        titre: "5. Retrait des commandes",
        corps:
          "ATC ne propose aucun service de livraison. Toute commande réglée est préparée puis mise à disposition pour un retrait en magasin ; le client est notifié dès que sa commande est prête.",
      },
      {
        id: "cgv-6",
        titre: "6. Garanties",
        corps:
          "Les durées de garantie constructeur varient par catégorie de produit : 24 mois pour l'énergie solaire (panneaux, batteries, régulateurs, accessoires), 12 mois pour la sécurité et la climatisation. Le détail est indiqué sur chaque fiche produit.",
      },
      {
        id: "cgv-7",
        titre: "7. Comptes Entreprise",
        corps:
          "L'accès au tarif professionnel est soumis à la vérification du dossier Entreprise (pièces justificatives) par notre équipe. Aucun raccourci n'est appliqué à ce processus de validation.",
      },
      {
        id: "cgv-8",
        titre: "8. Export et clients de la diaspora",
        corps:
          "ATC exerce en Haïti et retire ses commandes exclusivement en magasin sur le territoire haïtien. Pour un achat destiné à être expédié ou remis à un tiers hors du magasin (notamment pour un proche resté en Haïti, cas fréquent pour nos clients de la diaspora), les formalités douanières, frais et responsabilités liés au transport au-delà du point de retrait relèvent exclusivement du client et du tiers désigné — ATC n'intervient à aucun titre dans cette étape.",
      },
    ],
  },
  {
    slug: "confidentialite",
    titre: "Politique de confidentialité",
    sections: [
      {
        id: "confid-1",
        titre: "1. Données collectées",
        corps:
          "Lors de la création d'un compte, ATC collecte votre nom, email, téléphone et langue préférée. Pour un compte Entreprise, s'ajoutent les informations de l'entreprise (nom légal, NIF, registre de commerce, adresse professionnelle, secteur d'activité) ainsi que les pièces justificatives téléversées pour la vérification du dossier.",
      },
      {
        id: "confid-2",
        titre: "2. Utilisation des données",
        corps:
          "Ces informations servent exclusivement à traiter vos devis, commandes et paiements, à vérifier l'éligibilité d'un compte Entreprise au tarif professionnel, et à assurer le support client. Elles ne sont ni vendues ni transmises à des tiers à des fins commerciales.",
      },
      {
        id: "confid-3",
        titre: "3. Cookies et stockage local",
        corps:
          "Le site utilise le stockage local de votre navigateur pour conserver votre session, votre panier et votre langue préférée d'une visite à l'autre, afin de vous éviter de tout ressaisir. Aucun de ces éléments n'est utilisé à des fins publicitaires ou de suivi vers des tiers.",
      },
      {
        id: "confid-4",
        titre: "4. Juridictions applicables",
        corps:
          "ATC opère depuis Haïti et applique le cadre légal haïtien. Pour les clients situés aux États-Unis, au Canada ou dans l'Union européenne, les protections locales applicables en matière de données personnelles (le cas échéant) sont également respectées.",
      },
      {
        id: "confid-5",
        titre: "5. Vos droits d'accès et de suppression",
        corps:
          "Vous pouvez à tout moment consulter les informations liées à votre compte depuis votre espace client. Pour toute demande d'accès, de correction ou de suppression de vos données personnelles, contactez notre équipe support via WhatsApp ou depuis votre espace client.",
      },
    ],
  },
  {
    slug: "mentions-legales",
    titre: "Mentions légales",
    sections: [
      {
        id: "mentions-1",
        titre: "1. Éditeur du site",
        corps:
          "Le site ATC (Alpha Tech Center) est édité par Alpha Tech Center, distributeur d'énergie solaire, de matériel de sécurité et de climatisation en Haïti. Coordonnées complètes disponibles auprès de notre support (page Contact).",
      },
      {
        id: "mentions-2",
        titre: "2. Directeur de la publication",
        corps: "La direction d'Alpha Tech Center assure la publication du site.",
      },
      {
        id: "mentions-3",
        titre: "3. Hébergement",
        corps: "Coordonnées de l'hébergeur communiquées sur demande auprès de notre support.",
      },
      {
        id: "mentions-4",
        titre: "4. Propriété intellectuelle",
        corps:
          "L'ensemble des contenus présents sur ce site (textes, visuels, logo) est la propriété d'Alpha Tech Center ou de ses fournisseurs, sauf mention contraire, et ne peut être reproduit sans autorisation.",
      },
      {
        id: "mentions-5",
        titre: "5. Contact",
        corps: "Pour toute question relative à ces mentions légales, contactez notre équipe via la page Contact ou par WhatsApp.",
      },
    ],
  },
];

export function trouverPageLegale(slug: SlugPageLegale): PageLegale | undefined {
  return pagesLegales.find((p) => p.slug === slug);
}

// --- BF-12-011 : édition des textes légaux depuis le back-office ---
// Mutation en place (voir lib/mock-data/produits.ts pour le rationnel complet) ; invoquée uniquement
// depuis lib/actions/contenu-admin.ts.
export interface SectionLegaleInputMock {
  titre: string;
  corps: string;
}

let compteurSectionId = 0;
function genererIdSection(slug: SlugPageLegale): string {
  compteurSectionId += 1;
  return `${slug}-admin-${Date.now()}-${compteurSectionId}`;
}

export function modifierSectionLegaleMock(
  slug: SlugPageLegale,
  sectionId: string,
  patch: Partial<SectionLegaleInputMock>
): SectionLegale | undefined {
  const page = pagesLegales.find((p) => p.slug === slug);
  if (!page) return undefined;
  const index = page.sections.findIndex((s) => s.id === sectionId);
  if (index === -1) return undefined;
  const maj = { ...page.sections[index], ...patch };
  page.sections.splice(index, 1, maj);
  return maj;
}

export function ajouterSectionLegaleMock(slug: SlugPageLegale, input: SectionLegaleInputMock): SectionLegale | undefined {
  const page = pagesLegales.find((p) => p.slug === slug);
  if (!page) return undefined;
  const section: SectionLegale = { id: genererIdSection(slug), ...input };
  page.sections.push(section);
  return section;
}

export function supprimerSectionLegaleMock(slug: SlugPageLegale, sectionId: string): boolean {
  const page = pagesLegales.find((p) => p.slug === slug);
  if (!page) return false;
  const index = page.sections.findIndex((s) => s.id === sectionId);
  if (index === -1) return false;
  page.sections.splice(index, 1);
  return true;
}
