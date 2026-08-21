// RG-12-001 — Exactement deux rôles administrateurs (décision actée n°20).
import type { Administrateur } from "@/lib/types/entities";

export const administrateurs: Administrateur[] = [
  { id: "admin-general", email: "admin.general@atc-demo.ht", nom: "Admin Général (démo)", role: "general" },
  { id: "admin-agent-sav", email: "agent.sav@atc-demo.ht", nom: "Agent SAV (démo)", role: "agent_sav" },
];
