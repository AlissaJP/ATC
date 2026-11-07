// ECR-08-001 — Inscription Entreprise (étapes 1 et 2). RG-08-001, RG-08-002. BF-08-006, BF-08-007.
import { InscriptionEntreprise } from "@/components/compte/InscriptionEntreprise";
import { obtenirTraduction } from "@/lib/i18n/serveur";

export default async function InscriptionEntreprisePage() {
  const { t } = await obtenirTraduction();
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
      <h1 className="mb-2 text-center font-titres text-2xl font-bold text-texte-principal md:text-3xl">
        {t("entreprise.titre")}
      </h1>
      <p className="mb-8 text-center text-texte-secondaire">
        {t("entreprise.intro")}
      </p>
      <InscriptionEntreprise />
    </main>
  );
}
