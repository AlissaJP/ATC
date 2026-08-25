import { TableauDeBord } from "@/components/admin/TableauDeBord";

// ECR-12-001 — Tableau de bord admin (back-office). Titre + message d'accueil gérés dans TableauDeBord
// (dépend du prénom de l'administrateur connecté, lu côté client).
export default function AdminAccueilPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
      <TableauDeBord />
    </main>
  );
}
