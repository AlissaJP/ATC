"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search } from "lucide-react";
import { rechercherProduits } from "@/lib/services/recherche";
import type { Produit } from "@/lib/types/entities";
import { useTranslation } from "@/lib/i18n/useTranslation";

// ECR-02-001 — Suggestions affichées dès 2 caractères saisis, avec image miniature par résultat (Cahier 7 §7).
export function SearchBar({
  className = "",
  onNavigate,
  autoFocus = false,
  valeurInitiale = "",
}: {
  className?: string;
  onNavigate?: () => void;
  autoFocus?: boolean;
  valeurInitiale?: string;
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [requete, setRequete] = useState(valeurInitiale);
  const [suggestions, setSuggestions] = useState<Produit[]>([]);
  const [ouvert, setOuvert] = useState(false);
  const conteneurRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (requete.trim().length < 2) return;
    let annule = false;
    rechercherProduits(requete, 6).then((resultats) => {
      if (!annule) setSuggestions(resultats);
    });
    return () => {
      annule = true;
    };
  }, [requete]);

  useEffect(() => {
    function surClicExterieur(e: MouseEvent) {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target as Node)) {
        setOuvert(false);
      }
    }
    document.addEventListener("mousedown", surClicExterieur);
    return () => document.removeEventListener("mousedown", surClicExterieur);
  }, []);

  function allerAuxResultats(e?: React.FormEvent) {
    e?.preventDefault();
    if (requete.trim().length === 0) return;
    setOuvert(false);
    onNavigate?.();
    router.push(`/recherche?q=${encodeURIComponent(requete.trim())}`);
  }

  return (
    <form
      ref={conteneurRef}
      role="search"
      onSubmit={allerAuxResultats}
      className={`relative flex items-center rounded-full border border-bordure bg-fond px-3 py-2 ${className}`}
    >
      <Search size={18} className="text-texte-secondaire" />
      <input
        type="text"
        value={requete}
        autoFocus={autoFocus}
        onChange={(e) => {
          setRequete(e.target.value);
          setOuvert(true);
        }}
        onFocus={() => setOuvert(true)}
        placeholder={t("nav.recherche")}
        aria-label={t("nav.recherche")}
        className="ml-2 w-full bg-transparent text-sm text-texte-principal placeholder:text-texte-secondaire focus:outline-none"
      />

      {ouvert && requete.trim().length >= 2 && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-96 overflow-y-auto rounded-xl border border-bordure bg-background shadow-lg">
          <ul>
            {suggestions.map((produit) => (
              <li key={produit.id}>
                <a
                  href={`/produit/${produit.slug}`}
                  onClick={() => {
                    setOuvert(false);
                    onNavigate?.();
                  }}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-fond"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-fond">
                    {produit.images[0] && (
                      <Image src={produit.images[0]} alt="" fill className="object-cover" sizes="40px" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-texte-principal">{produit.nom}</p>
                    <p className="text-xs text-texte-secondaire">${produit.prix_public.toFixed(2)}</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
          <button
            type="submit"
            className="block w-full border-t border-bordure px-3 py-2 text-left text-sm font-medium text-primaire hover:bg-fond"
          >
            Voir tous les résultats pour « {requete} »
          </button>
        </div>
      )}
    </form>
  );
}
