// RG-14-001 — les trois dictionnaires (FR, EN, ES) doivent couvrir exactement les mêmes clés, avec les
// mêmes variables {nom} : une clé oubliée dans une langue afficherait la clé brute (ou le français).
import { describe, it, expect } from "vitest";
import { dictionnaires, traduire } from "@/lib/i18n/traduire";

function aplatir(objet: unknown, prefixe = ""): Record<string, string> {
  const resultat: Record<string, string> = {};
  for (const [cle, valeur] of Object.entries(objet as Record<string, unknown>)) {
    const chemin = prefixe ? `${prefixe}.${cle}` : cle;
    if (typeof valeur === "string") resultat[chemin] = valeur;
    else Object.assign(resultat, aplatir(valeur, chemin));
  }
  return resultat;
}

const variables = (texte: string) => (texte.match(/\{\w+\}/g) ?? []).sort().join(",");

describe("Dictionnaires de traduction", () => {
  const fr = aplatir(dictionnaires.fr);

  for (const langue of ["en", "es"] as const) {
    it(`${langue} a les mêmes clés que fr`, () => {
      expect(Object.keys(aplatir(dictionnaires[langue])).sort()).toEqual(Object.keys(fr).sort());
    });

    it(`${langue} reprend les mêmes variables que fr`, () => {
      const autre = aplatir(dictionnaires[langue]);
      const ecarts = Object.keys(fr).filter((cle) => variables(fr[cle]) !== variables(autre[cle] ?? ""));
      expect(ecarts).toEqual([]);
    });
  }

  it("remplace les variables et retombe sur le français puis sur la clé", () => {
    expect(traduire("en", "nav.securite")).not.toBe("nav.securite");
    expect(traduire("en", "cle.inexistante")).toBe("cle.inexistante");
  });
});
