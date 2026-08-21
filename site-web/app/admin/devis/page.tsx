import { TraitementDevis } from "@/components/admin/TraitementDevis";

export default function AdminDevisPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Traitement des devis</h1>
      <TraitementDevis />
    </main>
  );
}
