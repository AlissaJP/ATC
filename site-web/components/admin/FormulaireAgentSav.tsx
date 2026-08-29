"use client";

// Raffinement Design (point #26, fiche élargie — décision actée n°48) — formulaire agent SAV (création ET
// modification), extrait pour être réutilisé à la fois dans la fenêtre modale d'édition
// (GestionAgentsSav.tsx, clic sur un agent existant) et sur la page dédiée de création
// (/admin/agents-sav/nouveau, CreationAgentSav.tsx) — même architecture que FormulaireProduit.tsx pour
// Catalogue.
import { useState } from "react";
import { Save } from "lucide-react";
import type { CompteAgentSav, SpecialiteAgentSav } from "@/lib/types/entities";
import { creerAgentSavAction, modifierAgentSavAction } from "@/lib/actions/agents-sav-admin";
import type { AgentSavInputMock } from "@/lib/mock-data/agents-sav";

const LIBELLES_SPECIALITE: Record<SpecialiteAgentSav, string> = {
  "energie-solaire": "Énergie solaire",
  climatisation: "Climatisation",
  securite: "Sécurité",
  generaliste: "Généraliste",
};

const FORM_VIDE: AgentSavInputMock = {
  nom: "",
  email: "",
  telephone: "",
  date_embauche: "",
  specialite: "generaliste",
  ville: "",
  notes: "",
  statut: "actif",
};

export function FormulaireAgentSav({
  modeCreation,
  agent,
  masquerTitre = false,
  onCree,
  onModifie,
}: {
  modeCreation: boolean;
  agent: CompteAgentSav | undefined;
  // La fenêtre modale d'édition (GestionAgentsSav.tsx) affiche déjà le nom de l'agent dans son propre
  // en-tête (Modal.tsx) — évite de le répéter juste en dessous. Toujours affiché sur la page de création
  // (CreationAgentSav.tsx), qui n'a pas cet en-tête.
  masquerTitre?: boolean;
  onCree?: (id: string) => void;
  onModifie?: () => void;
}) {
  const [form, setForm] = useState<AgentSavInputMock>(() =>
    agent
      ? {
          nom: agent.nom,
          email: agent.email,
          telephone: agent.telephone,
          date_embauche: agent.date_embauche.slice(0, 10),
          specialite: agent.specialite,
          ville: agent.ville,
          notes: agent.notes ?? "",
          statut: agent.statut,
        }
      : FORM_VIDE
  );
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  async function soumettre() {
    setEnCours(true);
    setErreur(null);
    try {
      const input: AgentSavInputMock = {
        ...form,
        date_embauche: form.date_embauche ? new Date(form.date_embauche).toISOString() : form.date_embauche,
      };
      if (modeCreation) {
        const resultat = await creerAgentSavAction(input);
        if (!resultat.succes) {
          setErreur(resultat.erreur ?? "Une erreur est survenue.");
          return;
        }
        if (resultat.donnees) onCree?.(resultat.donnees.id);
      } else if (agent) {
        const resultat = await modifierAgentSavAction(agent.id, input);
        if (!resultat.succes) {
          setErreur(resultat.erreur ?? "Une erreur est survenue.");
          return;
        }
        setConfirmation("Agent mis à jour.");
        onModifie?.();
      }
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="rounded-xl border border-bordure bg-background p-6">
      {!masquerTitre && (
        <p className="mb-1 font-titres text-lg font-bold text-texte-principal">
          {modeCreation ? "Nouvel agent SAV" : agent?.nom}
        </p>
      )}
      <div className="mb-4">
        {!modeCreation && agent && (
          <p className="text-xs text-texte-secondaire">
            Code agent <span className="font-semibold text-texte-principal">{agent.codeAgent}</span> — généré
            automatiquement, non modifiable
          </p>
        )}
        {modeCreation && (
          <p className="text-xs text-texte-secondaire">Le code agent sera généré automatiquement à la création.</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="text-texte-secondaire">Nom complet</span>
          <input
            type="text"
            value={form.nom}
            onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>

        <label className="block text-sm">
          <span className="text-texte-secondaire">E-mail</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>

        <label className="block text-sm">
          <span className="text-texte-secondaire">Téléphone</span>
          <input
            type="tel"
            value={form.telephone}
            onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
            placeholder="+509 …"
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>

        <label className="block text-sm">
          <span className="text-texte-secondaire">Date d&apos;embauche</span>
          <input
            type="date"
            value={form.date_embauche}
            onChange={(e) => setForm((f) => ({ ...f, date_embauche: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>

        <label className="block text-sm">
          <span className="text-texte-secondaire">Ville de rattachement</span>
          <input
            type="text"
            value={form.ville}
            onChange={(e) => setForm((f) => ({ ...f, ville: e.target.value }))}
            placeholder="ex. Port-au-Prince"
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>

        <label className="block text-sm">
          <span className="text-texte-secondaire">Spécialité</span>
          <select
            value={form.specialite}
            onChange={(e) => setForm((f) => ({ ...f, specialite: e.target.value as SpecialiteAgentSav }))}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          >
            {(Object.keys(LIBELLES_SPECIALITE) as SpecialiteAgentSav[]).map((s) => (
              <option key={s} value={s}>
                {LIBELLES_SPECIALITE[s]}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="text-texte-secondaire">Statut</span>
          <select
            value={form.statut}
            onChange={(e) => setForm((f) => ({ ...f, statut: e.target.value as AgentSavInputMock["statut"] }))}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          >
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
          </select>
        </label>

        <label className="block text-sm sm:col-span-2">
          <span className="text-texte-secondaire">Notes internes (facultatif)</span>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
            placeholder="Spécialisations, formations suivies, remarques…"
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>
      </div>

      {erreur && <p className="mt-4 text-sm font-medium text-danger">{erreur}</p>}
      {confirmation && <p className="mt-4 text-sm font-medium text-succes">{confirmation}</p>}

      <button
        type="button"
        disabled={enCours}
        onClick={soumettre}
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-primaire px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Save size={16} /> {modeCreation ? "Créer l'agent" : "Enregistrer"}
      </button>
    </div>
  );
}

