"use client";

// ECR-08-002 — Validation compte Entreprise (back-office, étapes 3 et 4). RG-08-001. UC-08-002.
// Raffinement Design — un clic sur un dossier ouvre son détail dans une fenêtre modale (Modal.tsx), même
// idiome que GestionClients.tsx / GestionCatalogue.tsx : plus de panneau à droite auto-sélectionné sur le
// premier dossier au chargement (les informations d'un dossier ne doivent apparaître qu'après un clic).
import { useMemo, useState } from "react";
import { Check, Clock, FileText, X } from "lucide-react";
import { useComptesStore } from "@/lib/store/comptes-store";
import { profilsEntreprise as profilsEntrepriseSeed, utilisateurs as utilisateursSeed } from "@/lib/mock-data/utilisateurs";
import type { DocumentEntreprise, ProfilEntreprise, StatutValidationEntreprise } from "@/lib/types/entities";
import { Modal } from "@/components/ui/Modal";

const LIBELLES_STATUT: Record<StatutValidationEntreprise, { label: string; classe: string }> = {
  en_attente: { label: "En attente", classe: "bg-avertissement/10 text-avertissement" },
  valide: { label: "B2B vérifié", classe: "bg-succes/10 text-succes" },
  rejete: { label: "Rejeté", classe: "bg-danger/10 text-danger" },
  complement_demande: { label: "Complément demandé", classe: "bg-primaire-clair/10 text-primaire-clair" },
};

function nomUtilisateur(utilisateurId: string, utilisateursDynamiques: typeof utilisateursSeed): string {
  return (
    utilisateursSeed.find((u) => u.id === utilisateurId)?.nom ??
    utilisateursDynamiques.find((u) => u.id === utilisateurId)?.nom ??
    "Client"
  );
}

