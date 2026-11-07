"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";

// Écran d'erreur du site, traduit (audit A-30) — remplace l'écran générique de Next.js, en anglais.
export default function ErreurPage({ retry }: { error: unknown; retry: () => void }) {
  const { t } = useTranslation();
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-3 px-4 py-20 text-center">
      <h1 className="font-titres text-xl font-bold text-texte-principal">{t("erreur.problemeTitre")}</h1>
      <p className="text-sm text-texte-secondaire">{t("erreur.problemeTexte")}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-lg bg-primaire px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          {t("erreur.reessayer")}
        </button>
        <Link href="/" className="rounded-lg border border-bordure px-5 py-2.5 text-sm font-semibold text-texte-principal hover:bg-background">
          {t("erreur.retourAccueil")}
        </Link>
      </div>
    </main>
  );
}
