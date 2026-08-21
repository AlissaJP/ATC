"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, Suspense, useState } from "react";
import { Heart, Menu, Search, ShoppingCart, X } from "lucide-react";
import { LogoMark } from "@/components/ui/LogoMark";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { SearchBar } from "@/components/layout/SearchBar";
import { BarreRechercheEtendue } from "@/components/layout/BarreRechercheEtendue";
import { CompteMenu } from "@/components/layout/CompteMenu";
import { categories } from "@/lib/mock-data/categories";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useCartStore } from "@/lib/store/cart-store";
import { useComptesStore } from "@/lib/store/comptes-store";
import { useSessionStore } from "@/lib/store/session-store";

const categoriesPrincipales = categories.filter((c) => !c.parent_id);

// Section 1.1 (Raffinement Design, validé) — en-tête à deux niveaux : barre utilitaire (logo, langue,
// compte, recherche, panier) puis navigation par catégories avec le lien Espace Entreprise à l'extrémité droite.
// Sur les pages catégorie/recherche (ECR-01-002/ECR-02-001), la recherche s'affiche en version étendue
// et pré-remplie au lieu de la simple icône ; l'icône Favoris n'apparaît que pour un client connecté (BF-08-004).
export function Header() {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [rechercheOuverte, setRechercheOuverte] = useState(false);
  const { t } = useTranslation();
  const pathname = usePathname();
  const nombreArticles = useCartStore((s) => s.lignes.reduce((n, l) => n + l.quantite, 0));
  const session = useSessionStore((s) => s.session);
  const favoris = useComptesStore((s) => s.favoris);
  const nombreFavoris =
    session?.type === "client" ? favoris.filter((f) => f.utilisateur_id === session.utilisateur_id).length : 0;

  const surPageCatalogue = pathname === "/recherche" || pathname.startsWith("/categorie/");

  return (
    <Fragment>
      {/* Niveau 1 — barre utilitaire, seule partie fixée au défilement */}
      <header className="sticky top-0 z-40 bg-background print:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-texte-principal md:hidden"
            aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOuvert}
            onClick={() => setMenuOuvert((v) => !v)}
          >
            {menuOuvert ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link href="/" className="shrink-0" aria-label="Accueil ATC">
            <LogoMark />
          </Link>

          {surPageCatalogue && (
            <div className="hidden max-w-md flex-1 md:block">
              <Suspense fallback={<SearchBar className="w-full" />}>
                <BarreRechercheEtendue />
              </Suspense>
            </div>
          )}

          <div className="ml-auto flex items-center gap-1 md:gap-2">
            <LanguageSelector />

            <CompteMenu />

            {session?.type === "client" && (
              <Link
                href="/compte/favoris"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg text-texte-principal hover:bg-fond"
                aria-label={`Favoris (${nombreFavoris})`}
              >
                <Heart size={22} />
                {nombreFavoris > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white">
                    {nombreFavoris}
                  </span>
                )}
              </Link>
            )}

            {!surPageCatalogue && (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-texte-principal hover:bg-fond"
                  aria-label={t("nav.recherche")}
                  aria-expanded={rechercheOuverte}
                  onClick={() => setRechercheOuverte((v) => !v)}
                >
                  <Search size={22} />
                </button>
                {rechercheOuverte && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setRechercheOuverte(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-80">
                      <SearchBar autoFocus onNavigate={() => setRechercheOuverte(false)} />
                    </div>
                  </>
                )}
              </div>
            )}

            <Link
              href="/panier"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg text-texte-principal hover:bg-fond"
              aria-label={`${t("nav.panier")} (${nombreArticles})`}
            >
              <ShoppingCart size={22} />
              {nombreArticles > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white">
                  {nombreArticles}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Niveau 2 — navigation par catégories, sur le fond de la page (non fixée), pas sur le blanc de l'en-tête */}
      <nav className="hidden bg-fond py-2.5 md:block print:hidden" aria-label="Catégories">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            {categoriesPrincipales.map((cat) => (
              <Link
                key={cat.id}
                href={`/categorie/${cat.slug}`}
                className="font-titres text-base font-semibold text-texte-principal transition-colors hover:text-primaire"
              >
                {t(`nav.${cat.slug === "energie-solaire" ? "energieSolaire" : cat.slug}`)}
              </Link>
            ))}
            <Link
              href="/packages"
              className="font-titres text-base font-semibold text-primaire-clair transition-colors hover:text-primaire"
            >
              {t("nav.packages")}
            </Link>
          </div>

          <Link
            href="/compte/inscription-entreprise"
            className="font-titres text-base font-semibold text-texte-principal transition-colors hover:text-primaire"
          >
            {t("nav.espaceEntreprise")}
          </Link>
        </div>
      </nav>

      {menuOuvert && (
        <nav
          className="border-t border-bordure bg-background px-4 py-4 md:hidden print:hidden"
          aria-label="Catégories (mobile)"
        >
          <SearchBar className="mb-3 w-full" onNavigate={() => setMenuOuvert(false)} />
          <ul className="flex flex-col gap-1">
            {categoriesPrincipales.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/categorie/${cat.slug}`}
                  className="block rounded-lg px-3 py-3 font-titres text-base font-semibold text-texte-principal hover:bg-fond"
                  onClick={() => setMenuOuvert(false)}
                >
                  {t(`nav.${cat.slug === "energie-solaire" ? "energieSolaire" : cat.slug}`)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/packages"
                className="block rounded-lg px-3 py-3 font-titres text-base font-semibold text-primaire-clair hover:bg-fond"
                onClick={() => setMenuOuvert(false)}
              >
                {t("nav.packages")}
              </Link>
            </li>
            <li>
              <Link
                href="/compte/inscription-entreprise"
                className="block rounded-lg px-3 py-3 font-titres text-base font-semibold text-texte-principal hover:bg-fond"
                onClick={() => setMenuOuvert(false)}
              >
                {t("nav.espaceEntreprise")}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </Fragment>
  );
}
