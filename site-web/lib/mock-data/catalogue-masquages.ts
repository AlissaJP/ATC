// Audit A-12 — notes internes du fichier client masquées à l'affichage, dans les 3 langues. Le fichier
// client (catalogue-atc.json) et ses traductions restent intacts : ces masques sont à retirer dès que le
// client aura réécrit les passages concernés.
import type { Langue } from "@/lib/types/entities";

type Champ = "description" | "caracteristiques";

// Passages retirés du texte (le reste est conservé tel quel).
const PASSAGES_RETIRES: Record<string, Partial<Record<Champ, string[]>>> = {
  "ES-09": {
    caracteristiques: [" (seule donnée fournie)", " (only data provided)", " (único dato proporcionado)"],
  },
  "ES-13": {
    caracteristiques: [
      " (soit environ 100 Ah, déduit de 5,12 kWh à 51,2 V)",
      " (i.e. about 100 Ah, derived from 5.12 kWh at 51.2 V)",
      " (es decir, unos 100 Ah, deducido de 5,12 kWh a 51,2 V)",
    ],
  },
  "PK-05": {
    caracteristiques: [" (schéma de la fiche SMA et photo)", " (SMA datasheet diagram and photo)", " (esquema de la ficha SMA y foto)"],
  },
};

// Textes entièrement internes : remplacés (chaîne vide = rien affiché).
const TEXTES_REMPLACES: Record<string, Partial<Record<Champ, Record<Langue, string>>>> = {
  "ES-24": { description: { fr: "", en: "", es: "" } },
  "ES-22": { caracteristiques: { fr: "", en: "", es: "" } },
  "CL-S": {
    description: {
      fr: "Service professionnel résidentiel et commercial.",
      en: "Professional residential and commercial service.",
      es: "Servicio profesional residencial y comercial.",
    },
  },
};

// Packages : segment « Cible : … » (segmentation commerciale interne) retiré de la liste « · ».
const SEGMENT_CIBLE = /^\s*(Cible|Target|Público)\s*:/;

export function masquerNotesInternes(
  ref: string | undefined,
  langue: Langue,
  champ: Champ,
  texte: string | undefined
): string | undefined {
  if (texte === undefined || !ref) return texte;
  const remplacement = TEXTES_REMPLACES[ref]?.[champ]?.[langue];
  if (remplacement !== undefined) return remplacement;

  let resultat = texte;
  for (const passage of PASSAGES_RETIRES[ref]?.[champ] ?? []) resultat = resultat.split(passage).join("");
  if (champ === "caracteristiques" && resultat.includes("·")) {
    resultat = resultat
      .split("·")
      .filter((segment) => !SEGMENT_CIBLE.test(segment))
      .join("·")
      .trim();
  }
  return resultat;
}
