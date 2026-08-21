import { ModerationAvis } from "@/components/admin/ModerationAvis";

// ECR-12-003 — Modération des avis clients (back-office, accessible aux deux rôles admin — RG-12-002, UC-12-003).
export default function AdminAvisPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Avis clients</h1>
      <ModerationAvis />
    </main>
  );
}
