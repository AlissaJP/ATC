"use client";

// BF-08-001 — Inscription Particulier (compte actif immédiatement, sans étape de validation).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useComptesStore } from "@/lib/store/comptes-store";
import { useSessionStore } from "@/lib/store/session-store";

export default function InscriptionParticulierPage() {
  const router = useRouter();
  const inscrireParticulier = useComptesStore((s) => s.inscrireParticulier);
  const connecterClient = useSessionStore((s) => s.connecterClient);

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");

  function soumettre(e: React.FormEvent) {
    e.preventDefault();
    const utilisateur = inscrireParticulier(nom, email, telephone || undefined);
    connecterClient({
      type: "client",
      utilisateur_id: utilisateur.id,
      nom: utilisateur.nom,
      type_compte: "particulier",
    });
    router.push("/");
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 md:px-6">
      <h1 className="font-titres text-2xl font-bold text-texte-principal">Compte Particulier</h1>
      <p className="mt-2 text-sm text-texte-secondaire">Quelques informations suffisent pour commencer.</p>

      <form onSubmit={soumettre} className="mt-6 flex flex-col gap-4">
        <label className="block text-sm">
          <span className="text-texte-secondaire">Nom complet</span>
          <input
            required
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2.5 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>
        <label className="block text-sm">
          <span className="text-texte-secondaire">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2.5 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>
        <label className="block text-sm">
          <span className="text-texte-secondaire">Téléphone (optionnel)</span>
          <input
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2.5 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>
        <label className="block text-sm">
          <span className="text-texte-secondaire">Mot de passe</span>
          <input
            type="password"
            required
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2.5 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>
        <button
          type="submit"
          className="mt-1 rounded-lg bg-primaire px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Créer mon compte
        </button>
      </form>
    </main>
  );
}
