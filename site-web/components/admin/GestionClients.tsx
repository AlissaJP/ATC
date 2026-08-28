"use client";

// ECR-12-005 (implicite, onglet "Clients" de RG-12-001) — Liste générale des comptes Particulier et
// Entreprise, accessible aux deux rôles admin. Combine les comptes de test seedés
// (lib/mock-data/utilisateurs.ts) et les comptes créés dynamiquement pendant la démo (comptes-store.ts),
// même logique que components/admin/ValidationEntreprises.tsx — y compris la déduplication seed/adopté
// (un compte seedé est copié dans le store au premier geste admin dessus, cf. avecUtilisateurAdopte,
// comptes-store.ts) : sans ça un compte modifié apparaîtrait deux fois (version seed + version adoptée).
//
// Raffinement Design — la ligne compacte n'affiche plus l'email/téléphone/date directement : il faut
// cliquer sur un client pour voir ces informations, dans une fenêtre modale (Modal.tsx, même idiome que
// GestionCatalogue.tsx). Le statut de validation B2B et le statut « Suspendu » restent visibles à côté du
// nom dans la liste (pas cachés derrière le clic) — ce qu'un admin doit pouvoir repérer en un coup d'œil.
// La fenêtre d'édition porte les actions (suspendre/réactiver, supprimer, approuver/rejeter un dossier
// B2B) — Général et Agent SAV y ont accès, comme au reste de cette page (RG-12-001).
import { useMemo, useState } from "react";
import { Building2, Check, RotateCcw, ShieldOff, Trash2, User, X } from "lucide-react";
import { useComptesStore } from "@/lib/store/comptes-store";
import { utilisateurs as utilisateursSeed, profilsEntreprise as profilsEntrepriseSeed } from "@/lib/mock-data/utilisateurs";
import type { ProfilEntreprise, StatutValidationEntreprise, TypeCompte, Utilisateur } from "@/lib/types/entities";
import { Modal } from "@/components/ui/Modal";

const LIBELLES_STATUT: Record<StatutValidationEntreprise, { label: string; classe: string }> = {
  en_attente: { label: "En attente", classe: "bg-avertissement/10 text-avertissement" },
  valide: { label: "B2B vérifié", classe: "bg-succes/10 text-succes" },
  rejete: { label: "Rejeté", classe: "bg-danger/10 text-danger" },
  complement_demande: { label: "Complément demandé", classe: "bg-primaire-clair/10 text-primaire-clair" },
};

