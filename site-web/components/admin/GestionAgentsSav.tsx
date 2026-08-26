"use client";

// Raffinement Design (point #26) — annuaire agents SAV. Même structure master-detail que
// GestionCatalogue.tsx : liste + recherche à gauche, formulaire de création/édition à droite, remonté via
// `key={selection?.id ?? "creation"}` au changement de sélection plutôt que resynchronisé par un
// useEffect. router.refresh() après chaque mutation réussie pour redemander le rendu serveur (ce
// composant client ne peut pas relire directement le tableau mock-data serveur).
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Save, UserCog } from "lucide-react";
import type { CompteAgentSav } from "@/lib/types/entities";
import {
  basculerStatutAgentSavAction,
  creerAgentSavAction,
  modifierAgentSavAction,
} from "@/lib/actions/agents-sav-admin";
import type { AgentSavInputMock } from "@/lib/mock-data/agents-sav";

const FORM_VIDE: AgentSavInputMock = { nom: "", email: "", statut: "actif" };

export function GestionAgentsSav({ agents }: { agents: CompteAgentSav[] }) {
  const router = useRouter();
  const [recherche, setRecherche] = useState("");
  const [selectionId, setSelectionId] = useState<string | null>(agents[0]?.id ?? null);
  const [modeCreation, setModeCreation] = useState(false);
  const [idEnBascule, setIdEnBascule] = useState<string | null>(null);

  const agentsFiltres = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    if (!terme) return agents;
    return agents.filter(
      (a) => a.nom.toLowerCase().includes(terme) || a.codeAgent.toLowerCase().includes(terme)
    );
  }, [agents, recherche]);

  const selection = modeCreation ? undefined : agents.find((a) => a.id === selectionId);

  async function basculerStatut(id: string) {
    setIdEnBascule(id);
    try {
      await basculerStatutAgentSavAction(id);
      router.refresh();
    } finally {
      setIdEnBascule(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <input
            type="search"
            placeholder="Rechercher un agent (nom, code)…"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="w-full rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setModeCreation(true);
            setSelectionId(null);
          }}
          className={`mb-3 flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold ${
            modeCreation ? "border-primaire bg-primaire/5 text-primaire" : "border-bordure text-texte-principal hover:bg-fond"
          }`}
        >
          <Plus size={16} /> Nouvel agent SAV
        </button>

        <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto pr-1">
          {agentsFiltres.map((a) => (
            <div
              key={a.id}
              className={`rounded-lg border p-3 transition-colors ${
                !modeCreation && selectionId === a.id
                  ? "border-primaire bg-primaire/5"
                  : "border-bordure bg-background hover:border-primaire-clair"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setModeCreation(false);
                  setSelectionId(a.id);
                }}
                className="block w-full text-left"
              >
                <p className="text-sm font-medium text-texte-principal">{a.nom}</p>
                <p className="text-xs text-texte-secondaire">{a.codeAgent}</p>
              </button>
              <button
                type="button"
                disabled={idEnBascule === a.id}
                onClick={() => basculerStatut(a.id)}
                className={`mt-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${
                  a.statut === "actif" ? "bg-succes/10 text-succes" : "bg-fond text-texte-secondaire"
                }`}
                title={a.statut === "actif" ? "Cliquer pour désactiver" : "Cliquer pour réactiver"}
              >
                {a.statut === "actif" ? "Actif" : "Inactif"}
              </button>
            </div>
          ))}
          {agentsFiltres.length === 0 && <p className="text-sm text-texte-secondaire">Aucun agent trouvé.</p>}
        </div>
      </div>

      <div>
        {!modeCreation && !selection ? (
          <p className="text-sm text-texte-secondaire">Sélectionnez un agent ou créez-en un nouveau.</p>
        ) : (
          <PanneauAgentSav
            key={modeCreation ? "creation" : selection!.id}
            modeCreation={modeCreation}
            agent={selection}
            onCree={(id) => {
              router.refresh();
              setModeCreation(false);
              setSelectionId(id);
            }}
            onModifie={() => router.refresh()}
          />
        )}
      </div>
    </div>
  );
}

function PanneauAgentSav({
  modeCreation,
  agent,
  onCree,
  onModifie,
}: {
  modeCreation: boolean;
  agent: CompteAgentSav | undefined;
  onCree: (id: string) => void;
  onModifie: () => void;
}) {
  const [form, setForm] = useState<AgentSavInputMock>(() =>
    agent ? { nom: agent.nom, email: agent.email, statut: agent.statut } : FORM_VIDE
  );
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  async function soumettre() {
    setEnCours(true);
    setErreur(null);
    try {
      if (modeCreation) {
        const resultat = await creerAgentSavAction(form);
        if (!resultat.succes) {
          setErreur(resultat.erreur ?? "Une erreur est survenue.");
          return;
        }
        if (resultat.donnees) onCree(resultat.donnees.id);
      } else if (agent) {
        const resultat = await modifierAgentSavAction(agent.id, form);
        if (!resultat.succes) {
          setErreur(resultat.erreur ?? "Une erreur est survenue.");
          return;
        }
        setConfirmation("Agent mis à jour.");
        onModifie();
      }
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="rounded-xl border border-bordure bg-background p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <UserCog size={20} className="shrink-0 text-primaire-clair" />
        <div>
          <p className="font-titres text-lg font-bold text-texte-principal">
            {modeCreation ? "Nouvel agent SAV" : agent?.nom}
          </p>
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

        <label className="block text-sm sm:col-span-2">
          <span className="text-texte-secondaire">E-mail</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
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
      </div>

      {erreur && <p className="mt-4 text-sm font-medium text-danger">{erreur}</p>}
      {confirmation && (
        <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-succes">
          <Check size={14} /> {confirmation}
        </p>
      )}

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
