"use client";

import { Clock, ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useSessionStore, estClientB2BVerifie } from "@/lib/store/session-store";
import { ParallaxImage } from "@/components/ui/ParallaxImage";

const AVANTAGES = [
  "Barème de prix par palier de quantité",
  "Facturation pro forma automatique",
  "Devis pour packages solaires sur-mesure",
];

// BF-01-010 — Section « Devenir client professionnel » incitant à l'inscription B2B (RG-08-001).
// Raffinement Design : masquée (pas seulement désactivée) pour un compte Entreprise déjà validé — n'a
// plus lieu d'être puisqu'il a déjà accès au tarif professionnel. Dossier encore en attente (en_attente/
// complement_demande) : remplacée par un message de statut plutôt que masquée ou laissée telle quelle —
// pas de règle dans le Cahier pour ce cas précis (RG-08-001 ne couvre que l'espace client), décision
// prise en cohérence avec l'affichage du statut déjà fait là-bas. « rejete » : section inchangée
// (l'utilisateur peut vouloir soumettre un nouveau dossier).
export function BlocDevenirPro() {
  const { t } = useTranslation();
  const session = useSessionStore((s) => s.session);

  if (estClientB2BVerifie(session)) {
    return null;
  }

  const dossierEnAttente =
    session?.type === "client" &&
    session.type_compte === "entreprise" &&
    (session.statut_validation_entreprise === "en_attente" || session.statut_validation_entreprise === "complement_demande");

  if (dossierEnAttente) {
    return (
      <section className="flex items-center gap-3 rounded-2xl border border-bordure bg-fond p-6">
        <Clock size={22} className="shrink-0 text-primaire-clair" />
        <p className="text-sm font-medium text-texte-principal">Votre compte professionnel est en cours de validation.</p>
      </section>
    );
  }

  return (
    <section className="grid gap-8 overflow-hidden rounded-2xl border border-bordure bg-fond md:grid-cols-2">
      <div className="relative order-2 hidden min-h-[280px] md:order-1 md:block">
        <ParallaxImage amplitude={20}>
          <Image
            src="/images/entreprise/devenir-client-professionnel.webp"
            alt="Équipe professionnelle analysant ses données de vente et d'achat en réunion"
            fill
            className="object-cover"
            sizes="50vw"
          />
        </ParallaxImage>
      </div>
      <div className="order-1 flex flex-col justify-center p-6 sm:p-10 md:order-2">
        <h2 className="mt-2 font-titres text-2xl font-bold text-texte-principal md:text-3xl">
          {t("accueil.blocProTitre")}
        </h2>
        <p className="mt-2 text-sm text-texte-secondaire">{t("accueil.blocProTexte")}</p>
        <ul className="mt-5 flex flex-col gap-3">
          {AVANTAGES.map((avantage) => (
            <li key={avantage} className="flex items-start gap-2 text-sm text-texte-principal">
              <Check size={18} className="mt-0.5 shrink-0 text-succes" />
              {avantage}
            </li>
          ))}
        </ul>
        <Link
          href="/compte/inscription-entreprise"
          className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg border-2 border-primaire px-5 py-3 text-sm font-semibold text-primaire transition-colors hover:bg-primaire/5"
        >
          {t("accueil.blocProCta")}
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
