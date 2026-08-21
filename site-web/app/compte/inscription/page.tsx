import Link from "next/link";
import { Building2, User } from "lucide-react";

// BF-08-001 — Création de compte avec distinction Entreprise/Particulier dès l'inscription.
export default function InscriptionPage() {
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-12 md:px-6">
      <h1 className="font-titres text-2xl font-bold text-texte-principal">Créer un compte</h1>
      <p className="mt-2 text-sm text-texte-secondaire">
        Déjà inscrit ?{" "}
        <Link href="/compte/connexion" className="font-medium text-primaire hover:underline">
          Se connecter
        </Link>
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <Link
          href="/compte/inscription-particulier"
          className="flex items-center gap-4 rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire"
        >
          <User size={28} className="shrink-0 text-primaire-clair" />
          <div>
            <p className="font-titres text-base font-semibold text-texte-principal">Compte Particulier</p>
            <p className="text-sm text-texte-secondaire">Achats au détail, devis et suivi de commandes.</p>
          </div>
        </Link>
        <Link
          href="/compte/inscription-entreprise"
          className="flex items-center gap-4 rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire"
        >
          <Building2 size={28} className="shrink-0 text-primaire-clair" />
          <div>
            <p className="font-titres text-base font-semibold text-texte-principal">Compte Entreprise</p>
            <p className="text-sm text-texte-secondaire">
              Barème de prix par palier, facturation pro forma — sous réserve de validation.
            </p>
          </div>
        </Link>
      </div>
    </main>
  );
}
