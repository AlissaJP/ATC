"use client";

// RAFF-CONNEXION-SOCIALE — lien "Mot de passe oublié ?" de l'écran de connexion. Décision actée n°41 :
// sandbox sans envoi d'email réel — le message ne confirme ni n'infirme l'existence du compte
// (bonne pratique de sécurité usuelle, indépendante de l'absence d'envoi réel ici).
import { useState } from "react";
import Link from "next/link";

export default function MotDePasseOubliePage() {
  const [envoye, setEnvoye] = useState(false);

  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 md:px-6">
      <h1 className="font-titres text-2xl font-bold text-texte-principal">Mot de passe oublié</h1>

      {envoye ? (
        <p className="mt-6 text-sm text-texte-secondaire">
          Si un compte existe avec cette adresse email, un lien de réinitialisation vient de lui être envoyé.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-texte-secondaire">
            Indiquez votre email — nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setEnvoye(true);
            }}
            className="mt-6 flex flex-col gap-4"
          >
            <label className="block text-sm">
              <span className="text-texte-secondaire">Email</span>
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
              Envoyer le lien
            </button>
          </form>
        </>
      )}

      <Link href="/compte/connexion" className="mt-6 block text-sm font-medium text-primaire hover:underline">
        ← Retour à la connexion
      </Link>
    </main>
  );
}
