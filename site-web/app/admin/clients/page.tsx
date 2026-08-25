import { GestionClients } from "@/components/admin/GestionClients";
import type { TypeCompte } from "@/lib/types/entities";

// Onglet "Clients" de RG-12-001 — accessible aux deux rôles admin (Général et Agent SAV).
const TYPES_VALIDES: TypeCompte[] = ["particulier", "entreprise"];

export default async function AdminClientsPage(props: PageProps<"/admin/clients">) {
  const { type } = await props.searchParams;
  const filtreInitial = TYPES_VALIDES.includes(type as TypeCompte) ? (type as TypeCompte) : "tous";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Clients</h1>
      <GestionClients filtreInitial={filtreInitial} />
    </main>
  );
}
