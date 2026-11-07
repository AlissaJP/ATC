"use client";

// RAFF-CONNEXION-SOCIALE — lien "Mot de passe oublié ?" de l'écran de connexion. Décision actée n°41 :
// sandbox sans envoi d'email réel — le message ne confirme ni n'infirme l'existence du compte
// (bonne pratique de sécurité usuelle, indépendante de l'absence d'envoi réel ici).
import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function MotDePasseOubliePage() {
  const { t } = useTranslation();
  const [envoye, setEnvoye] = useState(false);

  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 md:px-6">
      <h1 className="font-titres text-2xl font-bold text-texte-principal">{t("motDePasse.titre")}</h1>

      {envoye ? (
        <p className="mt-6 text-sm text-texte-secondaire">
          {t("motDePasse.envoye")}
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-texte-secondaire">
            {t("motDePasse.intro")}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setEnvoye(true);
            }}
            className="mt-6 flex flex-col gap-4"
          >
            <label className="block text-sm">
              <span className="text-texte-secondaire">{t("connexion.email")}</span>
              <input
                type="email"
                required
                className="mt-1 w-full rounded-lg border border-bordure px-3 py-2.5 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
              />
            </label>
            <button
              type="submit"
              className="mt-1 rounded-lg bg-primaire px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              {t("motDePasse.envoyer")}
            </button>
          </form>
        </>
      )}

      <Link href="/compte/connexion" className="mt-6 block text-sm font-medium text-primaire hover:underline">
        {t("motDePasse.retour")}
      </Link>
    </main>
  );
}
