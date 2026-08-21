"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/layout/SearchBar";

// Isolé dans son propre composant car useSearchParams() exige une frontière Suspense (Next.js App
// Router) — on la garde restreinte à cette seule barre plutôt que d'y forcer tout le Header.
export function BarreRechercheEtendue() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requeteInitiale = pathname === "/recherche" ? (searchParams.get("q") ?? "") : "";

  return <SearchBar key={pathname + requeteInitiale} className="w-full" valeurInitiale={requeteInitiale} />;
}