// filtreInitial : reçu de la page (Server Component, lit searchParams) pour le raccourci « Particuliers »
// de la navigation latérale (Section Administration, Raffinement Design — sous-élément de « Clients »).
export function GestionClients({ filtreInitial = "tous" }: { filtreInitial?: TypeCompte | "tous" }) {
  const utilisateursDynamiques = useComptesStore((s) => s.utilisateurs);
  const profilsDynamiques = useComptesStore((s) => s.profilsEntreprise);
  const utilisateursSupprimesIds = useComptesStore((s) => s.utilisateursSupprimesIds);
  const [filtre, setFiltre] = useState<TypeCompte | "tous">(filtreInitial);
  const [recherche, setRecherche] = useState("");
  const [clientOuvertId, setClientOuvertId] = useState<string | null>(null);

  // Un clic sur un sous-lien de la sidebar navigue vers la même route avec un `type` différent : React
  // ne réinitialise pas l'état local de ce composant client pour autant, donc on resynchronise le filtre
  // pendant le rendu plutôt qu'un useEffect (même correction que TraitementDevis.tsx/GestionCatalogue.tsx).
  const [filtreInitialTraite, setFiltreInitialTraite] = useState(filtreInitial);
  if (filtreInitial !== filtreInitialTraite) {
    setFiltreInitialTraite(filtreInitial);
    setFiltre(filtreInitial);
  }

  const tousLesUtilisateurs = useMemo(() => {
    const idsDynamiques = new Set(utilisateursDynamiques.map((u) => u.id));
    const seedsNonAdoptes = utilisateursSeed.filter((u) => !idsDynamiques.has(u.id));
    return [...seedsNonAdoptes, ...utilisateursDynamiques].filter((u) => !utilisateursSupprimesIds.includes(u.id));
  }, [utilisateursDynamiques, utilisateursSupprimesIds]);

  const tousLesProfils = useMemo(() => {
    const idsDynamiques = new Set(profilsDynamiques.map((p) => p.id));
    const seedsNonAdoptes = profilsEntrepriseSeed.filter((p) => !idsDynamiques.has(p.id));
    return [...seedsNonAdoptes, ...profilsDynamiques];
  }, [profilsDynamiques]);

  const clients = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    return tousLesUtilisateurs
      .filter((u) => filtre === "tous" || u.type_compte === filtre)
      .filter((u) => !terme || u.nom.toLowerCase().includes(terme) || u.email.toLowerCase().includes(terme))
      .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime());
  }, [tousLesUtilisateurs, filtre, recherche]);

  const clientOuvert = clientOuvertId ? tousLesUtilisateurs.find((u) => u.id === clientOuvertId) : undefined;
  const profilOuvert = clientOuvert ? tousLesProfils.find((p) => p.utilisateur_id === clientOuvert.id) : undefined;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Rechercher un client…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
        />
        <div className="flex gap-2">
          {(["tous", "particulier", "entreprise"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltre(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                filtre === f ? "bg-primaire text-white" : "bg-fond text-texte-secondaire"
              }`}
            >
              {f === "tous" ? "Tous" : f === "particulier" ? "Particulier" : "Entreprise"}
            </button>
          ))}
        </div>
      </div>

      {clients.length === 0 ? (
        <p className="text-sm text-texte-secondaire">Aucun client trouvé.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {clients.map((c) => {
            const profil = c.type_compte === "entreprise" ? tousLesProfils.find((p) => p.utilisateur_id === c.id) : undefined;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setClientOuvertId(c.id)}
                className="flex items-center justify-between rounded-lg border border-bordure bg-background px-4 py-3 text-left transition-colors hover:border-primaire-clair"
              >
                <div className="flex items-center gap-3">
                  {c.type_compte === "entreprise" ? (
                    <Building2 size={18} className="shrink-0 text-texte-secondaire" />
                  ) : (
                    <User size={18} className="shrink-0 text-texte-secondaire" />
                  )}
                  <p className="text-sm font-medium text-texte-principal">
                    {c.nom} {profil?.nom_commercial && <span className="text-texte-secondaire">— {profil.nom_commercial}</span>}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {c.statut_compte === "suspendu" && (
                    <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-semibold text-danger">
                      Suspendu
                    </span>
                  )}
                  {profil && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${LIBELLES_STATUT[profil.statut_validation].classe}`}>
                      {LIBELLES_STATUT[profil.statut_validation].label}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {clientOuvert && (
        <FicheClient
          client={clientOuvert}
          profil={profilOuvert}
          onFermer={() => setClientOuvertId(null)}
          onSupprime={() => setClientOuvertId(null)}
        />
      )}
    </div>
  );
}

