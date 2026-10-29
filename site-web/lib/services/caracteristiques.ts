// Intégration du catalogue ATC (étape 5) — découpe le texte brut des caractéristiques client
// (Produit.caracteristiques) en une ligne par élément pour la fiche produit. Séparateur : virgule suivie
// d'un espace — jamais dans un nombre décimal (« 34,9 kg » : pas d'espace après la virgule) ni entre
// parenthèses (« (fiche SMA : 120 V nominal, plage 105 à 132 V…) »). Les packages séparent leurs éléments
// par « · » et gardent la virgule pour une énumération (« Cible : Particuliers, diaspora ») : quand « · »
// est présent, lui seul sépare.
// « Aucune donnée » / « Aucune fiche fournie » : mentions du fichier client pour une information absente,
// aucune ligne à afficher.
const MENTIONS_ABSENCE = ["aucune donnée", "aucune fiche fournie"];

export function listerCaracteristiques(texte: string | undefined): string[] {
  if (!texte || MENTIONS_ABSENCE.includes(texte.trim().toLowerCase())) return [];

  const separateurPoint = texte.includes("·");
  const elements: string[] = [];
  let profondeur = 0;
  let courant = "";
  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (c === "(") profondeur += 1;
    else if (c === ")") profondeur = Math.max(0, profondeur - 1);

    const separateur =
      profondeur === 0 && (separateurPoint ? c === "·" : c === "," && /\s/.test(texte[i + 1] ?? ""));
    if (separateur) {
      elements.push(courant);
      courant = "";
    } else {
      courant += c;
    }
  }
  elements.push(courant);

  return elements
    .map((e) => e.trim())
    .filter(Boolean)
    .map((e) => e.charAt(0).toUpperCase() + e.slice(1));
}
