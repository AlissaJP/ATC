import { GestionSAV } from "@/components/admin/GestionSAV";
import type { StatutTicketSAV } from "@/lib/types/entities";

const FILTRES_VALIDES: StatutTicketSAV[] = ["ouvert", "en_cours", "resolu", "ferme"];

// BF-12-009 — Gestion des tickets SAV (back-office, accessible aux deux rôles admin — RG-12-001).
//
// `statut` : reçu des sous-liens de la sidebar (Section Administration, Raffinement Design), même idiome
// que /admin/devis.
export default async function AdminSavPage(props: PageProps<"/admin/sav">) {
  const { statut } = await props.searchParams;
  const filtreInitial: StatutTicketSAV | "tous" = FILTRES_VALIDES.includes(statut as StatutTicketSAV)
    ? (statut as StatutTicketSAV)
    : "ouvert";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">SAV &amp; Assistance</h1>
      <GestionSAV filtreInitial={filtreInitial} />
    </main>
  );
}
