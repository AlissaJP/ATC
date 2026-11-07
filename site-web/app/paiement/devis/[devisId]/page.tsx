"use client";

// ECR-06-001 — Paiement d'un devis accepté.
import { use } from "react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { EcranPaiement } from "@/components/paiement/EcranPaiement";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function PaiementDevisPage(props: PageProps<"/paiement/devis/[devisId]">) {
  const { t } = useTranslation();
  const { devisId } = use(props.params);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <Breadcrumb items={[{ label: t("devis.titre"), href: "/devis" }, { label: t("paiement.titre") }]} />
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal md:text-3xl">{t("paiement.titre")}</h1>
      <EcranPaiement contexte={{ type: "devis", id: devisId }} />
    </main>
  );
}
