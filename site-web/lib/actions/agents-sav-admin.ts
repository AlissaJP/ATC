"use server";

// Raffinement Design (point #26) — gestion de l'annuaire agents SAV (back-office, Admin Général
// uniquement). Même note d'architecture que lib/actions/catalogue-admin.ts : pas de session serveur dans
// cette démo (décision actée n°41), l'autorisation par rôle est appliquée côté UI uniquement
// (GardeRoleAdmin + masquage du lien dans AdminSidebar.tsx) — à refaire avec une vraie session serveur
// le jour d'un backend réel.
import { revalidatePath } from "next/cache";
import { agentsSav, creerAgentSavMock, modifierAgentSavMock, type AgentSavInputMock } from "@/lib/mock-data/agents-sav";

export interface ActionResult<T = undefined> {
  succes: boolean;
  erreur?: string;
  donnees?: T;
}

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function revaliderAgentsSav() {
  revalidatePath("/admin/agents-sav");
}

export async function creerAgentSavAction(
  input: AgentSavInputMock
): Promise<ActionResult<{ id: string; codeAgent: string }>> {
  if (!input.nom.trim()) return { succes: false, erreur: "Le nom complet est obligatoire." };
  if (!REGEX_EMAIL.test(input.email)) return { succes: false, erreur: "Adresse e-mail invalide." };
  if (agentsSav.some((a) => a.email.toLowerCase() === input.email.trim().toLowerCase())) {
    return { succes: false, erreur: "Un agent avec cet e-mail existe déjà." };
  }

  const agent = creerAgentSavMock({ ...input, nom: input.nom.trim(), email: input.email.trim() });
  revaliderAgentsSav();
  return { succes: true, donnees: { id: agent.id, codeAgent: agent.codeAgent } };
}

export async function modifierAgentSavAction(id: string, patch: Partial<AgentSavInputMock>): Promise<ActionResult> {
  if (patch.nom !== undefined && !patch.nom.trim()) {
    return { succes: false, erreur: "Le nom complet est obligatoire." };
  }
  if (patch.email !== undefined) {
    if (!REGEX_EMAIL.test(patch.email)) return { succes: false, erreur: "Adresse e-mail invalide." };
    if (agentsSav.some((a) => a.id !== id && a.email.toLowerCase() === patch.email!.trim().toLowerCase())) {
      return { succes: false, erreur: "Un autre agent utilise déjà cet e-mail." };
    }
  }

  const agent = modifierAgentSavMock(id, patch);
  if (!agent) return { succes: false, erreur: "Agent introuvable." };

  revaliderAgentsSav();
  return { succes: true };
}

// Bascule rapide actif/inactif depuis la liste, sans passer par le formulaire complet.
export async function basculerStatutAgentSavAction(id: string): Promise<ActionResult> {
  const agent = agentsSav.find((a) => a.id === id);
  if (!agent) return { succes: false, erreur: "Agent introuvable." };

  modifierAgentSavMock(id, { statut: agent.statut === "actif" ? "inactif" : "actif" });
  revaliderAgentsSav();
  return { succes: true };
}
