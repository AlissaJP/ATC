// Couche d'accès aux données — authentification. Combine les comptes de test seedés
// (lib/mock-data/utilisateurs.ts) et les comptes créés dynamiquement pendant la démo
// (lib/store/comptes-store.ts). Décision actée n°41 : sandbox, aucune vérification de mot de passe réelle.
import { utilisateurs as utilisateursSeed, trouverProfilEntrepriseParUtilisateur } from "@/lib/mock-data/utilisateurs";
import { administrateurs } from "@/lib/mock-data/administrateurs";
import { useComptesStore } from "@/lib/store/comptes-store";
import type { ProfilEntreprise, Utilisateur } from "@/lib/types/entities";

export function trouverUtilisateurConnexion(email: string): Utilisateur | undefined {
  const emailNormalise = email.trim().toLowerCase();
  const dynamiques = useComptesStore.getState().utilisateurs;
  return (
    utilisateursSeed.find((u) => u.email.toLowerCase() === emailNormalise) ??
    dynamiques.find((u) => u.email.toLowerCase() === emailNormalise)
  );
}

export function trouverAdministrateurConnexion(email: string) {
  const emailNormalise = email.trim().toLowerCase();
  return administrateurs.find((a) => a.email.toLowerCase() === emailNormalise);
}

export function trouverProfilEntrepriseCombine(utilisateurId: string): ProfilEntreprise | undefined {
  return (
    trouverProfilEntrepriseParUtilisateur(utilisateurId) ??
    useComptesStore.getState().profilsEntreprise.find((p) => p.utilisateur_id === utilisateurId)
  );
}
