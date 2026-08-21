import Link from "next/link";
import { ChevronRight } from "lucide-react";

// BF-01-003 — Fil d'Ariane à partir du niveau catégorie.
export interface FilAriane {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: FilAriane[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-texte-secondaire">
      <Link href="/" className="hover:text-primaire">
        Accueil
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
