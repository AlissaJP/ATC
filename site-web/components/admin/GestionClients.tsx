"use client";

// ECR-12-005 (implicite, onglet "Clients" de RG-12-001) — Liste générale des comptes Particulier et
// Entreprise, accessible aux deux rôles admin. Combine les comptes de test seedés
// (lib/mock-data/utilisateurs.ts) et les comptes créés dynamiquement pendant la démo (comptes-store.ts),
// même logique que components/admin/ValidationEntreprises.tsx.
//
// Raffinement Design — la ligne compacte n'affiche plus l'email/téléphone/date directement : il faut
// cliquer sur un client pour voir ces informations, dans une fenêtre modale (Modal.tsx, même idiome que
// GestionCatalogue.tsx). Seul le statut de validation B2B reste visible à côté du nom dans la liste (pas
// caché derrière le clic) — c'est l'information qu'un admin doit pouvoir repérer en un coup d'œil pour
// savoir si un compte Entreprise est en attente d'approbation.
import { useMemo, useState } from "react";
import { Building2, User } from "lucide-react";
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
  const [filtre, setFiltre] = useState<TypeCompte | "tous">(filtreInitial);
  const [recherche, setRecherche] = useState("");
  const [clientOuvertId, setClientOuvertId] = useState<string | null>(null);

  const tousLesUtilisateurs = useMemo(() => [...utilisateursSeed, ...utilisateursDynamiques], [utilisateursDynamiques]);
  const tousLesProfils = useMemo(() => [...profilsEntrepriseSeed, ...profilsDynamiques], [profilsDynamiques]);

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
                {profil && (
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${LIBELLES_STATUT[profil.statut_validation].classe}`}>
                    {LIBELLES_STATUT[profil.statut_validation].label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {clientOuvert && (
        <FicheClient client={clientOuvert} profil={profilOuvert} onFermer={() => setClientOuvertId(null)} />
      )}
    </div>
  );
}

function FicheClient({
  client,
  profil,
  onFermer,
}: {
  client: Utilisateur;
  profil: ProfilEntreprise | undefined;
  onFermer: () => void;
}) {
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
        <div>
          <dt className="text-texte-secondaire">Statut du compte</dt>
          <dd className="text-texte-principal">{client.statut_compte === "actif" ? "Actif" : "Suspendu"}</dd>
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
    </Modal>
  );
}
