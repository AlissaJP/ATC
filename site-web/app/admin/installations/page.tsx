import { GestionInstallations } from "@/components/admin/GestionInstallations";

// BF-12-009 (volet installation) / UC-09-001 — Gestion des demandes d'installation solaire.
export default function AdminInstallationsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Installations</h1>
      <GestionInstallations />
    </main>
  );
}
