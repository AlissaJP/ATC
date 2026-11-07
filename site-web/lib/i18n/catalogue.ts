// RG-14-001 — traduction du contenu catalogue à l'affichage. Le français (catalogue-atc.json, données
// mock) reste la source ; les traductions EN/ES vivent à part (catalogue-atc-traductions.json, à faire
// valider par le client), indexées par référence — comme une future table `product_translations`.
// À n'appeler qu'au moment d'afficher (jamais sur des données réutilisées ensuite) : un produit déjà
// localisé ne doit pas repasser dans le panier, les stores ou les services.
import traductionsCatalogue from "@/lib/mock-data/catalogue-atc-traductions.json";
import type { Categorie, Langue, PackagePreconfigure, Produit, VarianteProduit } from "@/lib/types/entities";
import { traduire } from "./traduire";
import { masquerNotesInternes } from "@/lib/mock-data/catalogue-masquages";

interface TraductionEntree {
  nom?: string;
  description?: string;
  caracteristiques?: string;
  variantes?: Record<string, string>; // id de variante → valeur traduite (ex. couleurs)
}

const traductions = traductionsCatalogue as unknown as Partial<Record<Langue, Record<string, TraductionEntree>>>;

// Les notes internes du fichier client sont masquées aussi dans les traductions (audit A-12).
function traductionDe(ref: string | undefined, langue: Langue): TraductionEntree | undefined {
  const tr = langue === "fr" || !ref ? undefined : traductions[langue]?.[ref];
  if (!tr) return undefined;
  return {
    ...tr,
    description: masquerNotesInternes(ref, langue, "description", tr.description),
    caracteristiques: masquerNotesInternes(ref, langue, "caracteristiques", tr.caracteristiques),
  };
}

export function localiserProduit(produit: Produit, langue: Langue): Produit {
  const tr = traductionDe(produit.ref, langue);
  const attributs = langue !== "fr" && produit.variantes;
  if (!tr && !attributs) return produit;
  return {
    ...produit,
    nom: tr?.nom ?? produit.nom,
    description: tr?.description ?? produit.description,
    caracteristiques: tr?.caracteristiques ?? produit.caracteristiques,
    variantes: produit.variantes?.map((v) => ({
      ...v,
      attribut: libelleAttribut(v.attribut, langue),
      valeur: tr?.variantes?.[v.id] ?? v.valeur,
    })),
  };
}

export function localiserPackage(pkg: PackagePreconfigure, langue: Langue): PackagePreconfigure {
  const tr = traductionDe(pkg.ref, langue);
  if (!tr) return pkg;
  return {
    ...pkg,
    nom: tr.nom ?? pkg.nom,
    description: tr.description ?? pkg.description,
    caracteristiques: tr.caracteristiques ?? pkg.caracteristiques,
  };
}

// Noms de catégories : textes du site (dictionnaires, clé = id), le nom français en repli (ex. une
// catégorie créée plus tard sans traduction).
export function nomCategorie(categorie: Categorie, langue: Langue): string {
  const cle = `categories.${categorie.id}`;
  const traduit = traduire(langue, cle);
  return traduit === cle ? categorie.nom : traduit;
}

// Attributs de variantes (« Puissance », « Capacité », « Couleur ») : dictionnaires, repli sur le français.
export function libelleAttribut(attribut: string, langue: Langue): string {
  const cle = `variantes.${attribut}`;
  const traduit = traduire(langue, cle);
  return traduit === cle ? attribut : traduit;
}

// Libellé « Produit — Attribut valeur » dans la langue du visiteur (panier, commande, reçu, facture),
// à partir des objets source résolus par resoudreProduitEtVariante.
export function nomLigneLocalise(produit: Produit, variante: VarianteProduit | undefined, langue: Langue): string {
  const local = localiserProduit(produit, langue);
  const varianteLocale = variante ? local.variantes?.find((v) => v.id === variante.id) : undefined;
  return varianteLocale ? `${local.nom} — ${varianteLocale.attribut} ${varianteLocale.valeur}` : local.nom;
}
