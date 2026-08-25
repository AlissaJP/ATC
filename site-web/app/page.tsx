// ECR-01-001 — Page d'accueil. BF-01-001, BF-01-008 à BF-01-011, UC-01-001.
// Le Footer affiche aussi une version 3 éléments du bloc de réassurance, sur toutes les pages
// (voir components/layout/Footer.tsx) — BlocReassurance ci-dessous est la version 4 éléments
// propre à l'accueil (Raffinement Design Section 1.4).
import { BanniereSolaire } from "@/components/home/BanniereSolaire";
import { CategoriesPhares } from "@/components/home/CategoriesPhares";
import { BlocDevenirPro } from "@/components/home/BlocDevenirPro";
import { BlocReassurance } from "@/components/home/BlocReassurance";
import { BlocChiffresCles } from "@/components/home/BlocChiffresCles";
import { listerProduitsEnrichis } from "@/lib/services/catalogue";

// Nombre "en extérieur" par bloc catégorie sur l'accueil (Raffinement Design, prompt d'approfondissement
// des catégories) : jusqu'à 7 — Sécurité et Climatisation n'ont que 3 produits chacune dans ce catalogue
// de démonstration, donc affichées en totalité plutôt que complétées par des produits hors-sujet.
const NOMBRE_PRODUITS_PAR_BLOC = 7;

export default async function AccueilPage() {
  const slugs = ["energie-solaire", "securite", "climatisation"];
  const listes = await Promise.all(slugs.map((slug) => listerProduitsEnrichis(slug)));
  const produitsParCategorie = Object.fromEntries(
    slugs.map((slug, i) => [slug, listes[i].slice(0, NOMBRE_PRODUITS_PAR_BLOC)])
  );

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 py-8 md:px-6 md:py-12">
      <BanniereSolaire />
      <CategoriesPhares produitsParCategorie={produitsParCategorie} />
      <BlocDevenirPro />
      <BlocReassurance />
      <BlocChiffresCles />
    </main>
  );
}
