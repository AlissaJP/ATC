"use client";

// ECR-03-001 (bloc avis, Cahier 6 l.128 : « note moyenne + liste des avis modérés ») + ECR-10-001 (dépôt
// d'avis, BF-10-006 : réservé aux clients ayant acheté le produit). RG-12-002 (statut par défaut « en
// attente de modération »). Structure : Raffinement Design, bloc « Avis clients » (validé) — synthèse à
// 2 colonnes (note moyenne + répartition par étoile) puis liste d'avis à 2 colonnes (note/auteur/date/
// badge à gauche, titre+texte à droite). Îlot client dans une page produit Server Component, comme
// AchatProduit.tsx — lit useAvisStore (Zustand, jamais disponible côté serveur) pour rester cohérent
// avec le reste de la démo (décision actée n°41) sans réintroduire le problème SSR/Zustand déjà
// documenté (lib/actions/catalogue-admin.ts).
import { useMemo, useState } from "react";
import { BadgeCheck, Star } from "lucide-react";
import { useAvisStore } from "@/lib/store/avis-store";
import { useSessionStore } from "@/lib/store/session-store";
import { useCommandeStore } from "@/lib/store/commande-store";
import { utilisateurs as utilisateursSeed } from "@/lib/mock-data/utilisateurs";
import { useComptesStore } from "@/lib/store/comptes-store";
import { Etoiles } from "./Etoiles";

function nomAuteur(utilisateurId: string, utilisateursDynamiques: typeof utilisateursSeed): string {
  return (
    utilisateursSeed.find((u) => u.id === utilisateurId)?.nom ??
    utilisateursDynamiques.find((u) => u.id === utilisateurId)?.nom ??
    "Client ATC"
  );
}

