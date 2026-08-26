// Raffinement Design (point #27) — journal mock des actions par agent SAV (décision actée n°46, cf.
// lib/types/entities.ts). Lecture seule dans cette démo : aucune mutation UI ne l'alimente (pas de vraie
// prise en charge de commande/ticket branchée ici) — les entrées ci-dessous simulent un historique déjà
// constitué, pour tester l'affichage et les filtres (Raffinement Design, point #27).
import type { JournalActionAgentSav } from "@/lib/types/entities";

const maintenant = Date.now();
const ilYA = (jours: number, heure = 9) => {
  const d = new Date(maintenant - jours * 24 * 60 * 60 * 1000);
  d.setHours(heure, 0, 0, 0);
  return d.toISOString();
};

export const journalAgentsSav: JournalActionAgentSav[] = [
  { id: "log-1", codeAgent: "SAV-0001", typeAction: "ticket_pris_en_charge", referenceCommande: "ticket-seed-ouvert", date: ilYA(0.5, 10) },
  { id: "log-2", codeAgent: "SAV-0001", typeAction: "reponse_client", referenceCommande: "ticket-seed-ouvert", date: ilYA(0.4, 11) },
  { id: "log-3", codeAgent: "SAV-0002", typeAction: "commande_prise_en_charge", referenceCommande: "#4F2A9C1B", date: ilYA(1, 9) },
  { id: "log-4", codeAgent: "SAV-0002", typeAction: "commande_traitee", referenceCommande: "#4F2A9C1B", date: ilYA(1, 14) },
  { id: "log-5", codeAgent: "SAV-0001", typeAction: "ticket_pris_en_charge", referenceCommande: "ticket-seed-en-cours", date: ilYA(3, 8) },
  { id: "log-6", codeAgent: "SAV-0001", typeAction: "reponse_client", referenceCommande: "ticket-seed-en-cours", date: ilYA(3, 9) },
  { id: "log-7", codeAgent: "SAV-0002", typeAction: "commande_prise_en_charge", referenceCommande: "#7B31E084", date: ilYA(5, 10) },
  { id: "log-8", codeAgent: "SAV-0002", typeAction: "commande_traitee", referenceCommande: "#7B31E084", date: ilYA(5, 16) },
  { id: "log-9", codeAgent: "SAV-0003", typeAction: "ticket_pris_en_charge", referenceCommande: "ticket-seed-resolu", date: ilYA(8, 9) },
  { id: "log-10", codeAgent: "SAV-0003", typeAction: "reponse_client", referenceCommande: "ticket-seed-resolu", date: ilYA(8, 10) },
  { id: "log-11", codeAgent: "SAV-0003", typeAction: "ticket_resolu", referenceCommande: "ticket-seed-resolu", date: ilYA(7, 15) },
  { id: "log-12", codeAgent: "SAV-0001", typeAction: "commande_prise_en_charge", referenceCommande: "#1D9F6E52", date: ilYA(12, 9) },
  { id: "log-13", codeAgent: "SAV-0001", typeAction: "commande_traitee", referenceCommande: "#1D9F6E52", date: ilYA(12, 13) },
  { id: "log-14", codeAgent: "SAV-0002", typeAction: "reponse_client", referenceCommande: "#7B31E084", date: ilYA(20, 11) },
  { id: "log-15", codeAgent: "SAV-0001", typeAction: "commande_prise_en_charge", referenceCommande: "#9A4C7731", date: ilYA(25, 9) },
];
