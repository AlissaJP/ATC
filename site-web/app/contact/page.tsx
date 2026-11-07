// ECR-11-003 (BF-11-006) — Formulaire de contact + accès WhatsApp.
import { MessageCircle, Store } from "lucide-react";
import { FormulaireContact } from "@/components/contact/FormulaireContact";
import { WHATSAPP_LIEN, WHATSAPP_NUMERO_AFFICHE } from "@/lib/constants/contact";
import { obtenirTraduction } from "@/lib/i18n/serveur";

export default async function ContactPage() {
  const { t } = await obtenirTraduction();
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 md:px-6">
      <h1 className="mb-2 font-titres text-3xl font-bold text-texte-principal">{t("contact.titre")}</h1>
      <p className="mb-8 text-texte-secondaire">
        {t("contact.intro")}
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <a
          href={WHATSAPP_LIEN}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-bordure bg-background p-5 transition-colors hover:border-primaire"
        >
          <MessageCircle size={22} className="shrink-0 text-succes" />
          <div>
            <p className="font-titres text-sm font-semibold text-texte-principal">WhatsApp</p>
            <p className="text-sm text-texte-secondaire">{WHATSAPP_NUMERO_AFFICHE}</p>
          </div>
        </a>
        <div className="flex items-center gap-3 rounded-xl border border-bordure bg-background p-5">
          <Store size={22} className="shrink-0 text-primaire-clair" />
          <div>
            <p className="font-titres text-sm font-semibold text-texte-principal">{t("contact.retrait")}</p>
            <p className="text-sm text-texte-secondaire">{t("contact.retraitTexte")}</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <FormulaireContact />
      </div>
    </main>
  );
}
