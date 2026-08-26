"use client";

// Raffinement Design (point #27) — historique des actions par agent SAV. Lecture seule : aucune action
// de mutation ici, uniquement filtrage/affichage. Filtrage et charge de travail délégués à
// lib/services/journal-agents-sav.ts (fonctions pures), ce composant ne fait que les appeler et afficher
// le résultat.
import { useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import type { CompteAgentSav, JournalActionAgentSav, TypeActionAgentSav } from "@/lib/types/entities";
import { compterActionsParAgent, filtrerJournalAgentsSav } from "@/lib/services/journal-agents-sav";

const LIBELLES_TYPE_ACTION: Record<TypeActionAgentSav, string> = {
  commande_prise_en_charge: "Commande prise en charge",
  commande_traitee: "Commande traitée",
  ticket_pris_en_charge: "Ticket pris en charge",
  reponse_client: "Réponse client",
  ticket_resolu: "Ticket résolu",
};

type Periode = "7" | "30" | "90" | "tout";

const LIBELLES_PERIODE: Record<Periode, string> = {
  "7": "7 derniers jours",
  "30": "30 derniers jours",
  "90": "90 derniers jours",
  tout: "Toute la période",
};

function formaterDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export function HistoriqueAgentsSav({
  entrees,
  agents,
}: {
  entrees: JournalActionAgentSav[];
  agents: CompteAgentSav[];
}) {
  const [codeAgent, setCodeAgent] = useState<string>("");
  const [typeAction, setTypeAction] = useState<TypeActionAgentSav | "">("");
  const [periode, setPeriode] = useState<Periode>("30");

  const nomAgent = useMemo(() => {
    const carte = new Map(agents.map((a) => [a.codeAgent, a.nom]));
    return (code: string) => carte.get(code) ?? code;
  }, [agents]);

  const depuis = useMemo(() => {
    if (periode === "tout") return undefined;
    const d = new Date();
    d.setDate(d.getDate() - Number(periode));
    return d;
  }, [periode]);

  const resultats = useMemo(
    () =>
      filtrerJournalAgentsSav(entrees, {
        codeAgent: codeAgent || undefined,
        typeAction: typeAction || undefined,
        depuis,
      }),
    [entrees, codeAgent, typeAction, depuis]
  );

  const charge = useMemo(() => compterActionsParAgent(resultats), [resultats]);

  return (
    <div className="flex flex-col gap-6">
      {/* Vue détaillée par agent — charge de travail sur la période filtrée */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((a) => {
          const nombre = charge.find((c) => c.codeAgent === a.codeAgent)?.nombreActions ?? 0;
          return (
            <div key={a.id} className="rounded-xl border border-bordure bg-background p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-texte-principal">{a.nom}</p>
                  <p className="text-xs text-texte-secondaire">{a.codeAgent}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    a.statut === "actif" ? "bg-succes/10 text-succes" : "bg-fond text-texte-secondaire"
                  }`}
                >
                  {a.statut === "actif" ? "Actif" : "Inactif"}
                </span>
              </div>
              <p className="mt-3 font-titres text-2xl font-bold text-primaire">{nombre}</p>
              <p className="text-xs text-texte-secondaire">action{nombre !== 1 ? "s" : ""} — {LIBELLES_PERIODE[periode].toLowerCase()}</p>
            </div>
          );
        })}
      </div>

      {/* Vue d'ensemble — filtres */}
      <div className="flex flex-wrap gap-3">
        <label className="text-sm">
          <span className="sr-only">Agent</span>
          <select
            value={codeAgent}
            onChange={(e) => setCodeAgent(e.target.value)}
            className="rounded-lg border border-bordure bg-background px-3 py-2 text-sm text-texte-principal"
          >
            <option value="">Tous les agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.codeAgent}>
                {a.codeAgent} — {a.nom}
                {a.statut === "inactif" ? " (inactif)" : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="sr-only">Type d&apos;action</span>
          <select
            value={typeAction}
            onChange={(e) => setTypeAction(e.target.value as TypeActionAgentSav | "")}
            className="rounded-lg border border-bordure bg-background px-3 py-2 text-sm text-texte-principal"
          >
            <option value="">Tous les types d&apos;action</option>
            {(Object.keys(LIBELLES_TYPE_ACTION) as TypeActionAgentSav[]).map((t) => (
              <option key={t} value={t}>
                {LIBELLES_TYPE_ACTION[t]}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="sr-only">Période</span>
          <select
            value={periode}
            onChange={(e) => setPeriode(e.target.value as Periode)}
            className="rounded-lg border border-bordure bg-background px-3 py-2 text-sm text-texte-principal"
          >
            {(Object.keys(LIBELLES_PERIODE) as Periode[]).map((p) => (
              <option key={p} value={p}>
                {LIBELLES_PERIODE[p]}
              </option>
            ))}
          </select>
        </label>

        <p className="ml-auto self-center text-sm text-texte-secondaire">{resultats.length} action(s)</p>
      </div>

      {/* Liste filtrée */}
      {resultats.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-bordure py-12 text-center">
          <ClipboardList size={24} className="text-texte-secondaire" />
          <p className="text-sm text-texte-secondaire">Aucune action ne correspond à ces filtres.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-bordure">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="bg-fond text-left text-texte-secondaire">
                <th scope="col" className="px-3 py-2 font-medium">Agent</th>
                <th scope="col" className="px-3 py-2 font-medium">Action</th>
                <th scope="col" className="px-3 py-2 font-medium">Référence</th>
                <th scope="col" className="px-3 py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {resultats.map((e) => (
                <tr key={e.id} className="border-t border-bordure text-texte-principal">
                  <td className="px-3 py-2">
                    <span className="font-medium">{nomAgent(e.codeAgent)}</span>{" "}
                    <span className="text-texte-secondaire">({e.codeAgent})</span>
                  </td>
                  <td className="px-3 py-2">{LIBELLES_TYPE_ACTION[e.typeAction]}</td>
                  <td className="px-3 py-2 text-texte-secondaire">{e.referenceCommande}</td>
                  <td className="px-3 py-2 text-texte-secondaire">{formaterDate(e.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
