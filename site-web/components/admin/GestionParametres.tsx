"use client";

// BF-12-015 (Must have) — Paramètres généraux : taux de change (RG-06-003, manuel, indépendant de toute
// source externe) + langues actives (Cahier 9 §5, sous-ensemble de {fr, en, es}). Textes légaux : gérés
// séparément dans /admin/contenu (BF-12-011). Notifications : non applicable — cette démo n'a aucune
// infrastructure d'envoi réel (email/SMS).
//
// Raffinement Design — Taux de change et Langues actives vivent désormais dans 2 onglets séparés (pastilles
// + paramètre `onglet`), même idiome que les autres sections (Catalogue, Devis…) plutôt que 2 blocs sur une
// seule page reliés par ancre : un seul bloc visible à la fois, cohérent avec le reste du back-office.
import { useState } from "react";
import { Check } from "lucide-react";
import { useParametresStore } from "@/lib/store/parametres-store";
import type { Langue } from "@/lib/types/entities";

const LANGUES: { code: Langue; label: string }[] = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

export type OngletParametres = "taux-change" | "langues";

const ONGLETS: { valeur: OngletParametres; label: string }[] = [
  { valeur: "taux-change", label: "Taux de change" },
  { valeur: "langues", label: "Langues" },
];

// ongletInitial : reçu de la page (Server Component, lit searchParams) pour les sous-liens de la
// navigation latérale (Section Administration, Raffinement Design).
export function GestionParametres({ ongletInitial = "taux-change" }: { ongletInitial?: OngletParametres }) {
  const [onglet, setOnglet] = useState<OngletParametres>(ongletInitial);

  // Un clic sur un sous-lien de la sidebar navigue vers la même route avec un `onglet` différent : React
  // ne réinitialise pas l'état local de ce composant client pour autant, donc on resynchronise l'onglet
  // pendant le rendu plutôt qu'un useEffect (même correction que TraitementDevis.tsx/GestionCatalogue.tsx).
  const [ongletInitialTraite, setOngletInitialTraite] = useState(ongletInitial);
  if (ongletInitial !== ongletInitialTraite) {
    setOngletInitialTraite(ongletInitial);
    setOnglet(ongletInitial);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {ONGLETS.map((o) => (
          <button
            key={o.valeur}
            type="button"
            onClick={() => setOnglet(o.valeur)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              onglet === o.valeur ? "bg-primaire text-white" : "bg-fond text-texte-secondaire"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {onglet === "taux-change" ? <PanneauTauxChange /> : <PanneauLangues />}
    </div>
  );
}

function PanneauTauxChange() {
  const taux = useParametresStore((s) => s.taux_change_htg_usd);
  const derniereMaj = useParametresStore((s) => s.date_derniere_maj_taux);
  const definirTauxChange = useParametresStore((s) => s.definirTauxChange);
  const [valeur, setValeur] = useState(String(taux));
  const [enregistre, setEnregistre] = useState(false);

  function soumettre(e: React.FormEvent) {
    e.preventDefault();
    const nombre = Number(valeur);
    if (!Number.isFinite(nombre) || nombre <= 0) return;
    definirTauxChange(nombre);
    setEnregistre(true);
    setTimeout(() => setEnregistre(false), 1500);
  }

  return (
    <form onSubmit={soumettre} className="rounded-xl border border-bordure bg-background p-5">
      <p className="mb-3 font-titres text-sm font-semibold text-texte-principal">Taux de change</p>
      <label className="block text-sm">
        <span className="text-texte-secondaire">1 USD =</span>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={valeur}
            onChange={(e) => setValeur(e.target.value)}
            className="w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
          <span className="shrink-0 text-texte-secondaire">HTG</span>
        </div>
      </label>
      <p className="mt-2 text-xs text-texte-secondaire">
        Dernière mise à jour : {new Date(derniereMaj).toLocaleString("fr-FR")}
      </p>
      <button
        type="submit"
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primaire px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        {enregistre ? <Check size={16} /> : null}
        {enregistre ? "Enregistré" : "Mettre à jour le taux"}
      </button>
    </form>
  );
}

function PanneauLangues() {
  const languesActives = useParametresStore((s) => s.langues_actives);
  const basculerLangueActive = useParametresStore((s) => s.basculerLangueActive);

  return (
    <div className="rounded-xl border border-bordure bg-background p-5">
      <p className="mb-1 font-titres text-sm font-semibold text-texte-principal">Langues actives</p>
      <p className="mb-3 text-xs text-texte-secondaire">
        Langues proposées dans le sélecteur de langue du site (français toujours par défaut — RG-14-001).
      </p>
      <div className="flex flex-col gap-2">
        {LANGUES.map((l) => (
          <label key={l.code} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={languesActives.includes(l.code)}
              onChange={() => basculerLangueActive(l.code)}
              className="h-4 w-4 rounded border-bordure"
            />
            <span className="text-texte-principal">{l.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
