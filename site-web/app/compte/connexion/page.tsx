"use client";

// Connexion. Décision actée n°41 : comptes techniques réels non disponibles, développement en
// sandbox — le formulaire est fonctionnel (email retrouvé parmi les comptes existants) mais
// n'effectue aucune vérification de mot de passe réelle. Un accès rapide aux comptes de test reste
// disponible en dessous pour explorer la plateforme sans créer de compte.
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, ChevronDown, ShieldCheck, User } from "lucide-react";
import { useSessionStore } from "@/lib/store/session-store";
import { trouverAdministrateurConnexion, trouverProfilEntrepriseCombine, trouverUtilisateurConnexion } from "@/lib/services/comptes";
import { utilisateurs as utilisateursSeed } from "@/lib/mock-data/utilisateurs";
import { administrateurs } from "@/lib/mock-data/administrateurs";

export default function ConnexionPage() {
  const router = useRouter();
  const connecterClient = useSessionStore((s) => s.connecterClient);
  const connecterAdmin = useSessionStore((s) => s.connecterAdmin);

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
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
        setErreur("Veuillez saisir votre mot de passe.");
        return;
      }
      connecterAdmin({ type: "admin", administrateur });
      router.push("/admin");
      return;
    }

    const utilisateur = trouverUtilisateurConnexion(email);
    if (!utilisateur) {
      setErreur("Aucun compte ne correspond à cet email.");
      return;
    }
    if (!motDePasse) {
      setErreur("Veuillez saisir votre mot de passe.");
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

  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 md:px-6">
      <h1 className="font-titres text-2xl font-bold text-texte-principal">Connexion</h1>
      <p className="mt-2 text-sm text-texte-secondaire">
        Pas encore de compte ?{" "}
        <Link href="/compte/inscription" className="font-medium text-primaire hover:underline">
          Créer un compte
        </Link>
      </p>

      <form onSubmit={soumettreConnexion} className="mt-6 flex flex-col gap-4">
        <label className="block text-sm">
          <span className="text-texte-secondaire">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2.5 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>
        <label className="block text-sm">
          <span className="text-texte-secondaire">Mot de passe</span>
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
          className="mt-1 rounded-lg bg-primaire px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Se connecter
        </button>
      </form>

      <div className="mt-10 border-t border-bordure pt-4">
        <button
          type="button"
          onClick={() => setComptesDemoOuverts((v) => !v)}
          className="flex w-full items-center justify-between text-sm font-medium text-texte-secondaire"
        >
          Comptes de démonstration
          <ChevronDown size={16} className={`transition-transform ${comptesDemoOuverts ? "rotate-180" : ""}`} />
        </button>

        {comptesDemoOuverts && (
          <div className="mt-4 flex flex-col gap-6">
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
                Comptes clients
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
                            ? "Particulier"
                            : `Entreprise — ${
                                profil?.statut_validation === "valide"
                                  ? "B2B vérifié"
                                  : profil?.statut_validation === "en_attente"
                                    ? "en attente"
                                    : "complément demandé"
                              }`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
                Comptes administrateurs
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
                        {a.role === "general" ? "Administrateur Général" : "Agent SAV / Support"}
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
