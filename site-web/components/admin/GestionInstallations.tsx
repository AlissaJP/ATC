"use client";

// BF-12-009 (volet installation) / UC-09-001 — Gestion des demandes d'installation solaire (back-office).
// Accessible aux deux rôles admin (UC-09-001 liste ADM-G et Agent SAV comme acteurs secondaires).
// L'agent SAV ou l'administrateur confirme la date proposée par le client ou l'ajuste selon la
// disponibilité de l'équipe (scénario nominal, étape 3) ; seuls 3 statuts existent au dictionnaire
// (planifié/réalisé/annulé — Cahier 9) : « confirmer » revient donc à conserver le statut « planifié »,
// éventuellement après avoir ajusté la date.
import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Save, XCircle } from "lucide-react";
import { useInstallationStore } from "@/lib/store/installation-store";
import { useCommandeStore } from "@/lib/store/commande-store";
import { utilisateurs as utilisateursSeed } from "@/lib/mock-data/utilisateurs";
import { useComptesStore } from "@/lib/store/comptes-store";
import { StatutInstallationBadge } from "@/components/commande/StatutInstallationBadge";
import type { InstallationRdv } from "@/lib/types/entities";

function nomClient(utilisateurId: string | undefined, utilisateursDynamiques: typeof utilisateursSeed): string {
  if (!utilisateurId) return "Client";
  return (
    utilisateursSeed.find((u) => u.id === utilisateurId)?.nom ??
    utilisateursDynamiques.find((u) => u.id === utilisateurId)?.nom ??
    "Client"
  );
}

function dateInputValue(iso: string): string {
  // <input type="datetime-local"> attend "YYYY-MM-DDTHH:mm" en heure locale, sans le "Z" final.
  const d = new Date(iso);
  const decalage = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - decalage).toISOString().slice(0, 16);
}

function LigneInstallation({ rdv, nomDuClient }: { rdv: InstallationRdv; nomDuClient: string }) {
  const ajusterDateInstallation = useInstallationStore((s) => s.ajusterDateInstallation);
  const changerStatutInstallation = useInstallationStore((s) => s.changerStatutInstallation);
  const [dateEditee, setDateEditee] = useState(dateInputValue(rdv.date_prevue));

  return (
    <div className="rounded-xl border border-bordure bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-texte-principal">{nomDuClient}</p>
          <Link href={`/commande/${rdv.commande_id}`} className="text-xs text-primaire hover:underline">
            Commande #{rdv.commande_id.slice(-8).toUpperCase()}
          </Link>
        </div>
        <StatutInstallationBadge statut={rdv.statut} />
      </div>

      {rdv.statut === "planifie" && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="datetime-local"
            value={dateEditee}
            onChange={(e) => setDateEditee(e.target.value)}
            className="rounded-lg border border-bordure px-3 py-1.5 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
          <button
            type="button"
            onClick={() => ajusterDateInstallation(rdv.id, new Date(dateEditee).toISOString())}
            className="inline-flex items-center gap-1.5 rounded-lg border border-bordure px-3 py-1.5 text-xs font-semibold text-texte-principal hover:bg-fond"
          >
            <Save size={14} /> Confirmer / ajuster la date
          </button>
          <button
            type="button"
            onClick={() => changerStatutInstallation(rdv.id, "realise")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-succes px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          >
            <CheckCircle2 size={14} /> Marquer réalisée
          </button>
          <button
            type="button"
            onClick={() => changerStatutInstallation(rdv.id, "annule")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger/5"
          >
            <XCircle size={14} /> Annuler
          </button>
        </div>
      )}
      {rdv.statut !== "planifie" && (
        <p className="mt-2 text-xs text-texte-secondaire">
          {new Date(rdv.date_prevue).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}
        </p>
      )}
    </div>
  );
}

export function GestionInstallations() {
  const installations = useInstallationStore((s) => s.installations);
  const commandes = useCommandeStore((s) => s.commandes);
  const utilisateursDynamiques = useComptesStore((s) => s.utilisateurs);
  const [filtre, setFiltre] = useState<InstallationRdv["statut"] | "tous">("planifie");

  const filtres: { valeur: InstallationRdv["statut"] | "tous"; label: string }[] = [
    { valeur: "planifie", label: "Planifiées" },
    { valeur: "realise", label: "Réalisées" },
    { valeur: "annule", label: "Annulées" },
    { valeur: "tous", label: "Toutes" },
  ];

  const installationsFiltrees = useMemo(
    () => [...installations].filter((i) => filtre === "tous" || i.statut === filtre),
    [installations, filtre]
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {filtres.map((f) => (
          <button
            key={f.valeur}
            type="button"
            onClick={() => setFiltre(f.valeur)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              filtre === f.valeur ? "bg-primaire text-white" : "bg-fond text-texte-secondaire"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {installationsFiltrees.length === 0 ? (
        <p className="text-sm text-texte-secondaire">Aucune demande d&apos;installation dans ce filtre.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {installationsFiltrees.map((rdv) => (
            <LigneInstallation
              key={rdv.id}
              rdv={rdv}
              nomDuClient={nomClient(commandes.find((c) => c.id === rdv.commande_id)?.utilisateur_id, utilisateursDynamiques)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
