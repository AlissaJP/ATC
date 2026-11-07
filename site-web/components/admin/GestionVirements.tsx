"use client";

// Vérification des paiements par virement bancaire (Administrateur Général uniquement). Le client joint une
// preuve (photo ou capture) à son règlement ; tant qu'elle n'est pas examinée ici, le paiement reste « en
// cours » et la commande en attente de paiement. Valider passe la commande en préparation (elle rejoint les
// commandes validées du client) ; refuser exige un motif, affiché au client, qui peut alors régler à nouveau.
import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Landmark, X, ZoomIn } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useFactureStore } from "@/lib/store/facture-store";
import { useDevisStore } from "@/lib/store/devis-store";
import { useCommandeStore } from "@/lib/store/commande-store";
import { useComptesStore } from "@/lib/store/comptes-store";
import { useSessionStore } from "@/lib/store/session-store";
import { BANQUE_VIREMENT } from "@/lib/constants/banque";
import { utilisateurs as utilisateursSeed } from "@/lib/mock-data/utilisateurs";
import type { Paiement } from "@/lib/types/entities";

type Filtre = "en cours" | "réussie" | "échouée";

const FILTRES: { valeur: Filtre; label: string }[] = [
  { valeur: "en cours", label: "À vérifier" },
  { valeur: "réussie", label: "Validés" },
  { valeur: "échouée", label: "Refusés" },
];

const LIBELLES_COMPTE = { htg: "Compte en gourdes (HTG)", usd: "Compte en dollars (USD)" };

function nomClient(utilisateurId: string | undefined, utilisateursDynamiques: typeof utilisateursSeed): string {
  if (!utilisateurId) return "—";
  return (
    utilisateursSeed.find((u) => u.id === utilisateurId)?.nom ??
    utilisateursDynamiques.find((u) => u.id === utilisateurId)?.nom ??
    "Client"
  );
}

