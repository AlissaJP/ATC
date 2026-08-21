import { GestionClients } from "@/components/admin/GestionClients";

// Onglet "Clients" de RG-12-001 — accessible aux deux rôles admin (Général et Agent SAV).
export default function AdminClientsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Clients</h1>
      <GestionClients />
    </main>
  );
}
