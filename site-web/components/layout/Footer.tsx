"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoMark } from "@/components/ui/LogoMark";
import { useTranslation } from "@/lib/i18n/useTranslation";

// Pied de page — structure 4 colonnes (Raffinement Design, élément transverse, validé) : logo +
// description, Entreprise, Aide, Newsletter. Deux écarts volontaires par rapport au document :
// - « Blog » (ECR-11-002) omis de la colonne Entreprise — cette page n'existe pas encore sur le site,
//   un lien créerait une page 404 ; à ajouter dès que le blog sera construit.
// - « Mentions légales » conservée dans la colonne Aide bien qu'absente du tableau du document : cette
//   page reste exigée par ECR-11-004 (Cahier 6) et n'a pas d'autre point d'accès sur le site.
// BF-10-003 (newsletter) : formulaire client uniquement, aucun backend d'abonnés dans ce projet démo.
export function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [inscrit, setInscrit] = useState(false);

  function gererInscription(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setInscrit(true);
  }

  return (
    <footer className="mt-auto border-t border-bordure bg-background print:hidden">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 md:grid-cols-4 md:px-6">
        <div className="flex flex-col gap-3">
          <LogoMark className="self-start" />
          <p className="text-sm text-texte-secondaire">{t("footer.description")}</p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-titres text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
            {t("footer.colonneEntreprise")}
          </p>
          <nav className="flex flex-col gap-2 text-sm text-texte-principal" aria-label="Entreprise">
            <Link href="/a-propos" className="hover:text-primaire">{t("footer.aPropos")}</Link>
            <Link href="/compte/inscription-entreprise" className="hover:text-primaire">{t("nav.devenirPro")}</Link>
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-titres text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
            {t("footer.colonneAide")}
          </p>
          <nav className="flex flex-col gap-2 text-sm text-texte-principal" aria-label="Aide">
            <Link href="/faq" className="hover:text-primaire">{t("footer.faq")}</Link>
            <Link href="/contact" className="hover:text-primaire">{t("footer.contact")}</Link>
            <Link href="/cgv" className="hover:text-primaire">{t("footer.cgv")}</Link>
            <Link href="/confidentialite" className="hover:text-primaire">{t("footer.confidentialite")}</Link>
            <Link href="/mentions-legales" className="hover:text-primaire">{t("footer.mentionsLegales")}</Link>
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-titres text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
            {t("footer.colonneNewsletter")}
          </p>
          <p className="text-sm text-texte-secondaire">{t("footer.newsletterTexte")}</p>
          {inscrit ? (
            <p className="text-sm font-medium text-succes">{t("footer.newsletterMerci")}</p>
          ) : (
            <form onSubmit={gererInscription} className="flex flex-col gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("footer.newsletterPlaceholder")}
                aria-label={t("footer.newsletterPlaceholder")}
                className="rounded-lg border border-bordure bg-background px-3 py-2 text-sm text-texte-principal placeholder:text-texte-secondaire focus:outline-none focus:ring-2 focus:ring-primaire"
              />
              <button
                type="submit"
                className="rounded-lg bg-primaire px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                {t("footer.newsletterCta")}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="border-t border-bordure py-6">
        <p className="mx-auto max-w-7xl px-4 text-center text-xs text-texte-secondaire md:px-6">
          © {new Date().getFullYear()} ATC (Alpha Tech Center). {t("footer.droitsReserves")}
        </p>
      </div>
    </footer>
  );
}
