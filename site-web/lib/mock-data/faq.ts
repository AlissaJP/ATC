// EPIC-11 — Contenu. BF-11-001 (FAQ générale), BF-11-002 (FAQ par catégorie). Aucun contenu n'est fourni
// par le Cahier — questions/réponses rédigées pour cette démo, reflétant fidèlement les règles métier déjà
// implémentées (retrait uniquement, paiement MonCash/carte/PayPal, barème B2B, garanties, RG-04-005…).
export interface QuestionFAQ {
  id: string;
  question: string;
  reponse: string;
  categorie_id?: string; // référence lib/mock-data/categories.ts ; absent = question générale
}

export const questionsFAQ: QuestionFAQ[] = [
  {
    id: "faq-retrait",
    question: "Proposez-vous la livraison à domicile ?",
    reponse:
      "Non — toutes les commandes sont exclusivement retirées en magasin. Vous êtes notifié dès que votre commande est prête pour le retrait.",
  },
  {
    id: "faq-paiement",
    question: "Quels moyens de paiement acceptez-vous ?",
    reponse:
      "MonCash, carte Visa/Mastercard et PayPal. Le virement bancaire et les codes promotionnels ne sont pas proposés.",
  },
  {
    id: "faq-b2b",
    question: "Comment bénéficier des tarifs professionnels (B2B) ?",
    reponse:
      "Créez un compte Entreprise et soumettez vos documents (NIF, registre de commerce, pièce d'identité). Une fois votre dossier validé par notre équipe, le barème par palier de quantité s'applique automatiquement, sans négociation individuelle.",
  },
  {
    id: "faq-garantie",
    question: "Quelle est la durée de garantie de mes produits ?",
    reponse:
      "Elle varie par catégorie : 24 mois pour l'énergie solaire, 12 mois pour la sécurité et la climatisation. Le détail est indiqué sur chaque fiche produit.",
  },
  {
    id: "faq-devis-validite",
    question: "Combien de temps un devis reste-t-il valable ?",
    reponse: "Un devis répondu par notre équipe reste valable 3 jours à compter de sa réponse.",
    categorie_id: "cat-energie-solaire",
  },
  {
    id: "faq-panneaux-install",
    question: "Puis-je faire installer mes panneaux solaires par ATC ?",
    reponse:
      "Notre équipe interne assure l'assistance à l'installation pour les équipements solaires achetés via un package ou un devis. Contactez notre support pour en discuter.",
    categorie_id: "cat-energie-solaire",
  },
  {
    id: "faq-securite-install",
    question: "Les caméras de sécurité sont-elles faciles à installer ?",
    reponse:
      "Nos caméras PTZ et sonnettes connectées sont conçues pour une installation simple. Un guide est fourni avec chaque produit.",
    categorie_id: "cat-securite",
  },
  {
    id: "faq-clim-entretien",
    question: "Quel entretien pour un climatiseur ATC ?",
    reponse: "Un nettoyage des filtres tous les 2 à 3 mois est recommandé pour préserver la performance et la garantie.",
    categorie_id: "cat-climatisation",
  },
];

export function questionsFAQParCategorie(categorieId: string): QuestionFAQ[] {
  return questionsFAQ.filter((q) => q.categorie_id === categorieId);
}

// --- BF-12-011 (Must have, décision actée n°9) : gestion de la FAQ depuis le back-office ---
// Mutation en place (voir lib/mock-data/produits.ts pour le rationnel complet) ; invoquée uniquement
// depuis lib/actions/contenu-admin.ts, pour que la page /faq (Server Component) reflète les changements.
export interface QuestionFAQInputMock {
  question: string;
  reponse: string;
  categorie_id?: string;
}

let compteurFaqId = 0;
function genererIdFaq(): string {
  compteurFaqId += 1;
  return `faq-admin-${Date.now()}-${compteurFaqId}`;
}

export function creerQuestionFAQMock(input: QuestionFAQInputMock): QuestionFAQ {
  const question: QuestionFAQ = { id: genererIdFaq(), ...input };
  questionsFAQ.push(question);
  return question;
}

export function modifierQuestionFAQMock(id: string, patch: Partial<QuestionFAQInputMock>): QuestionFAQ | undefined {
  const index = questionsFAQ.findIndex((q) => q.id === id);
  if (index === -1) return undefined;
  const maj = { ...questionsFAQ[index], ...patch };
  questionsFAQ.splice(index, 1, maj);
  return maj;
}

export function supprimerQuestionFAQMock(id: string): boolean {
  const index = questionsFAQ.findIndex((q) => q.id === id);
  if (index === -1) return false;
  questionsFAQ.splice(index, 1);
  return true;
}
