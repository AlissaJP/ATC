import { ModerationAvis } from "@/components/admin/ModerationAvis";
import type { StatutAvis } from "@/lib/types/entities";

const FILTRES_VALIDES: StatutAvis[] = ["en_attente_moderation", "publie", "rejete"];

// ECR-12-003 — Modération des avis clients (back-office, accessible aux deux rôles admin — RG-12-002, UC-12-003).
//
// `statut` : reçu des sous-liens de la sidebar (Section Administration, Raffinement Design), même idiome
// que /admin/devis.
export default async function AdminAvisPage(props: PageProps<"/admin/avis">) {
  const { statut } = await props.searchParams;
  const filtreInitial: StatutAvis | "tous" = FILTRES_VALIDES.includes(statut as StatutAvis)
    ? (statut as StatutAvis)
    : "en_attente_moderation";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Avis clients</h1>
      <ModerationAvis filtreInitial={filtreInitial} />
    </main>
  );
}
