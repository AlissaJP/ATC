"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

// BF-01-003 — Fil d'Ariane à partir du niveau catégorie. Composant client (traduction de « Accueil »),
// utilisable aussi bien depuis une page serveur que client ; les libellés `items` arrivent déjà traduits.
export interface FilAriane {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: FilAriane[] }) {
  const { t } = useTranslation();
  return (
    <nav aria-label={t("commun.filAriane")} className="mb-6 flex flex-wrap items-center gap-1 text-sm text-texte-secondaire">
      <Link href="/" className="hover:text-primaire">
        {t("commun.accueil")}
      </Link>
      {items.map((item, i) => {
        const estDernier = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight size={14} className="shrink-0" />
            {item.href ? (
              <Link href={item.href} className="hover:text-primaire">
                {item.label}
              </Link>
            ) : (
              <span
                className="font-medium text-texte-principal"
                aria-current={estDernier ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
