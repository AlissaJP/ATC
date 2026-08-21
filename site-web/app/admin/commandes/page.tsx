import { GestionCommandes } from "@/components/admin/GestionCommandes";

export default function AdminCommandesPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Commandes</h1>
      <GestionCommandes />
    </main>
  );
}
