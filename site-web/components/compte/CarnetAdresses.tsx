"use client";

import { useMemo, useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { useComptesStore } from "@/lib/store/comptes-store";

// BF-08-002 — Carnet d'adresses (facturation), Haïti et international.
export function CarnetAdresses({ utilisateurId }: { utilisateurId: string }) {
  const toutesLesAdresses = useComptesStore((s) => s.adresses);
  const adresses = useMemo(() => toutesLesAdresses.filter((a) => a.utilisateur_id === utilisateurId), [toutesLesAdresses, utilisateurId]);
  const ajouterAdresse = useComptesStore((s) => s.ajouterAdresse);
  const retirerAdresse = useComptesStore((s) => s.retirerAdresse);

  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [libelle, setLibelle] = useState("");
  const [adresse, setAdresse] = useState("");

  function soumettre(e: React.FormEvent) {
    e.preventDefault();
    if (!libelle.trim() || !adresse.trim()) return;
    ajouterAdresse(utilisateurId, libelle, adresse);
    setLibelle("");
    setAdresse("");
    setFormulaireOuvert(false);
  }

  return (
    <div className="rounded-xl border border-bordure bg-background p-5">
      <div className="flex items-center justify-between">
        <p className="font-titres text-sm font-semibold text-texte-principal">Carnet d&apos;adresses</p>
        <button
          type="button"
          onClick={() => setFormulaireOuvert((v) => !v)}
          className="inline-flex items-center gap-1 text-sm font-medium text-primaire hover:underline"
        >
          <Plus size={14} /> Ajouter
        </button>
      </div>

      {formulaireOuvert && (
        <form onSubmit={soumettre} className="mt-3 flex flex-col gap-2 rounded-lg bg-fond p-3">
          <input
            placeholder="Libellé (ex. Domicile, Bureau)"
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            className="rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
          <input
            placeholder="Adresse complète"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            className="rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
          <button type="submit" className="self-end rounded-lg bg-primaire px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90">
            Enregistrer
          </button>
        </form>
      )}

      {adresses.length === 0 ? (
        <p className="mt-3 text-sm text-texte-secondaire">Aucune adresse enregistrée.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {adresses.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-2 rounded-lg bg-fond p-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-texte-secondaire" />
                <div>
                  <p className="font-medium text-texte-principal">{a.libelle}</p>
                  <p className="text-texte-secondaire">{a.adresse}</p>
                </div>
              </div>
              <button type="button" aria-label="Supprimer" onClick={() => retirerAdresse(a.id)} className="shrink-0 text-texte-secondaire hover:text-danger">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
