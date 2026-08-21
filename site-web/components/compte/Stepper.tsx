import { Check } from "lucide-react";

// Stepper (indicateur d'étapes) — Cahier 7 §4. États : à venir / en cours / complété.
export function Stepper({ etapes, etapeActuelle }: { etapes: string[]; etapeActuelle: number }) {
  return (
    <ol className="flex items-start">
      {etapes.map((label, i) => {
        const numero = i + 1;
        const complete = numero < etapeActuelle;
        const active = numero === etapeActuelle;
        return (
          <li key={label} className="flex flex-1 flex-col items-center last:flex-none">
            <div className="flex w-full items-center">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  complete
                    ? "bg-succes text-white"
                    : active
                      ? "bg-primaire text-white"
                      : "bg-bordure text-texte-secondaire"
                }`}
                aria-current={active ? "step" : undefined}
              >
                {complete ? <Check size={16} /> : numero}
              </div>
              {numero < etapes.length && (
                <div className={`mx-1 h-0.5 flex-1 ${complete ? "bg-succes" : "bg-bordure"}`} />
              )}
            </div>
            <span
              className={`mt-1.5 max-w-20 text-center text-xs ${
                active ? "font-semibold text-texte-principal" : "text-texte-secondaire"
              }`}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
