"use client";

// BF-11-001/BF-11-002 — Accordéon d'affichage FAQ (île client dans une page produit Server Component,
// même schéma que components/product/AchatProduit.tsx).
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { QuestionFAQ } from "@/lib/mock-data/faq";

export function AccordeonFAQ({ questions }: { questions: QuestionFAQ[] }) {
  const [ouvertId, setOuvertId] = useState<string | null>(questions[0]?.id ?? null);

  return (
    <div className="flex flex-col gap-2">
      {questions.map((q) => {
        const ouvert = ouvertId === q.id;
        return (
          <div key={q.id} className="rounded-xl border border-bordure bg-background">
            <button
              type="button"
              onClick={() => setOuvertId(ouvert ? null : q.id)}
              aria-expanded={ouvert}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
            >
              <span className="text-sm font-semibold text-texte-principal">{q.question}</span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-texte-secondaire transition-transform ${ouvert ? "rotate-180" : ""}`}
              />
            </button>
            {ouvert && <p className="px-4 pb-4 text-sm text-texte-secondaire">{q.reponse}</p>}
          </div>
        );
      })}
    </div>
  );
}
