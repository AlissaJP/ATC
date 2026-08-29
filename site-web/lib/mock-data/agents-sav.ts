// Raffinement Design (point #26, fiche élargie — décision actée n°48) — annuaire mock des agents SAV (cf.
// lib/types/entities.ts). Mutations en place (push/splice), même convention que lib/mock-data/produits.ts,
// pour que les Server Components de app/admin/agents-sav voient la donnée à jour dès la prochaine requête
// serveur.
import type { CompteAgentSav } from "@/lib/types/entities";
import { genererCodeAgent, codeAgentEstUnique } from "@/lib/services/agents-sav";

export const agentsSav: CompteAgentSav[] = [
  {
    id: "agent-sav-seed-1",
    codeAgent: "WL-ATC-001",
    nom: "Wesner Louis",
    email: "wesner.louis@atc-demo.ht",
    telephone: "+509 3411 2233",
    date_embauche: "2023-03-06T00:00:00.000Z",
    specialite: "energie-solaire",
    ville: "Port-au-Prince",
    notes: "Référent installations résidentielles, formation MPPT niveau 2.",
    statut: "actif",
  },
  {
    id: "agent-sav-seed-2",
    codeAgent: "NC-ATC-001",
    nom: "Nadège Charles",
    email: "nadege.charles@atc-demo.ht",
    telephone: "+509 3722 8891",
    date_embauche: "2024-01-15T00:00:00.000Z",
    specialite: "securite",
    ville: "Pétion-Ville",
    statut: "actif",
  },
  {
    id: "agent-sav-seed-3",
    codeAgent: "JP-ATC-001",
    nom: "Jonas Pierre",
    email: "jonas.pierre@atc-demo.ht",
    telephone: "+509 3655 0147",
    date_embauche: "2022-09-01T00:00:00.000Z",
    specialite: "climatisation",
    ville: "Cap-Haïtien",
    notes: "En congé prolongé depuis juin 2026.",
    statut: "inactif",
  },
];

export interface AgentSavInputMock {
  nom: string;
  email: string;
  telephone: string;
  date_embauche: string;
  specialite: CompteAgentSav["specialite"];
  ville: string;
  notes?: string;
  statut: CompteAgentSav["statut"];
}

let compteurId = 0;
function idUniqueAgentSav(): string {
  compteurId += 1;
  return `agent-sav-${Date.now()}-${compteurId}`;
}

export function creerAgentSavMock(input: AgentSavInputMock): CompteAgentSav {
  const codeAgent = genererCodeAgent(input.nom, agentsSav);
  // Assertion de cohérence plutôt qu'un cas réellement atteignable : genererCodeAgent dérive toujours un
  // numéro supérieur au maximum existant pour ces initiales, donc unique par construction.
  // codeAgentEstUnique reste la fonction que remplacerait la contrainte UNIQUE PostgreSQL réelle — appelée
  // explicitement ici pour que la vérification d'unicité soit un fait vérifié, pas seulement présumé.
  if (!codeAgentEstUnique(codeAgent, agentsSav)) {
    throw new Error("Conflit de génération du code agent — logique de génération à revoir.");
  }

  const agent: CompteAgentSav = { id: idUniqueAgentSav(), codeAgent, ...input };
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
