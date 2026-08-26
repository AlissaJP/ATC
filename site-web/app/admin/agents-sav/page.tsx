import { agentsSav } from "@/lib/mock-data/agents-sav";
import { GestionAgentsSav } from "@/components/admin/GestionAgentsSav";
import { GardeRoleAdmin } from "@/components/admin/GardeRoleAdmin";

// Raffinement Design (point #26) — annuaire des agents SAV (back-office, Général uniquement — RG-12-001).
// Distinct des « Comptes administrateurs » (app/admin/comptes/page.tsx, RG-12-001, décision actée n°20) :
// ceci gère un annuaire de suivi à nombre quelconque d'agents, pas les comptes de connexion stricts.
// Server Component : lit le tableau mock-data côté serveur à chaque requête, pour que les mutations admin
// (lib/actions/agents-sav-admin.ts) restent visibles sans redémarrage du serveur de dev.
export default function AdminAgentsSavPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <h1 className="mb-2 font-titres text-2xl font-bold text-texte-principal">Agents SAV</h1>
      <p className="mb-6 text-sm text-texte-secondaire">
        Annuaire des agents SAV — code agent généré automatiquement à la création.
      </p>
      <GardeRoleAdmin rolesAutorises={["general"]}>
        <GestionAgentsSav agents={agentsSav} />
      </GardeRoleAdmin>
    </main>
  );
}
