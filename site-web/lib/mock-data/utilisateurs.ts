// Comptes de test — décision actée n°41 (comptes techniques réels non disponibles, sandbox/démo).
// Aucun de ces comptes n'est connecté par défaut au démarrage de l'application (section 6 du prompt de mission).
import type { ProfilEntreprise, Utilisateur } from "@/lib/types/entities";

export const utilisateurs: Utilisateur[] = [
  {
    id: "user-particulier-1",
    type_compte: "particulier",
    email: "particulier.demo@atc-demo.ht",
    nom: "Jean Baptiste",
    telephone: "+509 3456 7890",
    langue_preferee: "fr",
    date_creation: "2026-03-10T14:00:00Z",
    statut_compte: "actif",
  },
  {
    id: "user-entreprise-verifiee",
    type_compte: "entreprise",
    email: "contact@quisqueya-electro.ht",
    nom: "Marie Delva",
    telephone: "+509 2222 3333",
    langue_preferee: "fr",
    date_creation: "2026-01-15T09:30:00Z",
    statut_compte: "actif",
  },
  {
    id: "user-entreprise-en-attente",
    type_compte: "entreprise",
    email: "info@sudsolutions.ht",
    nom: "Patrick Joseph",
    telephone: "+509 4444 5555",
    langue_preferee: "fr",
    date_creation: "2026-08-05T11:00:00Z",
    statut_compte: "actif",
  },
  {
    id: "user-entreprise-complement",
    type_compte: "entreprise",
    email: "admin@nordbatiment.ht",
    nom: "Nadine Charles",
    telephone: "+509 4444 6666",
    langue_preferee: "fr",
    date_creation: "2026-07-20T08:00:00Z",
    statut_compte: "actif",
  },
];

export const profilsEntreprise: ProfilEntreprise[] = [
  {
    id: "profil-quisqueya-electro",
    utilisateur_id: "user-entreprise-verifiee",
    nom_legal: "Quisqueya Électro SA",
    nom_commercial: "Quisqueya Électro",
    nif: "001-234-567-8",
    registre_commerce: "RC-2019-00456",
    adresse_entreprise: "Route de Delmas 32, Port-au-Prince",
    telephone_professionnel: "+509 2222 3333",
    email_professionnel: "contact@quisqueya-electro.ht",
    representant_nom: "Marie Delva",
    representant_fonction: "Directrice Générale",
    secteur_activite: "Distribution d'équipements électroniques",
    taille_entreprise: "20-50 employés",
    statut_validation: "valide",
    date_soumission: "2026-01-15T09:30:00Z",
    date_validation: "2026-01-17T16:00:00Z",
  },
  {
    id: "profil-sud-solutions",
    utilisateur_id: "user-entreprise-en-attente",
    nom_legal: "Sud Solutions Énergie SARL",
    nif: "002-345-678-9",
    adresse_entreprise: "Rue Geffrard, Les Cayes",
    telephone_professionnel: "+509 4444 5555",
    email_professionnel: "info@sudsolutions.ht",
    representant_nom: "Patrick Joseph",
    representant_fonction: "Gérant",
    secteur_activite: "Installation solaire",
    statut_validation: "en_attente",
    date_soumission: "2026-08-05T11:00:00Z",
  },
  {
    id: "profil-nord-batiment",
    utilisateur_id: "user-entreprise-complement",
    nom_legal: "Nord Bâtiment & Climatisation",
    nif: "003-456-789-0",
    adresse_entreprise: "Boulevard Toussaint Louverture, Cap-Haïtien",
    telephone_professionnel: "+509 4444 6666",
    email_professionnel: "admin@nordbatiment.ht",
    representant_nom: "Nadine Charles",
    representant_fonction: "Responsable Achats",
    secteur_activite: "Climatisation commerciale",
    statut_validation: "complement_demande",
    date_soumission: "2026-07-20T08:00:00Z",
    commentaire_admin: "Le registre de commerce fourni est illisible — merci de le retéléverser.",
  },
];

export function trouverUtilisateurParEmail(email: string): Utilisateur | undefined {
  return utilisateurs.find((u) => u.email === email);
}

export function trouverProfilEntrepriseParUtilisateur(utilisateurId: string): ProfilEntreprise | undefined {
  return profilsEntreprise.find((p) => p.utilisateur_id === utilisateurId);
}
