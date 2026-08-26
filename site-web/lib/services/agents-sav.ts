// Raffinement Design (point #26) — génération et vérification d'unicité du code agent SAV, isolées de
// tout accès direct au tableau mock (lib/mock-data/agents-sav.ts) : ces fonctions reçoivent la liste des
// agents existants en paramètre et renvoient une valeur, sans effet de bord. Ce découplage permet de les
// remplacer par une séquence PostgreSQL (ex. `nextval('agents_sav_code_seq')`) + une contrainte UNIQUE
// sur la colonne `code_agent`, lors de l'intégration d'une vraie base de données, sans réécrire la
// logique métier ni les appelants (lib/actions/agents-sav-admin.ts).
import type { CompteAgentSav } from "@/lib/types/entities";

const PREFIXE_CODE_AGENT = "SAV-";

// Dérive toujours un numéro strictement supérieur au plus grand existant (jamais de réutilisation d'un
// numéro laissé libre par une suppression) — même comportement qu'une colonne SERIAL/IDENTITY réelle.
export function genererCodeAgent(agentsExistants: CompteAgentSav[]): string {
  const dernierNumero = agentsExistants.reduce((max, agent) => {
    const n = Number(agent.codeAgent.slice(PREFIXE_CODE_AGENT.length));
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return `${PREFIXE_CODE_AGENT}${String(dernierNumero + 1).padStart(4, "0")}`;
}

export function codeAgentEstUnique(code: string, agentsExistants: CompteAgentSav[]): boolean {
  return !agentsExistants.some((agent) => agent.codeAgent === code);
}
