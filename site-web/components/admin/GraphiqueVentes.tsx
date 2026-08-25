"use client";

// ECR-12-001 — « Évolution des ventes » : sélecteur de période (7 jours / 30 jours / 12 mois), infobulle
// au survol sur un point précis, export PDF via l'impression du navigateur (Enregistrer au format PDF) —
// aucune dépendance ajoutée, cohérent avec les graphiques simples déjà en place (Statistiques.tsx).
import { useMemo, useState } from "react";
import type { Commande } from "@/lib/types/entities";

type Periode = "7j" | "30j" | "12mois";

const LABELS_PERIODE: Record<Periode, string> = { "7j": "7 jours", "30j": "30 jours", "12mois": "12 mois" };
const MOIS_COURTS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const JOURS_COURTS = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];

interface Point {
  label: string;
  montant: number;
}

function pointsPourPeriode(commandes: Commande[], periode: Periode): Point[] {
  const maintenant = new Date();

  if (periode === "12mois") {
    const points: Point[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
      const montant = commandes
        .filter((c) => {
          const dc = new Date(c.date_creation);
          return dc.getFullYear() === d.getFullYear() && dc.getMonth() === d.getMonth();
        })
        .reduce((s, c) => s + c.montant_total, 0);
      points.push({ label: MOIS_COURTS[d.getMonth()], montant });
    }
    return points;
  }

  const nbJours = periode === "7j" ? 7 : 30;
  const points: Point[] = [];
  for (let i = nbJours - 1; i >= 0; i--) {
    const d = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate() - i);
    const montant = commandes
      .filter((c) => {
        const dc = new Date(c.date_creation);
        return dc.getFullYear() === d.getFullYear() && dc.getMonth() === d.getMonth() && dc.getDate() === d.getDate();
      })
      .reduce((s, c) => s + c.montant_total, 0);
    points.push({ label: periode === "7j" ? JOURS_COURTS[d.getDay()] : `${d.getDate()}/${d.getMonth() + 1}`, montant });
  }
  return points;
}

const LARGEUR = 600;
const HAUTEUR = 200;
const MARGE = 12;

export function GraphiqueVentes({ commandes }: { commandes: Commande[] }) {
  const [periode, setPeriode] = useState<Periode>("30j");
  const [indexSurvole, setIndexSurvole] = useState<number | null>(null);

  const points = useMemo(() => pointsPourPeriode(commandes, periode), [commandes, periode]);
  const max = Math.max(1, ...points.map((p) => p.montant));

  const coords = points.map((p, i) => ({
    x: MARGE + (i / Math.max(1, points.length - 1)) * (LARGEUR - 2 * MARGE),
    y: HAUTEUR - MARGE - (p.montant / max) * (HAUTEUR - 2 * MARGE),
  }));
  const chemin = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");

  function surSurvol(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const index = Math.round(xRatio * (points.length - 1));
    setIndexSurvole(Math.min(points.length - 1, Math.max(0, index)));
  }

  const totalPeriode = points.reduce((s, p) => s + p.montant, 0);
  const pointActif = indexSurvole !== null ? coords[indexSurvole] : null;
  const dateGeneration = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="rounded-xl border border-bordure bg-background p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-titres text-base font-semibold text-texte-principal">Évolution des ventes</p>
          <p className="hidden text-xs text-texte-secondaire print:block">
            Période : {LABELS_PERIODE[periode]} — généré le {dateGeneration}
          </p>
          <p className="text-xs text-texte-secondaire print:hidden">Total sur la période : ${totalPeriode.toFixed(2)}</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <div className="flex rounded-lg border border-bordure p-0.5">
            {(Object.keys(LABELS_PERIODE) as Periode[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriode(p)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  periode === p ? "bg-primaire text-white" : "text-texte-secondaire hover:bg-fond"
                }`}
              >
                {LABELS_PERIODE[p]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-bordure px-2.5 py-1 text-xs font-medium text-texte-principal hover:bg-fond"
          >
            Exporter en PDF
          </button>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`}
          className="w-full"
          onMouseMove={surSurvol}
          onMouseLeave={() => setIndexSurvole(null)}
        >
          {totalPeriode > 0 && (
            <>
              <path d={chemin} fill="none" stroke="var(--color-primaire)" strokeWidth={2} />
              {pointActif && (
                <>
                  <line
                    x1={pointActif.x}
                    y1={MARGE}
                    x2={pointActif.x}
                    y2={HAUTEUR - MARGE}
                    stroke="var(--color-bordure)"
                    strokeWidth={1}
                  />
                  <circle cx={pointActif.x} cy={pointActif.y} r={4} fill="var(--color-primaire)" />
                </>
              )}
            </>
          )}
        </svg>

        {totalPeriode === 0 && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-texte-secondaire">
            Aucune vente enregistrée sur cette période.
          </p>
        )}

        {indexSurvole !== null && points[indexSurvole] && (
          <div
            className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg border border-bordure bg-fond px-2.5 py-1.5 text-xs shadow-lg print:hidden"
            style={{ left: `${(coords[indexSurvole].x / LARGEUR) * 100}%` }}
          >
            <p className="font-medium text-texte-principal">${points[indexSurvole].montant.toFixed(2)}</p>
            <p className="text-texte-secondaire">{points[indexSurvole].label}</p>
          </div>
        )}
      </div>
    </div>
  );
}