function CarteVirement({
  paiement,
  client,
  onAgrandir,
}: {
  paiement: Paiement;
  client: string;
  onAgrandir: () => void;
}) {
  const session = useSessionStore((s) => s.session);
  const validerVirement = useFactureStore((s) => s.validerVirement);
  const refuserVirement = useFactureStore((s) => s.refuserVirement);
  const [confirmation, setConfirmation] = useState<"valider" | "refuser" | null>(null);
  const [motif, setMotif] = useState("");
  const virement = paiement.virement!;
  const administrateur = session?.type === "admin" ? session.administrateur.nom : "Administrateur";
  const numero = (paiement.commande_id ?? paiement.devis_id ?? "").slice(-8).toUpperCase();

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-bordure bg-background p-4 sm:flex-row">
      <button
        type="button"
        onClick={onAgrandir}
        aria-label="Agrandir la preuve de virement"
        className="group relative h-32 w-full shrink-0 overflow-hidden rounded-lg border border-bordure bg-fond sm:w-32"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- data URL locale, next/image inutile ici */}
        <img src={virement.preuve.donnees} alt="Preuve de virement" className="h-full w-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
          <ZoomIn size={20} />
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-texte-principal">{client}</p>
            <p className="text-xs text-texte-secondaire">
              {paiement.commande_id ? (
                <Link href={`/commande/${paiement.commande_id}`} className="text-primaire hover:underline">
                  Commande #{numero}
                </Link>
              ) : (
                <>Devis #{numero}</>
              )}{" "}
              — envoyé le {new Date(paiement.date_transaction).toLocaleString("fr-FR")}
            </p>
          </div>
          <div className="text-right">
            <p className="font-titres text-lg font-bold text-texte-principal">
              {virement.compte === "htg" && paiement.montant_htg !== undefined
                ? `${paiement.montant_htg.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} HTG`
                : `$${paiement.montant_usd.toFixed(2)}`}
            </p>
            {virement.compte === "htg" && (
              <p className="text-xs text-texte-secondaire">
                ${paiement.montant_usd.toFixed(2)} au taux de {paiement.taux_change_applique} HTG/USD
              </p>
            )}
          </div>
        </div>

        <p className="mt-2 text-xs text-texte-secondaire">
          {LIBELLES_COMPTE[virement.compte]} — n° {BANQUE_VIREMENT.comptes[virement.compte]} · fichier : {virement.preuve.nom}
        </p>

        {paiement.statut_transaction === "en cours" ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setConfirmation("valider")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-succes px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
            >
              <Check size={14} /> Valider le paiement
            </button>
            <button
              type="button"
              onClick={() => setConfirmation("refuser")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-bordure px-3 py-1.5 text-xs font-semibold text-texte-principal hover:bg-fond"
            >
              <X size={14} /> Refuser
            </button>
          </div>
        ) : (
          <p
            className={`mt-3 text-xs font-medium ${paiement.statut_transaction === "réussie" ? "text-succes" : "text-danger"}`}
          >
            {paiement.statut_transaction === "réussie" ? "Validé" : "Refusé"} par {virement.verifie_par} le{" "}
            {virement.date_verification && new Date(virement.date_verification).toLocaleString("fr-FR")}
            {virement.motif_refus && ` — motif : ${virement.motif_refus}`}
          </p>
        )}
      </div>

      {confirmation === "valider" && (
        <Modal titre="Valider ce virement ?" onFermer={() => setConfirmation(null)}>
          <p className="text-sm text-texte-secondaire">
            Confirmez que le montant a bien été reçu sur le compte ATC. La commande passera en préparation et
            apparaîtra dans les commandes validées du client.
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setConfirmation(null)}
              className="rounded-lg border border-bordure px-4 py-2 text-sm font-medium text-texte-principal hover:bg-fond"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => {
                validerVirement(paiement.id, administrateur);
                setConfirmation(null);
              }}
              className="rounded-lg bg-succes px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Valider
            </button>
          </div>
        </Modal>
      )}

      {confirmation === "refuser" && (
        <Modal titre="Refuser ce virement" onFermer={() => setConfirmation(null)}>
          <label className="block text-sm">
            <span className="text-texte-secondaire">Motif (communiqué au client)</span>
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={3}
              placeholder="Ex. : montant reçu incomplet, preuve illisible, virement introuvable…"
              className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
            />
          </label>
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setConfirmation(null)}
              className="rounded-lg border border-bordure px-4 py-2 text-sm font-medium text-texte-principal hover:bg-fond"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={motif.trim().length === 0}
              onClick={() => {
                refuserVirement(paiement.id, administrateur, motif.trim());
                setConfirmation(null);
              }}
              className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Refuser le virement
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export function GestionVirements() {
  const paiements = useFactureStore((s) => s.paiements);
  const devis = useDevisStore((s) => s.devis);
  const commandes = useCommandeStore((s) => s.commandes);
  const utilisateursDynamiques = useComptesStore((s) => s.utilisateurs);
  const [filtre, setFiltre] = useState<Filtre>("en cours");
  const [apercu, setApercu] = useState<Paiement | null>(null);

  const virements = useMemo(() => paiements.filter((p) => p.methode === "virement" && p.virement), [paiements]);
  // À vérifier : les plus anciens d'abord (file d'attente) ; historique : les plus récents d'abord.
  const affiches = useMemo(
    () =>
      virements
        .filter((p) => p.statut_transaction === filtre)
        .sort((a, b) =>
          filtre === "en cours"
            ? a.date_transaction.localeCompare(b.date_transaction)
            : b.date_transaction.localeCompare(a.date_transaction)
        ),
    [virements, filtre]
  );

  const clientDuPaiement = (p: Paiement) => {
    const utilisateurId = p.devis_id
      ? devis.find((d) => d.id === p.devis_id)?.utilisateur_id
      : commandes.find((c) => c.id === p.commande_id)?.utilisateur_id;
    return nomClient(utilisateurId, utilisateursDynamiques);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTRES.map((f) => {
          const nombre = virements.filter((p) => p.statut_transaction === f.valeur).length;
          return (
            <button
              key={f.valeur}
              type="button"
              onClick={() => setFiltre(f.valeur)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                filtre === f.valeur ? "bg-primaire text-white" : "bg-fond text-texte-secondaire"
              }`}
            >
              {f.label} ({nombre})
            </button>
          );
        })}
      </div>

      {affiches.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-bordure py-16 text-center">
          <Landmark size={28} className="text-texte-secondaire" />
          <p className="text-sm text-texte-secondaire">
            {filtre === "en cours" ? "Aucun virement en attente de vérification." : "Aucun virement dans ce filtre."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {affiches.map((p) => (
            <CarteVirement key={p.id} paiement={p} client={clientDuPaiement(p)} onAgrandir={() => setApercu(p)} />
          ))}
        </div>
      )}

      {apercu?.virement && (
        <Modal titre={`Preuve de virement — ${clientDuPaiement(apercu)}`} onFermer={() => setApercu(null)} largeurMax="max-w-3xl">
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL locale, next/image inutile ici */}
          <img src={apercu.virement.preuve.donnees} alt="Preuve de virement" className="max-h-[75vh] w-full rounded-lg object-contain" />
        </Modal>
      )}
    </div>
  );
}
