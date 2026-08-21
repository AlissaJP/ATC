import type { NiveauAlerteStock } from "@/lib/types/entities";

// RG-03-002 — 4 états de stock. Le texte porte l'information, pas seulement la couleur (WCAG 2.2 AA).
const STYLES: Record<NiveauAlerteStock, { label: string; classe: string }> = {
  en_stock: { label: "En stock", classe: "bg-succes/10 text-succes" },
  alerte_orange: { label: "Stock faible", classe: "bg-avertissement/10 text-avertissement" },
  alerte_rouge: { label: "Stock critique", classe: "bg-danger/10 text-danger" },
  rupture: { label: "Rupture de stock", classe: "bg-texte-secondaire/10 text-texte-secondaire" },
};

export function StockBadge({ niveau }: { niveau: NiveauAlerteStock }) {
  const { label, classe } = STYLES[niveau];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${classe}`}
    >
      {label}
    </span>
  );
}
