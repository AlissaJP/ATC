// Raffinement Design (point #26) — annuaire mock des agents SAV (décision actée n°45, cf.
// lib/types/entities.ts). Mutations en place (push/splice), même convention que
// lib/mock-data/produits.ts, pour que les Server Components de app/admin/agents-sav voient la donnée à
// jour dès la prochaine requête serveur.
import type { CompteAgentSav } from "@/lib/types/entities";
import { genererCodeAgent, codeAgentEstUnique } from "@/lib/services/agents-sav";

export const agentsSav: CompteAgentSav[] = [
  { id: "agent-sav-seed-1", codeAgent: "SAV-0001", nom: "Wesner Louis", email: "wesner.louis@atc-demo.ht", statut: "actif" },
  { id: "agent-sav-seed-2", codeAgent: "SAV-0002", nom: "Nadège Charles", email: "nadege.charles@atc-demo.ht", statut: "actif" },
  { id: "agent-sav-seed-3", codeAgent: "SAV-0003", nom: "Jonas Pierre", email: "jonas.pierre@atc-demo.ht", statut: "inactif" },
];

export interface AgentSavInputMock {
  nom: string;
  email: string;
  statut: CompteAgentSav["statut"];
}

let compteurId = 0;
function idUniqueAgentSav(): string {
  compteurId += 1;
  return `agent-sav-${Date.now()}-${compteurId}`;
}

export function creerAgentSavMock(input: AgentSavInputMock): CompteAgentSav {
  const codeAgent = genererCodeAgent(agentsSav);
  // Assertion de cohérence plutôt qu'un cas réellement atteignable : genererCodeAgent dérive toujours un
  // numéro supérieur au maximum existant, donc unique par construction. codeAgentEstUnique reste la
  // fonction que remplacerait la contrainte UNIQUE PostgreSQL réelle — appelée explicitement ici pour que
  // la vérification d'unicité soit un fait vérifié, pas seulement présumé.
  if (!codeAgentEstUnique(codeAgent, agentsSav)) {
    throw new Error("Conflit de génération du code agent — logique de génération à revoir.");
  }

  const agent: CompteAgentSav = { id: idUniqueAgentSav(), codeAgent, nom: input.nom, email: input.email, statut: input.statut };
  agentsSav.push(agent);
  return agent;
}

export function modifierAgentSavMock(id: string, patch: Partial<AgentSavInputMock>): CompteAgentSav | undefined {
  const index = agentsSav.findIndex((a) => a.id === id);
  if (index === -1) return undefined;
  const maj: CompteAgentSav = { ...agentsSav[index], ...patch };
  agentsSav.splice(index, 1, maj);
  return maj;
}
