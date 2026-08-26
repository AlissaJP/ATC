import { agentsSav } from "@/lib/mock-data/agents-sav";
import { journalAgentsSav } from "@/lib/mock-data/journal-agents-sav";
import { HistoriqueAgentsSav } from "@/components/admin/HistoriqueAgentsSav";
import { GardeRoleAdmin } from "@/components/admin/GardeRoleAdmin";

// Raffinement Design (point #27) — historique des actions par agent SAV (back-office, lecture seule,
// Général uniquement — RG-12-001). Server Component : lit les tableaux mock-data côté serveur.
export default function AdminHistoriqueAgentsSavPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <h1 className="mb-2 font-titres text-2xl font-bold text-texte-principal">Historique des actions — Agents SAV</h1>
      <p className="mb-6 text-sm text-texte-secondaire">
        Journal en lecture seule : prise en charge, traitement, réponses aux clients.
      </p>
      <GardeRoleAdmin rolesAutorises={["general"]}>
        <HistoriqueAgentsSav entrees={journalAgentsSav} agents={agentsSav} />
      </GardeRoleAdmin>
    </main>
  );
}
