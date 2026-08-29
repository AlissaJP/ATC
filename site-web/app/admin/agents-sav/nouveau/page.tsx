import { CreationAgentSav } from "@/components/admin/CreationAgentSav";
import { GardeRoleAdmin } from "@/components/admin/GardeRoleAdmin";

// Raffinement Design (point #26, décision actée n°48) — page dédiée à la création d'un agent SAV
// (Général uniquement — RG-12-001), distincte de la fenêtre modale d'édition (GestionAgentsSav.tsx).
export default function AdminNouvelAgentSavPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Nouvel agent SAV</h1>
      <GardeRoleAdmin rolesAutorises={["general"]}>
        <CreationAgentSav />
      </GardeRoleAdmin>
    </main>
  );
}