function FicheClient({
  client,
  profil,
  onFermer,
  onSupprime,
}: {
  client: Utilisateur;
  profil: ProfilEntreprise | undefined;
  onFermer: () => void;
  onSupprime: () => void;
}) {
  const basculerStatutCompteClient = useComptesStore((s) => s.basculerStatutCompteClient);
  const supprimerClient = useComptesStore((s) => s.supprimerClient);
  const approuverDossier = useComptesStore((s) => s.approuverDossier);
  const rejeterDossier = useComptesStore((s) => s.rejeterDossier);
  const demanderComplement = useComptesStore((s) => s.demanderComplement);
  const [motif, setMotif] = useState("");

  function agirSurDossier(action: (id: string, motif: string) => void, exigeMotif: boolean) {
    if (!profil) return;
    if (exigeMotif && !motif.trim()) return;
    action(profil.id, motif);
    setMotif("");
  }

  function supprimer() {
    if (!window.confirm(`Supprimer définitivement le compte de « ${client.nom} » ?`)) return;
    supprimerClient(client.id);
    onSupprime();
  }

  return (
    <Modal titre={client.nom} onFermer={onFermer}>
      <dl className="grid grid-cols-1 gap-y-3 text-sm">
        <div>
          <dt className="text-texte-secondaire">Type de compte</dt>
          <dd className="text-texte-principal">{client.type_compte === "entreprise" ? "Entreprise" : "Particulier"}</dd>
        </div>
        <div>
          <dt className="text-texte-secondaire">Email</dt>
          <dd className="text-texte-principal">{client.email}</dd>
        </div>
        <div>
          <dt className="text-texte-secondaire">Téléphone</dt>
          <dd className="text-texte-principal">{client.telephone || "—"}</dd>
        </div>
        <div>
          <dt className="text-texte-secondaire">Client depuis</dt>
          <dd className="text-texte-principal">{new Date(client.date_creation).toLocaleDateString("fr-FR")}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-texte-secondaire">Statut du compte</dt>
          <dd>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                client.statut_compte === "actif" ? "bg-succes/10 text-succes" : "bg-danger/10 text-danger"
              }`}
            >
              {client.statut_compte === "actif" ? "Actif" : "Suspendu"}
            </span>
          </dd>
        </div>

        {profil && (
          <>
            <div className="mt-2 flex items-center justify-between border-t border-bordure pt-3">
              <dt className="text-texte-secondaire">Statut B2B</dt>
              <dd>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${LIBELLES_STATUT[profil.statut_validation].classe}`}>
                  {LIBELLES_STATUT[profil.statut_validation].label}
                </span>
              </dd>
            </div>
            {profil.nom_commercial && (
              <div>
                <dt className="text-texte-secondaire">Nom commercial</dt>
                <dd className="text-texte-principal">{profil.nom_commercial}</dd>
              </div>
            )}
            <div>
              <dt className="text-texte-secondaire">Nom légal</dt>
              <dd className="text-texte-principal">{profil.nom_legal}</dd>
            </div>
            <div>
              <dt className="text-texte-secondaire">NIF</dt>
              <dd className="text-texte-principal">{profil.nif}</dd>
            </div>
          </>
        )}
      </dl>

      {/* Approbation du dossier B2B — mêmes actions que ValidationEntreprises.tsx (Approuver/Rejeter/
          Compléments), disponibles directement depuis la fiche client. */}
      {profil && profil.statut_validation === "en_attente" && (
        <div className="mt-5 border-t border-bordure pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">Dossier B2B</p>
          <label className="block text-sm">
            <span className="text-texte-secondaire">Commentaire (motif de rejet ou de complément)</span>
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => agirSurDossier(approuverDossier, false)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-succes px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              <Check size={16} /> Approuver
            </button>
            <button
              type="button"
              onClick={() => agirSurDossier(demanderComplement, true)}
              disabled={!motif.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-bordure px-3 py-2 text-sm font-semibold text-texte-principal hover:bg-fond disabled:cursor-not-allowed disabled:opacity-40"
            >
              Demander un complément
            </button>
            <button
              type="button"
              onClick={() => agirSurDossier(rejeterDossier, true)}
              disabled={!motif.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-danger/40 px-3 py-2 text-sm font-semibold text-danger hover:bg-danger/5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X size={16} /> Rejeter
            </button>
          </div>
        </div>
      )}

      {/* Gestion du compte — suspendre/réactiver et suppression définitive. */}
      <div className="mt-5 flex flex-wrap gap-3 border-t border-bordure pt-4">
        <button
          type="button"
          onClick={() => basculerStatutCompteClient(client.id)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-bordure px-4 py-2.5 text-sm font-semibold text-texte-principal hover:bg-fond"
        >
          {client.statut_compte === "actif" ? (
            <>
              <ShieldOff size={16} /> Suspendre le compte
            </>
          ) : (
            <>
              <RotateCcw size={16} /> Réactiver le compte
            </>
          )}
        </button>
        <button
          type="button"
          onClick={supprimer}
          className="inline-flex items-center gap-1.5 rounded-lg border border-danger/40 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger/5"
        >
          <Trash2 size={16} /> Supprimer le client
        </button>
      </div>
    </Modal>
  );
}
