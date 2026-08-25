import { TraitementDevis } from "@/components/admin/TraitementDevis";

const FILTRES_VALIDES = ["en_attente", "repondu", "resolu", "tous"] as const;
type FiltreDevis = (typeof FILTRES_VALIDES)[number];

export default async function AdminDevisPage(props: PageProps<"/admin/devis">) {
  const { statut } = await props.searchParams;
  const filtreInitial: FiltreDevis = FILTRES_VALIDES.includes(statut as FiltreDevis)
    ? (statut as FiltreDevis)
    : "en_attente";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Traitement des devis</h1>
      <TraitementDevis filtreInitial={filtreInitial} />
    </main>
  );
}
