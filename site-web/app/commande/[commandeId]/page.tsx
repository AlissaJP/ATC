"use client";

import { use } from "react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CommandeConfirmation } from "@/components/commande/CommandeConfirmation";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function CommandePage(props: PageProps<"/commande/[commandeId]">) {
  const { commandeId } = use(props.params);
  const { t } = useTranslation();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
      <Breadcrumb
        items={[
          { label: t("panier.titre"), href: "/panier" },
          { label: t("commande.filPaiement") },
          { label: t("commande.filConfirmation") },
        ]}
      />
      <h1 className="mb-6 font-titres text-2xl font-bold text-texte-principal md:text-3xl">
        {t("commande.titre")}
      </h1>
      <CommandeConfirmation commandeId={commandeId} />
    </main>
  );
}
