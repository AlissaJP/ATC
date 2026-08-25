import { GestionCommandes } from "@/components/admin/GestionCommandes";
import type { StatutCommande } from "@/lib/types/entities";

const STATUTS_VALIDES: StatutCommande[] = ["en_preparation", "prete_retrait", "retiree"];

export default async function AdminCommandesPage(props: PageProps<"/admin/commandes">) {
  const { statut } = await props.searchParams;
  const filtreInitial = STATUTS_VALIDES.includes(statut as StatutCommande) ? (statut as StatutCommande) : "tous";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Commandes</h1>
      <GestionCommandes filtreInitial={filtreInitial} />
    </main>
  );
}
