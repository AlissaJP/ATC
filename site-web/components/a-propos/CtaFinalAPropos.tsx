"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";

// RAFF-A-PROPOS, section 5 — appel à l'action final.
export function CtaFinalAPropos() {
  const { t } = useTranslation();

  return (
    <section className="flex flex-col items-center gap-5 rounded-2xl bg-fond px-6 py-12 text-center sm:px-10">
      <h2 className="font-titres text-2xl font-bold text-texte-principal md:text-3xl">{t("aPropos.ctaTitre")}</h2>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {t("aPropos.ctaProduits")}
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-lg border border-bordure px-5 py-3 text-sm font-semibold text-texte-principal transition-colors hover:border-primaire hover:text-primaire"
        >
          {t("aPropos.ctaContact")}
        </Link>
      </div>
    </section>
  );
}