export function ValidationEntreprises() {
  const profilsDynamiques = useComptesStore((s) => s.profilsEntreprise);
  const utilisateursDynamiques = useComptesStore((s) => s.utilisateurs);
  const documentsDynamiques = useComptesStore((s) => s.documentsEntreprise);

  const tousLesProfils = useMemo(() => {
    const idsDynamiques = new Set(profilsDynamiques.map((p) => p.id));
    const seedsNonAdoptes = profilsEntrepriseSeed.filter((p) => !idsDynamiques.has(p.id));
    return [...seedsNonAdoptes, ...profilsDynamiques].sort(
      (a, b) => new Date(a.date_soumission).getTime() - new Date(b.date_soumission).getTime()
    );
  }, [profilsDynamiques]);

  const [filtre, setFiltre] = useState<StatutValidationEntreprise | "tous">("en_attente");
  const [dossierOuvertId, setDossierOuvertId] = useState<string | null>(null);
  // Capturé une seule fois via l'initialiseur (échappatoire documentée pour un appel impur pendant
  // le rendu) plutôt qu'un Date.now() direct dans la boucle .map() ci-dessous.
  const [maintenant] = useState(() => Date.now());

  const profilsFiltres = filtre === "tous" ? tousLesProfils : tousLesProfils.filter((p) => p.statut_validation === filtre);
  const dossierOuvert = dossierOuvertId ? tousLesProfils.find((p) => p.id === dossierOuvertId) : undefined;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {(["en_attente", "valide", "rejete", "complement_demande", "tous"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFiltre(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              filtre === s ? "bg-primaire text-white" : "bg-fond text-texte-secondaire"
            }`}
          >
            {s === "tous" ? "Tous" : LIBELLES_STATUT[s].label}
          </button>
        ))}
      </div>

      {profilsFiltres.length === 0 ? (
        <p className="text-sm text-texte-secondaire">Aucun dossier dans ce filtre.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {profilsFiltres.map((p) => {
            const ancienJours = Math.floor((maintenant - new Date(p.date_soumission).getTime()) / (1000 * 60 * 60 * 24));
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setDossierOuvertId(p.id)}
                className="rounded-lg border border-bordure bg-background p-3 text-left transition-colors hover:border-primaire-clair"
              >
                <p className="text-sm font-medium text-texte-principal">{p.nom_legal}</p>
                <p className="text-xs text-texte-secondaire">{nomUtilisateur(p.utilisateur_id, utilisateursDynamiques)}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${LIBELLES_STATUT[p.statut_validation].classe}`}>
                    {LIBELLES_STATUT[p.statut_validation].label}
                  </span>
                  {p.statut_validation === "en_attente" && ancienJours >= 2 && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-danger">
                      <Clock size={10} /> {ancienJours} j
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {dossierOuvert && (
        <FicheDossier
          dossier={dossierOuvert}
          documents={documentsDynamiques.filter((d) => d.profil_entreprise_id === dossierOuvert.id)}
          nomClient={nomUtilisateur(dossierOuvert.utilisateur_id, utilisateursDynamiques)}
          onFermer={() => setDossierOuvertId(null)}
        />
      )}
    </div>
  );
}

function FicheDossier({
  dossier,
  documents,
  nomClient,
  onFermer,
}: {
  dossier: ProfilEntreprise;
  documents: DocumentEntreprise[];
  nomClient: string;
  onFermer: () => void;
}) {
  const approuverDossier = useComptesStore((s) => s.approuverDossier);
  const rejeterDossier = useComptesStore((s) => s.rejeterDossier);
  const demanderComplement = useComptesStore((s) => s.demanderComplement);
  const [commentaire, setCommentaire] = useState("");

  function agir(action: (id: string, motif: string) => void, exigeCommentaire: boolean) {
    if (exigeCommentaire && !commentaire.trim()) return;
    action(dossier.id, commentaire);
    setCommentaire("");
  }

  return (
    <Modal titre={dossier.nom_legal} largeurMax="max-w-2xl" onFermer={onFermer}>
      <div className="flex items-start justify-between">
        <div>
          {dossier.nom_commercial && <p className="text-sm text-texte-secondaire">{dossier.nom_commercial}</p>}
          <p className="text-sm text-texte-secondaire">{nomClient}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${LIBELLES_STATUT[dossier.statut_validation].classe}`}>
          {LIBELLES_STATUT[dossier.statut_validation].label}
        </span>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-texte-secondaire">NIF</dt>
          <dd className="text-texte-principal">{dossier.nif}</dd>
        </div>
        <div>
          <dt className="text-texte-secondaire">Registre de commerce</dt>
          <dd className="text-texte-principal">{dossier.registre_commerce || "—"}</dd>
        </div>
        <div>
          <dt className="text-texte-secondaire">Adresse</dt>
          <dd className="text-texte-principal">{dossier.adresse_entreprise}</dd>
        </div>
        <div>
          <dt className="text-texte-secondaire">Secteur d&apos;activité</dt>
          <dd className="text-texte-principal">{dossier.secteur_activite}</dd>
        </div>
        <div>
          <dt className="text-texte-secondaire">Représentant</dt>
          <dd className="text-texte-principal">
            {dossier.representant_nom} — {dossier.representant_fonction}
          </dd>
        </div>
        <div>
          <dt className="text-texte-secondaire">Email professionnel</dt>
          <dd className="text-texte-principal">{dossier.email_professionnel}</dd>
        </div>
      </dl>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">Documents</p>
        {documents.length === 0 ? (
          <p className="text-sm text-texte-secondaire">
            Aucun document synchronisé pour ce dossier (dossier de démonstration seedé).
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {documents.map((d) => (
              <li key={d.id} className="flex items-center gap-2 rounded-lg bg-fond px-3 py-2 text-sm text-texte-principal">
                <FileText size={16} className="shrink-0 text-texte-secondaire" />
                <span className="truncate">{d.fichier_url}</span>
                <span className="ml-auto shrink-0 text-xs text-texte-secondaire">{d.type_document}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {dossier.commentaire_admin && (
        <p className="mt-4 rounded-lg bg-fond px-3 py-2 text-sm text-texte-secondaire">
          Commentaire précédent : {dossier.commentaire_admin}
        </p>
      )}

      {dossier.statut_validation === "en_attente" && (
        <div className="mt-6 border-t border-bordure pt-4">
          <label className="block text-sm">
            <span className="text-texte-secondaire">Commentaire (motif de rejet ou de complément)</span>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => agir(approuverDossier, false)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-succes px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              <Check size={16} /> Approuver
            </button>
            <button
              type="button"
              onClick={() => agir(demanderComplement, true)}
              disabled={!commentaire.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-bordure px-4 py-2 text-sm font-semibold text-texte-principal hover:bg-fond disabled:cursor-not-allowed disabled:opacity-40"
            >
              Demander un complément
            </button>
            <button
              type="button"
              onClick={() => agir(rejeterDossier, true)}
              disabled={!commentaire.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-danger/40 px-4 py-2 text-sm font-semibold text-danger hover:bg-danger/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X size={16} /> Rejeter
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