export function AvisProduit({ produitId }: { produitId: string }) {
  const session = useSessionStore((s) => s.session);
  const tousLesAvis = useAvisStore((s) => s.avis);
  const soumettreAvis = useAvisStore((s) => s.soumettreAvis);
  const utilisateursDynamiques = useComptesStore((s) => s.utilisateurs);
  const toutesLesCommandes = useCommandeStore((s) => s.commandes);
  const toutesLesLignesCommande = useCommandeStore((s) => s.lignesCommande);

  const [note, setNote] = useState(0);
  const [titre, setTitre] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [envoye, setEnvoye] = useState(false);

  const avisPublies = useMemo(
    () =>
      tousLesAvis
        .filter((a) => a.produit_id === produitId && a.statut === "publie")
        .sort((a, b) => new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()),
    [tousLesAvis, produitId]
  );

  const moyenne =
    avisPublies.length > 0 ? avisPublies.reduce((s, a) => s + a.note, 0) / avisPublies.length : undefined;

  const repartition = useMemo(() => {
    const compte = [0, 0, 0, 0, 0]; // index 0 = 1 étoile ... index 4 = 5 étoiles
    for (const a of avisPublies) compte[a.note - 1] += 1;
    return [5, 4, 3, 2, 1].map((n) => ({ note: n, nombre: compte[n - 1] }));
  }, [avisPublies]);

  // BF-10-006 — dépôt réservé aux clients ayant acheté ce produit (vérifié via leur historique de
  // commandes, pas uniquement leur session). Comme seuls des acheteurs peuvent déposer un avis, tous
  // les avis affichés ici sont par nature vérifiés — le badge reste un signal de confiance visuel.
  const aAchete = useMemo(() => {
    if (session?.type !== "client") return false;
    const idsCommandes = new Set(
      toutesLesCommandes.filter((c) => c.utilisateur_id === session.utilisateur_id).map((c) => c.id)
    );
    return toutesLesLignesCommande.some((l) => idsCommandes.has(l.commande_id) && l.produit_id === produitId);
  }, [session, toutesLesCommandes, toutesLesLignesCommande, produitId]);

  const avisExistant =
    session?.type === "client"
      ? tousLesAvis.find((a) => a.produit_id === produitId && a.utilisateur_id === session.utilisateur_id)
      : undefined;

  function soumettre() {
    if (session?.type !== "client" || note === 0 || titre.trim().length === 0) return;
    soumettreAvis(produitId, session.utilisateur_id, note, titre.trim(), commentaire.trim() || undefined);
    setEnvoye(true);
  }

  return (
    <section className="mt-12 border-t border-bordure pt-8">
      <h2 className="mb-6 font-titres text-xl font-bold text-texte-principal">Avis clients</h2>

      {avisPublies.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-bordure px-4 py-8 text-center">
          <div className="mx-auto flex flex-col items-center gap-2 text-texte-secondaire">
            <Star size={20} />
            <p className="text-sm">Aucun avis pour le moment — soyez le premier à donner votre avis.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Synthèse — 2 colonnes desktop, empilée sur mobile */}
          <div className="grid gap-8 border-b border-bordure pb-10 md:grid-cols-[minmax(0,220px)_1fr] md:gap-6">
            <div>
              <div className="flex items-center gap-2">
                <Etoiles note={Math.round(moyenne ?? 0)} taille={20} />
                <span className="font-titres text-lg font-bold text-texte-principal">
                  {moyenne?.toFixed(1)} sur 5
                </span>
              </div>
              <p className="mt-2 text-sm text-texte-secondaire">Basé sur {avisPublies.length} avis</p>
            </div>
            <div className="flex flex-col gap-3">
              {repartition.map(({ note: n, nombre }) => (
                <div key={n} className="flex items-center gap-3 text-sm">
                  <span className="w-16 shrink-0 whitespace-nowrap text-texte-secondaire">{n} étoile{n > 1 ? "s" : ""}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-fond">
                    <div
                      className="h-full rounded-full bg-avertissement"
                      style={{ width: `${avisPublies.length > 0 ? (nombre / avisPublies.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-texte-secondaire">{nombre}</span>
                </div>
              ))}
            </div>
          </div>

          <ul className="mt-2 flex flex-col divide-y divide-bordure">
            {avisPublies.map((a) => (
              <li key={a.id} className="grid gap-3 py-8 sm:grid-cols-[160px_1fr] sm:gap-6">
                <div className="flex flex-col gap-2.5">
                  <Etoiles note={a.note} taille={14} />
                  <p className="text-sm font-semibold text-texte-principal">
                    {nomAuteur(a.utilisateur_id, utilisateursDynamiques)}
                  </p>
                  <p className="text-xs text-texte-secondaire">{new Date(a.date_creation).toLocaleDateString("fr-FR")}</p>
                  <div className="flex items-center gap-1 text-xs font-medium text-succes">
                    <BadgeCheck size={14} /> Achat vérifié
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {a.titre && <p className="font-titres text-sm font-bold text-texte-principal">{a.titre}</p>}
                  {a.commentaire && <p className="text-sm text-texte-secondaire">{a.commentaire}</p>}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {aAchete && !avisExistant && !envoye && (
        <div className="mt-6 rounded-xl border border-bordure bg-fond p-5">
          <p className="mb-3 font-titres text-sm font-semibold text-texte-principal">Laisser un avis</p>
          <div className="flex items-center gap-1" role="radiogroup" aria-label="Note sur 5 étoiles">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={n === note}
                aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
                onClick={() => setNote(n)}
              >
                <Star
                  size={24}
                  className={`transition-colors ${
                    n <= note ? "fill-avertissement text-avertissement" : "text-bordure hover:text-avertissement"
                  }`}
                />
              </button>
            ))}
          </div>
          <input
            type="text"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Titre de votre avis"
            className="mt-3 w-full rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Votre commentaire (facultatif)"
            rows={3}
            className="mt-3 w-full rounded-lg border border-bordure px-3 py-2 text-sm text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
          <button
            type="button"
            disabled={note === 0 || titre.trim().length === 0}
            onClick={soumettre}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primaire px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Envoyer mon avis
          </button>
        </div>
      )}

      {(avisExistant || envoye) && (
        <p className="mt-6 text-sm text-texte-secondaire">
          {avisExistant?.statut === "publie"
            ? "Votre avis a été publié."
            : "Votre avis a bien été envoyé et est en attente de modération."}
        </p>
      )}
    </section>
  );
}
