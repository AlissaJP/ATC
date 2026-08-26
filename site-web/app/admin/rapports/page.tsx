import { RapportFinancierMensuel } from "@/components/admin/RapportFinancierMensuel";
import { GardeRoleAdmin } from "@/components/admin/GardeRoleAdmin";

// Raffinement Design (point #28) — rapport financier mensuel (back-office, Général uniquement — RG-12-001).
export default function AdminRapportsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <h1 className="mb-2 font-titres text-2xl font-bold text-texte-principal print:hidden">
        Rapports financiers
      </h1>
      <p className="mb-6 text-sm text-texte-secondaire print:hidden">
        Chiffre d&apos;affaires, taxe collectée et répartition par moyen de paiement, par mois.
      </p>
      <GardeRoleAdmin rolesAutorises={["general"]}>
        <RapportFinancierMensuel />
      </GardeRoleAdmin>
    </main>
  );
}
