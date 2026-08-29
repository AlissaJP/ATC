// Raffinement Design (point #26, schéma de code révisé — décision actée n°48) — génération et
// vérification d'unicité du code agent SAV, isolées de tout accès direct au tableau mock
// (lib/mock-data/agents-sav.ts) : ces fonctions reçoivent la liste des agents existants en paramètre et
// renvoient une valeur, sans effet de bord. Ce découplage permet de les remplacer par une séquence
// PostgreSQL + une contrainte UNIQUE sur la colonne `code_agent`, lors de l'intégration d'une vraie base
// de données, sans réécrire la logique métier ni les appelants (lib/actions/agents-sav-admin.ts).
import type { CompteAgentSav } from "@/lib/types/entities";

const SIGLE = "ATC";

// Initiales du nom complet (un caractère par mot, ex. "Wesner Louis" → "WL", "Jean Paul Duval" → "JPD").
// "AG" par défaut si le nom ne contient aucune lettre exploitable (garde-fou, cas normalement inatteignable
// puisque le nom est obligatoire côté validation — lib/actions/agents-sav-admin.ts).
function initialesDepuisNom(nom: string): string {
  const initiales = nom
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((mot) => mot.charAt(0).toUpperCase())
    .join("");
  return initiales || "AG";
}

// Format "{INITIALES}-ATC-{numéro}" — le numéro reste propre à chaque combinaison d'initiales (pas un
// compteur global) : deux agents aux initiales différentes ne se disputent pas la même séquence, et deux
// agents aux mêmes initiales (ex. deux "Jean Pierre") obtiennent WL-ATC-001 / WL-ATC-002 sans collision.
// Dérive toujours un numéro strictement supérieur au plus grand existant pour cette combinaison (jamais de
// réutilisation d'un numéro laissé libre par une suppression) — même comportement qu'une colonne
// SERIAL/IDENTITY réelle filtrée par préfixe.
export function genererCodeAgent(nom: string, agentsExistants: CompteAgentSav[]): string {
  const base = `${initialesDepuisNom(nom)}-${SIGLE}-`;
  const dernierNumero = agentsExistants.reduce((max, agent) => {
    if (!agent.codeAgent.startsWith(base)) return max;
    const n = Number(agent.codeAgent.slice(base.length));
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return `${base}${String(dernierNumero + 1).padStart(3, "0")}`;
}

export function codeAgentEstUnique(code: string, agentsExistants: CompteAgentSav[]): boolean {
  return !agentsExistants.some((agent) => agent.codeAgent === code);
}
