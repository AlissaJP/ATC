// Guide Administrateur §« Traitement des dossiers » — un dossier (devis, profil Entreprise en attente
// de vérification) est signalé au tableau de bord quand il attend depuis plus de 48 heures.
export function enAttenteDepuisPlusDe48h(dateIso: string): boolean {
  const heuresEcoulees = (Date.now() - new Date(dateIso).getTime()) / (1000 * 60 * 60);
  return heuresEcoulees > 48;
}
