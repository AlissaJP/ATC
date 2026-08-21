import { ValidationEntreprises } from "@/components/admin/ValidationEntreprises";

export default function AdminEntreprisesPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Dossiers Entreprise</h1>
      <ValidationEntreprises />
    </main>
  );
}
