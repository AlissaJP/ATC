// Raffinement Design (point #27) — filtrage et agrégation du journal des actions agents SAV, en fonctions
// pures (liste en paramètre, valeur en retour, aucun accès direct à lib/mock-data/journal-agents-sav.ts).
// Même découpage que lib/services/agents-sav.ts : ce qui devient une clause WHERE/GROUP BY SQL le jour
// d'une vraie table `agent_actions_log` reste isolé ici, sans toucher aux composants appelants.
import type { JournalActionAgentSav, TypeActionAgentSav } from "@/lib/types/entities";

export interface FiltresJournalAgentSav {
  codeAgent?: string;
  typeAction?: TypeActionAgentSav;
  depuis?: Date;
}

export function filtrerJournalAgentsSav(
  entrees: JournalActionAgentSav[],
  filtres: FiltresJournalAgentSav
): JournalActionAgentSav[] {
  return entrees
    .filter((e) => !filtres.codeAgent || e.codeAgent === filtres.codeAgent)
    .filter((e) => !filtres.typeAction || e.typeAction === filtres.typeAction)
    .filter((e) => !filtres.depuis || new Date(e.date) >= filtres.depuis)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export interface ChargeAgentSav {
  codeAgent: string;
  nombreActions: number;
}

// Charge de travail par agent sur la période déjà filtrée (compte simplement les entrées reçues) — le
// tri par volume décroissant met en avant les agents les plus sollicités.
export function compterActionsParAgent(entrees: JournalActionAgentSav[]): ChargeAgentSav[] {
  const compte = new Map<string, number>();
  for (const e of entrees) compte.set(e.codeAgent, (compte.get(e.codeAgent) ?? 0) + 1);
  return Array.from(compte.entries())
    .map(([codeAgent, nombreActions]) => ({ codeAgent, nombreActions }))
    .sort((a, b) => b.nombreActions - a.nombreActions);
}
