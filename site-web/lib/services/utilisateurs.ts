// Couche d'accès aux données — utilisateurs et profils Entreprise. RG-08-001.
import {
  trouverProfilEntrepriseParUtilisateur,
  trouverUtilisateurParEmail,
  utilisateurs,
} from "@/lib/mock-data/utilisateurs";

export async function authentifier(email: string): Promise<
  ReturnType<typeof trouverUtilisateurParEmail>
> {
  // Démo/sandbox (décision actée n°41) : aucune vérification de mot de passe réelle.
  return trouverUtilisateurParEmail(email);
}

export async function obtenirProfilEntreprise(utilisateurId: string) {
  return trouverProfilEntrepriseParUtilisateur(utilisateurId);
}

export async function listerComptesDemonstration() {
  return utilisateurs;
}
