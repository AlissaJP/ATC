import { questionsFAQ } from "@/lib/mock-data/faq";
import { pagesLegales } from "@/lib/mock-data/contenu-legal";
import type { SlugPageLegale } from "@/lib/mock-data/contenu-legal";
import { categories } from "@/lib/mock-data/categories";
import { GestionContenu } from "@/components/admin/GestionContenu";

const ONGLETS_VALIDES: SlugPageLegale[] = ["cgv", "confidentialite", "mentions-legales"];

// ECR-12-004 (BF-12-011, Must have — décision actée n°9) — Gestion du contenu (FAQ, textes légaux)
// depuis le back-office. Accessible aux deux rôles admin (ni gestion des prix ni Paramètres généraux —
// RG-12-001 ne le restreint pas). Server Component : lit les tableaux mock-data côté serveur à chaque
// requête, pour que les mutations admin (lib/actions/contenu-admin.ts) restent visibles sans redémarrage.
export default async function AdminContenuPage(props: PageProps<"/admin/contenu">) {
  const { onglet } = await props.searchParams;
  const ongletInitial =
    onglet === "faq" || ONGLETS_VALIDES.includes(onglet as SlugPageLegale) ? (onglet as "faq" | SlugPageLegale) : "faq";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Contenu</h1>
      <GestionContenu
        questionsFAQ={questionsFAQ}
        pagesLegales={pagesLegales}
        categories={categories}
        ongletInitial={ongletInitial}
      />
    </main>
  );
}
