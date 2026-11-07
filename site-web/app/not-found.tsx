import Link from "next/link";
import { obtenirTraduction } from "@/lib/i18n/serveur";

// Page 404 du site, traduite (audit A-30) — remplace la page par défaut de Next.js, en anglais.
export default async function PageIntrouvable() {
  const { t } = await obtenirTraduction();
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-3 px-4 py-20 text-center">
      <p className="font-titres text-5xl font-bold text-primaire">404</p>
      <h1 className="font-titres text-xl font-bold text-texte-principal">{t("erreur.introuvableTitre")}</h1>
      <p className="text-sm text-texte-secondaire">{t("erreur.introuvableTexte")}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-lg bg-primaire px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
          {t("erreur.retourAccueil")}
        </Link>
        <Link
          href="/categorie/energie-solaire"
          className="rounded-lg border border-bordure px-5 py-2.5 text-sm font-semibold text-texte-principal hover:bg-background"
        >
          {t("erreur.voirCatalogue")}
        </Link>
      </div>
    </main>
  );
}
