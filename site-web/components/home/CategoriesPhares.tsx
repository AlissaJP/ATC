"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Cpu } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

// BF-01-008 — Mise en avant des catégories phares (structure : Raffinement Design Section 1.2, validé).
// Réutilise les clés de traduction "nav.*" (components/layout/Header.tsx) puisqu'il s'agit des mêmes catégories.
const CARTES = [
  {
    slug: "energie-solaire",
    cleTraduction: "nav.energieSolaire",
    cleAccroche: "accueil.categorieEnergieAccroche",
    // energie-06.webp (suggestion initiale) montre en réalité une batterie de marque tierce non liée
    // à ATC — écarté (même famille de problème que l'Axe 2 du rapport d'audit) ; energie-17 est propre.
    image: "/images/energie-solaire/energie-17.webp",
  },
  {
    slug: "electronique",
    cleTraduction: "nav.electronique",
    cleAccroche: "accueil.categorieElectroniqueAccroche",
    image: null,
  },
  {
    slug: "securite",
    cleTraduction: "nav.securite",
    cleAccroche: "accueil.categorieSecuriteAccroche",
    // produit-isole-01.webp (suggestion initiale) est le visuel taché identifié à l'Axe 2 (marque tierce
    // "SMART+" + bandeau marketing) — remplacé par produit-isole-03.webp, déjà retenu comme alternative
    // propre pour ce même produit dans lib/mock-data/produits.ts.
    image: "/images/securite/camera-ptz-solaire-produit-isole-produit-isole-03.webp",
  },
  {
    slug: "climatisation",
    cleTraduction: "nav.climatisation",
    cleAccroche: "accueil.categorieClimatisationAccroche",
    image: "/images/climatisation/climatisation-07-recadre.webp",
  },
] as const;

export function CategoriesPhares() {
  const { t } = useTranslation();

  return (
    <section>
      <h2 className="mb-6 font-titres text-2xl font-bold text-texte-principal">{t("accueil.categoriesPhares")}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {CARTES.map((cat, index) => (
          <Link
            key={cat.slug}
            href={`/categorie/${cat.slug}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-fond"
          >
            {cat.image ? (
              <Image
                src={cat.image}
                alt={t(cat.cleTraduction)}
                fill
                priority={index === 0}
                className="object-cover object-top transition-transform duration-200 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primaire to-primaire-clair">
                <Cpu size={40} className="text-white/90" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-texte-principal/80 via-texte-principal/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="font-titres text-sm font-semibold text-white sm:text-base">{t(cat.cleTraduction)}</p>
              <p className="mt-0.5 text-xs text-white/80 sm:text-sm">{t(cat.cleAccroche)}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-white transition-transform group-hover:translate-x-0.5">
                {t("accueil.categorieDecouvrir")}
                <ArrowRight size={13} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
