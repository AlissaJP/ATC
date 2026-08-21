// ECR-01-001 — Page d'accueil. BF-01-001, BF-01-008 à BF-01-011, UC-01-001.
// Le Footer affiche aussi une version 3 éléments du bloc de réassurance, sur toutes les pages
// (voir components/layout/Footer.tsx) — BlocReassurance ci-dessous est la version 4 éléments
// propre à l'accueil (Raffinement Design Section 1.4).
import { BanniereSolaire } from "@/components/home/BanniereSolaire";
import { CategoriesPhares } from "@/components/home/CategoriesPhares";
import { BlocDevenirPro } from "@/components/home/BlocDevenirPro";
import { BlocReassurance } from "@/components/home/BlocReassurance";
import { BlocChiffresCles } from "@/components/home/BlocChiffresCles";

export default function AccueilPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 py-8 md:px-6 md:py-12">
      <BanniereSolaire />
      <CategoriesPhares />
      <BlocDevenirPro />
      <BlocReassurance />
      <BlocChiffresCles />
    </main>
  );
}
