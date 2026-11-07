"use client";

// Connexion / Inscription Particulier — écran unique à deux modes (structure : Raffinement Design,
// RAFF-CONNEXION-SOCIALE, validé). Décision actée n°41 : comptes techniques réels non disponibles,
// développement en sandbox — les formulaires sont fonctionnels (email retrouvé parmi les comptes
// existants pour la connexion ; création réelle en mémoire pour l'inscription) mais sans vérification
// de mot de passe réelle. Un accès rapide aux comptes de test reste disponible en dessous. Le parcours
// Entreprise garde son propre écran dédié (ECR-08-001, /compte/inscription-entreprise) — la connexion
// sociale ne s'y applique pas (décision du doc de raffinement).
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, ChevronDown, ShieldCheck, User } from "lucide-react";
import { useSessionStore } from "@/lib/store/session-store";
import { useComptesStore } from "@/lib/store/comptes-store";
import { trouverAdministrateurConnexion, trouverProfilEntrepriseCombine, trouverUtilisateurConnexion } from "@/lib/services/comptes";
import { utilisateurs as utilisateursSeed } from "@/lib/mock-data/utilisateurs";
import { administrateurs } from "@/lib/mock-data/administrateurs";
import { ConnexionSociale } from "@/components/compte/ConnexionSociale";
import { useTranslation } from "@/lib/i18n/useTranslation";

type Mode = "connexion" | "inscription";

export default function ConnexionPage() {
  return (
    <Suspense fallback={null}>
      <ConnexionContenu />
    </Suspense>
  );
}

