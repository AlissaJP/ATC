// Couche d'accès aux données — utilisateurs et profils Entreprise. RG-08-001.
import {
  trouverProfilEntrepriseParUtilisateur,
  trouverUtilisateurParEmail,
  utilisateurs,
} from "@/lib/mock-data/utilisateurs";
import type { Utilisateur } from "@/lib/types/entities";

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

// Nom d'un client pour le back-office : comptes de démonstration, puis comptes créés sur le site
// (comptes-store, passé par l'appelant car ce store vit côté navigateur).
export function nomClient(utilisateurId: string | undefined, utilisateursDynamiques: Utilisateur[]): string {
  if (!utilisateurId) return "—";
  return (
    utilisateurs.find((u) => u.id === utilisateurId)?.nom ??
    utilisateursDynamiques.find((u) => u.id === utilisateurId)?.nom ??
    "Client"
  );
}
