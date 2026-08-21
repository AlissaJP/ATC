"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useParametresStore } from "@/lib/store/parametres-store";
import type { Langue } from "@/lib/types/entities";

const LANGUES: { code: Langue; label: string }[] = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

// BF-01-004 / RG-14-001 — changement de langue manuel, à tout moment, langue par défaut FR. N'affiche que
// les langues actives (BF-12-015, Cahier 9 §5) — administrables depuis /admin/parametres.
export function LanguageSelector() {
  const [ouvert, setOuvert] = useState(false);
  const { langue, definirLangue } = useTranslation();
  const languesActives = useParametresStore((s) => s.langues_actives);
  const languesDisponibles = LANGUES.filter((l) => languesActives.includes(l.code));

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex h-11 items-center gap-1 rounded-lg px-2 text-sm font-medium text-texte-principal hover:bg-fond"
        aria-haspopup="listbox"
        aria-expanded={ouvert}
        onClick={() => setOuvert((v) => !v)}
      >
        <Globe size={20} />
        <span className="hidden sm:inline">{langue.toUpperCase()}</span>
      </button>
      {ouvert && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOuvert(false)} />
          <ul
            role="listbox"
            className="absolute right-0 z-20 mt-1 w-24 overflow-hidden rounded-lg border border-bordure bg-background shadow-lg"
          >
            {languesDisponibles.map((l) => (
              <li key={l.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={langue === l.code}
                  className={`block w-full px-3 py-2 text-left text-sm hover:bg-fond ${
                    langue === l.code ? "font-semibold text-primaire" : "text-texte-principal"
                  }`}
                  onClick={() => {
                    definirLangue(l.code);
                    setOuvert(false);
                  }}
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
