import Link from "next/link";
import { Building2, User } from "lucide-react";
import { obtenirTraduction } from "@/lib/i18n/serveur";

// BF-08-001 — Création de compte avec distinction Entreprise/Particulier dès l'inscription.
export default async function InscriptionPage() {
  const { t } = await obtenirTraduction();
  return (
    <main className="mx-auto w-full max-w-lg px-4 py-12 md:px-6">
      <h1 className="font-titres text-2xl font-bold text-texte-principal">{t("inscription.titre")}</h1>
      <p className="mt-2 text-sm text-texte-secondaire">
        {t("inscription.dejaInscrit")}{" "}
        <Link href="/compte/connexion" className="font-medium text-primaire hover:underline">
          {t("commun.seConnecter")}
        </Link>
      </p>

      <div className="mt-8 flex flex-col gap-4">
        <Link
          href="/compte/connexion?mode=inscription"
          className="flex items-center gap-4 rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire"
        >
          <User size={28} className="shrink-0 text-primaire-clair" />
          <div>
            <p className="font-titres text-base font-semibold text-texte-principal">{t("compte.compteParticulier")}</p>
            <p className="text-sm text-texte-secondaire">{t("inscription.particulierTexte")}</p>
          </div>
        </Link>
        <Link
          href="/compte/inscription-entreprise"
          className="flex items-center gap-4 rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire"
        >
          <Building2 size={28} className="shrink-0 text-primaire-clair" />
          <div>
            <p className="font-titres text-base font-semibold text-texte-principal">{t("compte.compteEntreprise")}</p>
            <p className="text-sm text-texte-secondaire">
              {t("inscription.entrepriseTexte")}
            </p>
          </div>
        </Link>
      </div>
    </main>
  );
}
