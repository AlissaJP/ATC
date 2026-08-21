import { Statistiques } from "@/components/admin/Statistiques";
import { GardeRoleAdmin } from "@/components/admin/GardeRoleAdmin";

// ECR-15-001 — Statistiques (back-office, Général uniquement — UC-15-001 acteur ADM-G).
export default function AdminStatistiquesPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Statistiques</h1>
      <GardeRoleAdmin rolesAutorises={["general"]}>
        <Statistiques />
      </GardeRoleAdmin>
    </main>
  );
}
