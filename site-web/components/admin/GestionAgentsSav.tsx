"use client";

// Raffinement Design (point #26, aligné sur GestionClients.tsx — décision actée n°48) — annuaire agents
// SAV. Comme pour les clients, la ligne compacte n'affiche pas les coordonnées (email, téléphone, ville,
// notes) : il faut cliquer sur un agent pour les voir, dans une fenêtre modale (Modal.tsx) qui porte aussi
// l'édition complète (FormulaireAgentSav.tsx, bouton Enregistrer). La création reste une page à part
// entière (/admin/agents-sav/nouveau, CreationAgentSav.tsx), même découpage que Catalogue/Packages.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, UserCog } from "lucide-react";
import type { CompteAgentSav, SpecialiteAgentSav } from "@/lib/types/entities";
import { FormulaireAgentSav } from "@/components/admin/FormulaireAgentSav";
import { Modal } from "@/components/ui/Modal";

const LIBELLES_SPECIALITE: Record<SpecialiteAgentSav, string> = {
  "energie-solaire": "Énergie solaire",
  climatisation: "Climatisation",
  securite: "Sécurité",
  generaliste: "Généraliste",
};

interface GestionAgentsSavProps {
  agents: CompteAgentSav[];
  // Id de l'agent à ouvrir automatiquement dans la fenêtre d'édition — utilisé par CreationAgentSav.tsx
  // pour enchaîner directement sur l'édition juste après une création (même idiome que produitInitial,
  // GestionCatalogue.tsx).
  agentInitial?: string;
}

export function GestionAgentsSav({ agents, agentInitial }: GestionAgentsSavProps) {
  const router = useRouter();
  const [recherche, setRecherche] = useState("");
  const [agentOuvertId, setAgentOuvertId] = useState<string | null>(agentInitial ?? null);

  const [agentInitialTraite, setAgentInitialTraite] = useState(agentInitial);
  if (agentInitial !== agentInitialTraite) {
    setAgentInitialTraite(agentInitial);
    setAgentOuvertId(agentInitial ?? null);
  }

  const agentsFiltres = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    if (!terme) return agents;
    return agents.filter(
      (a) => a.nom.toLowerCase().includes(terme) || a.codeAgent.toLowerCase().includes(terme)
    );
  }, [agents, recherche]);

  const agentOuvert = agentOuvertId ? agents.find((a) => a.id === agentOuvertId) : undefined;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Rechercher un agent (nom, code)…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
        />
        <Link
          href="/admin/agents-sav/nouveau"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-bordure px-3 py-2 text-sm font-semibold text-texte-principal hover:bg-fond"
        >
          <Plus size={16} /> Nouvel agent SAV
        </Link>
      </div>

      {agentsFiltres.length === 0 ? (
        <p className="text-sm text-texte-secondaire">Aucun agent trouvé.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {agentsFiltres.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setAgentOuvertId(a.id)}
              className="flex items-center justify-between rounded-lg border border-bordure bg-background px-4 py-3 text-left transition-colors hover:border-primaire-clair"
            >
              <div className="flex items-center gap-3">
                <UserCog size={18} className="shrink-0 text-texte-secondaire" />
                <div>
                  <p className="text-sm font-medium text-texte-principal">{a.nom}</p>
                  <p className="text-xs text-texte-secondaire">{a.codeAgent}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="rounded-full bg-fond px-2 py-0.5 text-[10px] font-semibold text-texte-secondaire">
                  {LIBELLES_SPECIALITE[a.specialite]}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    a.statut === "actif" ? "bg-succes/10 text-succes" : "bg-fond text-texte-secondaire"
                  }`}
                >
                  {a.statut === "actif" ? "Actif" : "Inactif"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {agentOuvert && (
        <Modal titre={agentOuvert.nom} largeurMax="max-w-2xl" onFermer={() => setAgentOuvertId(null)}>
          <FormulaireAgentSav
            key={agentOuvert.id}
            modeCreation={false}
            agent={agentOuvert}
            masquerTitre
            onModifie={() => router.refresh()}
          />
        </Modal>
      )}
    </div>
  );
}