function ConnexionContenu() {
  const router = useRouter();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const modeInitial: Mode = searchParams.get("mode") === "inscription" ? "inscription" : "connexion";

  const connecterClient = useSessionStore((s) => s.connecterClient);
  const connecterAdmin = useSessionStore((s) => s.connecterAdmin);
  const inscrireParticulier = useComptesStore((s) => s.inscrireParticulier);

  const [mode, setMode] = useState<Mode>(modeInitial);
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [nom, setNom] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [comptesDemoOuverts, setComptesDemoOuverts] = useState(false);

  function seConnecterCommeClient(utilisateurId: string) {
    const utilisateur = utilisateursSeed.find((u) => u.id === utilisateurId);
    if (!utilisateur) return;
    const profil = trouverProfilEntrepriseCombine(utilisateur.id);
    connecterClient({
      type: "client",
      utilisateur_id: utilisateur.id,
      nom: utilisateur.nom,
      type_compte: utilisateur.type_compte,
      statut_validation_entreprise: profil?.statut_validation,
    });
    router.push("/");
  }

  function seConnecterCommeAdmin(administrateurId: string) {
    const administrateur = administrateurs.find((a) => a.id === administrateurId);
    if (!administrateur) return;
    connecterAdmin({ type: "admin", administrateur });
    router.push("/admin");
  }

  function soumettreConnexion(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    const administrateur = trouverAdministrateurConnexion(email);
    if (administrateur) {
      if (!motDePasse) {
        setErreur(t("connexion.erreurMotDePasse"));
        return;
      }
      connecterAdmin({ type: "admin", administrateur });
      router.push("/admin");
      return;
    }

    const utilisateur = trouverUtilisateurConnexion(email);
    if (!utilisateur) {
      setErreur(t("connexion.erreurCompte"));
      return;
    }
    if (!motDePasse) {
      setErreur(t("connexion.erreurMotDePasse"));
      return;
    }
    const profil = trouverProfilEntrepriseCombine(utilisateur.id);
    connecterClient({
      type: "client",
      utilisateur_id: utilisateur.id,
      nom: utilisateur.nom,
      type_compte: utilisateur.type_compte,
      statut_validation_entreprise: profil?.statut_validation,
    });
    router.push("/");
  }

  function soumettreInscription(e: React.FormEvent) {
    e.preventDefault();
    if (!motDePasse) {
      setErreur(t("connexion.erreurNouveauMotDePasse"));
      return;
    }
    const utilisateur = inscrireParticulier(nom, email);
    connecterClient({
      type: "client",
      utilisateur_id: utilisateur.id,
      nom: utilisateur.nom,
      type_compte: "particulier",
    });
    router.push("/");
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 md:px-6">
      <div className="flex rounded-lg border border-bordure p-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setMode("connexion")}
          className={`flex-1 rounded-md py-2 transition-colors ${
            mode === "connexion" ? "bg-primaire text-white" : "text-texte-secondaire hover:text-texte-principal"
          }`}
        >
          {t("commun.seConnecter")}
        </button>
        <button
          type="button"
          onClick={() => setMode("inscription")}
          className={`flex-1 rounded-md py-2 transition-colors ${
            mode === "inscription" ? "bg-primaire text-white" : "text-texte-secondaire hover:text-texte-principal"
          }`}
        >
          {t("connexion.creerCompte")}
        </button>
      </div>

      {mode === "connexion" ? (
        <>
          <h1 className="mt-8 font-titres text-2xl font-bold text-texte-principal">{t("connexion.titre")}</h1>
          <form onSubmit={soumettreConnexion} className="mt-6 flex flex-col gap-4">
            <label className="block text-sm">
              <span className="text-texte-secondaire">{t("connexion.email")}</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-bordure px-3 py-2.5 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
              />
            </label>
            <label className="block text-sm">
              <span className="text-texte-secondaire">{t("connexion.motDePasse")}</span>
              <input
                type="password"
                required
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="mt-1 w-full rounded-lg border border-bordure px-3 py-2.5 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
              />
            </label>
            {erreur && <p className="text-sm font-medium text-danger">{erreur}</p>}
            <button
              type="submit"
              className="mt-1 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              {t("commun.seConnecter")}
            </button>
            <Link href="/compte/mot-de-passe-oublie" className="text-center text-sm font-medium text-primaire hover:underline">
              {t("connexion.oublie")}
            </Link>
          </form>

          <div className="mt-6">
            <ConnexionSociale />
          </div>

          <p className="mt-6 text-center text-sm text-texte-secondaire">
            {t("connexion.pasDeCompte")}{" "}
            <button type="button" onClick={() => setMode("inscription")} className="font-medium text-primaire hover:underline">
              {t("connexion.creerCompte")}
            </button>
          </p>
        </>
      ) : (
        <>
          <h1 className="mt-8 font-titres text-2xl font-bold text-texte-principal">{t("connexion.creerCompte")}</h1>
          <p className="mt-2 text-sm text-texte-secondaire">
            {t("connexion.comptePro")}{" "}
            <Link href="/compte/inscription-entreprise" className="font-medium text-primaire hover:underline">
              {t("connexion.inscriptionEntreprise")}
            </Link>
          </p>
          <form onSubmit={soumettreInscription} className="mt-6 flex flex-col gap-4">
            <label className="block text-sm">
              <span className="text-texte-secondaire">{t("connexion.nomComplet")}</span>
              <input
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="mt-1 w-full rounded-lg border border-bordure px-3 py-2.5 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
              />
            </label>
            <label className="block text-sm">
              <span className="text-texte-secondaire">{t("connexion.email")}</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-bordure px-3 py-2.5 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
              />
            </label>
            <label className="block text-sm">
              <span className="text-texte-secondaire">{t("connexion.motDePasse")}</span>
              <input
                type="password"
                required
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                className="mt-1 w-full rounded-lg border border-bordure px-3 py-2.5 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
              />
            </label>
            {erreur && <p className="text-sm font-medium text-danger">{erreur}</p>}
            <button
              type="submit"
              className="mt-1 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              {t("connexion.creerMonCompte")}
            </button>
          </form>

          <div className="mt-6">
            <ConnexionSociale />
          </div>

          <p className="mt-6 text-center text-sm text-texte-secondaire">
            {t("connexion.dejaCompte")}{" "}
            <button type="button" onClick={() => setMode("connexion")} className="font-medium text-primaire hover:underline">
              {t("commun.seConnecter")}
            </button>
          </p>
        </>
      )}

      <div className="mt-10 border-t border-bordure pt-4">
        <button
          type="button"
          onClick={() => setComptesDemoOuverts((v) => !v)}
          className="flex w-full items-center justify-between text-sm font-medium text-texte-secondaire"
        >
          {t("connexion.comptesDemo")}
          <ChevronDown size={16} className={`transition-transform ${comptesDemoOuverts ? "rotate-180" : ""}`} />
        </button>

        {comptesDemoOuverts && (
          <div className="mt-4 flex flex-col gap-6">
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
                {t("connexion.comptesClients")}
              </h2>
              <div className="flex flex-col gap-2">
                {utilisateursSeed.map((u) => {
                  const profil = trouverProfilEntrepriseCombine(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => seConnecterCommeClient(u.id)}
                      className="flex items-center gap-3 rounded-lg border border-bordure bg-background p-3 text-left text-sm transition-colors hover:border-primaire"
                    >
                      {u.type_compte === "entreprise" ? (
                        <Building2 size={18} className="shrink-0 text-primaire-clair" />
                      ) : (
                        <User size={18} className="shrink-0 text-primaire-clair" />
                      )}
                      <div>
                        <p className="font-medium text-texte-principal">{u.nom}</p>
                        <p className="text-xs text-texte-secondaire">
                          {u.type_compte === "particulier"
                            ? t("connexion.particulier")
                            : t("connexion.entrepriseStatut", {
                                statut: t(
                                  profil?.statut_validation === "valide"
                                    ? "connexion.statutVerifie"
                                    : profil?.statut_validation === "en_attente"
                                      ? "connexion.statutAttente"
                                      : "connexion.statutComplement"
                                ),
                              })}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
                {t("connexion.comptesAdmins")}
              </h2>
              <div className="flex flex-col gap-2">
                {administrateurs.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => seConnecterCommeAdmin(a.id)}
                    className="flex items-center gap-3 rounded-lg border border-bordure bg-background p-3 text-left text-sm transition-colors hover:border-primaire"
                  >
                    <ShieldCheck size={18} className="shrink-0 text-accent" />
                    <div>
                      <p className="font-medium text-texte-principal">{a.nom}</p>
                      <p className="text-xs text-texte-secondaire">
                        {a.role === "general" ? t("compte.adminGeneral") : t("connexion.agentSavSupport")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
