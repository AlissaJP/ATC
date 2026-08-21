"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

const AVANTAGES = [
  "Barème de prix par palier de quantité",
  "Facturation pro forma automatique",
  "Devis pour packages solaires sur-mesure",
];

// BF-01-010 — Section « Devenir client professionnel » incitant à l'inscription B2B (RG-08-001).
export function BlocDevenirPro() {
  const { t } = useTranslation();

  return (
    <section className="grid gap-8 overflow-hidden rounded-2xl border border-bordure bg-fond md:grid-cols-2">
      <div className="relative order-2 hidden min-h-[280px] md:order-1 md:block">
        <Image
          src="/images/energie-solaire/energie-15.webp"
          alt="Installation de panneaux solaires par l'équipe ATC, vue panoramique"
          fill
          className="object-cover"
          sizes="50vw"
        />
      </div>
      <div className="order-1 flex flex-col justify-center p-6 sm:p-10 md:order-2">
        <h2 className="mt-2 font-titres text-2xl font-bold text-texte-principal md:text-3xl">
          {t("accueil.blocProTitre")}
        </h2>
        <p className="mt-2 text-sm text-texte-secondaire">{t("accueil.blocProTexte")}</p>
        <ul className="mt-5 flex flex-col gap-3">
          {AVANTAGES.map((avantage) => (
            <li key={avantage} className="flex items-start gap-2 text-sm text-texte-principal">
              <Check size={18} className="mt-0.5 shrink-0 text-succes" />
              {avantage}
            </li>
          ))}
        </ul>
        <Link
          href="/compte/inscription-entreprise"
          className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg border-2 border-primaire px-5 py-3 text-sm font-semibold text-primaire transition-colors hover:bg-primaire/5"
        >
          {t("accueil.blocProCta")}
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
