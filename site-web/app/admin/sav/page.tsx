import { GestionSAV } from "@/components/admin/GestionSAV";

// BF-12-009 — Gestion des tickets SAV (back-office, accessible aux deux rôles admin — RG-12-001).
export default function AdminSavPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">SAV &amp; Assistance</h1>
      <GestionSAV />
    </main>
  );
}
