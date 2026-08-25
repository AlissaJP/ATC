"use client";

// BF-12-015 (Must have) — Paramètres généraux : taux de change (RG-06-003, manuel, indépendant de toute
// source externe) + langues actives (Cahier 9 §5, sous-ensemble de {fr, en, es} — gap identifié lors de
// l'audit qualité, ajouté ici). Textes légaux : gérés séparément dans /admin/contenu (BF-12-011).
// Notifications : non applicable — cette démo n'a aucune infrastructure d'envoi réel (email/SMS), signalé
// plutôt qu'un réglage sans effet n'aurait été construit.
import { useState } from "react";
import { Check } from "lucide-react";
import { useParametresStore } from "@/lib/store/parametres-store";
import { GardeRoleAdmin } from "@/components/admin/GardeRoleAdmin";
import type { Langue } from "@/lib/types/entities";

const LANGUES: { code: Langue; label: string }[] = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

export default function AdminParametresPage() {
  const taux = useParametresStore((s) => s.taux_change_htg_usd);
  const derniereMaj = useParametresStore((s) => s.date_derniere_maj_taux);
  const definirTauxChange = useParametresStore((s) => s.definirTauxChange);
  const languesActives = useParametresStore((s) => s.langues_actives);
  const basculerLangueActive = useParametresStore((s) => s.basculerLangueActive);
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
    <main className="mx-auto w-full max-w-md px-4 py-8 md:px-6">
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal">Paramètres généraux</h1>

      <GardeRoleAdmin rolesAutorises={["general"]}>
        <div className="flex flex-col gap-6">
          <form id="taux-change" onSubmit={soumettre} className="scroll-mt-24 rounded-xl border border-bordure bg-background p-5">
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

          <div id="langues" className="scroll-mt-24 rounded-xl border border-bordure bg-background p-5">
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
        </div>
      </GardeRoleAdmin>
    </main>
  );
}
