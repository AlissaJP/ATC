"use client";

// ECR-11-003 (BF-11-006) — Formulaire de contact. Décision actée n°41 (sandbox, pas de backend réel) :
// comme le paiement ou l'inscription, la soumission est traitée côté client uniquement (confirmation
// affichée), sans service d'envoi d'e-mail réel — aucun BF/ECR ne demande de boîte de réception admin
// pour ces messages, donc aucune n'est construite ici (voir AUDIT-REPORT.md).
import { useState } from "react";
import { Send } from "lucide-react";

export function FormulaireContact() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [sujet, setSujet] = useState("");
  const [message, setMessage] = useState("");
  const [envoye, setEnvoye] = useState(false);

  function soumettre(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim() || !email.trim() || !message.trim()) return;
    setEnvoye(true);
  }

  if (envoye) {
    return (
      <div className="rounded-xl border border-succes/30 bg-succes/5 p-6 text-center">
        <p className="font-titres text-base font-semibold text-texte-principal">Message envoyé</p>
        <p className="mt-1 text-sm text-texte-secondaire">
          Merci, {nom} — notre équipe vous répondra sous 24 à 48h ouvrées.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={soumettre} className="flex flex-col gap-4 rounded-xl border border-bordure bg-background p-6">
      <label className="block text-sm">
        <span className="text-texte-secondaire">Nom</span>
        <input
          type="text"
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
        <span className="text-texte-secondaire">Sujet</span>
        <input
          type="text"
          value={sujet}
          onChange={(e) => setSujet(e.target.value)}
          className="mt-1 w-full rounded-lg border border-bordure px-3 py-2.5 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
        />
      </label>
      <label className="block text-sm">
        <span className="text-texte-secondaire">Message</span>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 w-full rounded-lg border border-bordure px-3 py-2.5 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
        />
      </label>
      <button
        type="submit"
        className="mt-1 inline-flex w-fit items-center gap-2 rounded-lg bg-primaire px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        <Send size={16} /> Envoyer
      </button>
    </form>
  );
}
