"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { produits } from "@/lib/mock-data/produits";
import { stardom } from "@/lib/fonts/stardom";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
import type { Produit } from "@/lib/types/entities";

const panneauVitrine = produits.find((p) => p.id === "prod-panneau-405w")!;
const batterieVitrine = produits.find((p) => p.id === "prod-batterie-lithium-100ah")!;

// BF-01-009 — Bannière d'accueil (structure : Raffinement Design Section 1.1, validé sur le modèle fourni).
// Deux colonnes asymétriques, photo bord perdu (sans cadre), cartes produit flottantes à profondeurs différentes.
export function BanniereSolaire() {
  const { t } = useTranslation();

  return (
    <section className="relative">
      <div className="flex flex-col-reverse md:flex-row md:items-stretch">
        <div className="flex flex-col justify-center gap-4 py-10 md:w-[43%] md:py-14 md:pr-10">
          <p className="font-titres text-sm font-semibold uppercase tracking-wide text-accent">
            {t("accueil.heroAccroche")}
          </p>
          <h1
            className={`${stardom.className} text-4xl leading-tight text-texte-principal sm:text-5xl md:text-[3.25rem]`}
          >
            {t("accueil.heroTitre")}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/packages/configurateur"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              {t("accueil.heroCtaPrincipal")}
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/categorie/energie-solaire"
              className="inline-flex items-center gap-2 rounded-lg border border-bordure px-5 py-3 text-sm font-semibold text-texte-principal transition-colors hover:border-primaire hover:text-primaire"
            >
              {t("accueil.heroCtaSecondaire")}
            </Link>
          </div>

          {/* Mobile : les cartes flottantes ne fonctionnent pas en superposition sur petit écran (Section 1.1) */}
          <div className="mt-2 grid grid-cols-2 gap-3 md:hidden">
            <CarteProduitVitrine produit={panneauVitrine} />
            <CarteProduitVitrine produit={batterieVitrine} />
          </div>
        </div>

        <div className="relative min-h-[320px] md:min-h-[520px] md:w-[57%]">
          <ParallaxImage amplitude={36}>
            <Image
              src="/images/energie-solaire/energie-16-retouche.webp"
              alt="Techniciens ATC installant un champ de panneaux solaires, Port-au-Prince"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 768px) 57vw, 100vw"
            />
          </ParallaxImage>

          {/* Cartes flottantes à deux profondeurs (desktop uniquement) — l'une chevauche le point de jonction
              texte/photo en haut, l'autre repose plus bas et plus proche du bord, comme dans le modèle. */}
          <div className="pointer-events-none absolute inset-0 hidden md:block">
            <div className="pointer-events-auto absolute -left-8 top-10 z-10">
              <CarteProduitVitrine produit={panneauVitrine} taille="petite" />
            </div>
            <div className="pointer-events-auto absolute bottom-10 right-8 z-20">
              <CarteProduitVitrine produit={batterieVitrine} taille="grande" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CarteProduitVitrine({
  produit,
  taille = "grande",
}: {
  produit: Produit;
  taille?: "petite" | "grande";
}) {
  return (
    <Link
      href={`/produit/${produit.slug}`}
      className={`block overflow-hidden rounded-lg border border-bordure bg-background shadow-lg transition-transform hover:-translate-y-0.5 ${
        taille === "grande" ? "w-40 sm:w-44" : "w-32 sm:w-36"
      }`}
    >
      <div className="relative aspect-square w-full bg-fond">
        {produit.images[0] ? (
          <Image src={produit.images[0]} alt="" fill className="object-cover" sizes="180px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-center text-[11px] text-texte-secondaire">
            Image à venir
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="truncate font-titres text-xs font-semibold text-texte-principal">{produit.nom}</p>
        <p className="text-xs text-texte-secondaire">${produit.prix_public.toFixed(0)}</p>
      </div>
    </Link>
  );
}
