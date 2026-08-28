"use client";

// Raffinement Design — gestion du stock (back-office), présentée par catégorie (même idiome que
// Catalogue, GestionCatalogue.tsx) plutôt qu'en 3 paniers globaux tous produits confondus : chaque
// catégorie affiche ses produits avec un statut coloré (vert/jaune/rouge, RG-03-002) et les dates de
// dernière entrée/sortie, puis un historique complet des mouvements (entrées/sorties, décision actée
// n°47) pour une vue globale des transactions liées au stock de la catégorie active. Éditable directement
// ici (bouton "Mouvement" par ligne) — c'est la seule section pour gérer le stock, le Catalogue ne le
// montre plus (cf. GestionCatalogue.tsx).
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, PackageSearch } from "lucide-react";
import type { Categorie, MouvementStock, Produit, Stock, TypeMouvementStock } from "@/lib/types/entities";
import { categoriesRacinesOrdonnees, idsCategorieEtEnfants } from "@/lib/services/categories-admin";
import { construireSuiviStock, type LigneSuiviStock, type PanierStock } from "@/lib/services/suivi-stock";
import { derniereDateMouvement, filtrerMouvementsStock } from "@/lib/services/mouvements-stock";
import { enregistrerMouvementStockAction } from "@/lib/actions/stock-admin";
import { Modal } from "@/components/ui/Modal";

const LIBELLES_PANIER: Record<PanierStock, { label: string; classe: string }> = {
  vert: { label: "En stock", classe: "bg-succes/10 text-succes" },
  jaune: { label: "Stock faible", classe: "bg-avertissement/10 text-avertissement" },
  rouge: { label: "Stock critique", classe: "bg-danger/10 text-danger" },
};

type Periode = "30" | "90" | "tout";
const LIBELLES_PERIODE: Record<Periode, string> = {
  "30": "30 derniers jours",
  "90": "90 derniers jours",
  tout: "Toute la période",
};

function formaterDateCourte(iso: string | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
function formaterDateHeure(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export function SuiviStock({
  produits,
  stock,
  categories,
  mouvements,
}: {
  produits: Produit[];
  stock: Stock[];
  categories: Categorie[];
  mouvements: MouvementStock[];
}) {
  const router = useRouter();
  const categoriesRacines = useMemo(() => categoriesRacinesOrdonnees(categories), [categories]);
  const [ongletId, setOngletId] = useState<string | undefined>(() => categoriesRacines[0]?.id);
  const [ligneMouvement, setLigneMouvement] = useState<LigneSuiviStock | null>(null);
  const [typeFiltre, setTypeFiltre] = useState<TypeMouvementStock | "">("");
  const [periode, setPeriode] = useState<Periode>("30");

  const idsCategorieOnglet = useMemo(
    () => (ongletId ? idsCategorieEtEnfants(categories, ongletId) : new Set<string>()),
    [categories, ongletId]
  );

  const toutesLesLignes = useMemo(() => construireSuiviStock(produits, stock, categories), [produits, stock, categories]);
  const lignesCategorie = useMemo(
    () => toutesLesLignes.filter((l) => idsCategorieOnglet.has(l.categorieId)),
    [toutesLesLignes, idsCategorieOnglet]
  );
  const produitIdsCategorie = useMemo(
    () => new Set(lignesCategorie.map((l) => l.produitId)),
    [lignesCategorie]
  );

  const depuis = useMemo(() => {
    if (periode === "tout") return undefined;
    const d = new Date();
    d.setDate(d.getDate() - Number(periode));
    return d;
  }, [periode]);

  const mouvementsCategorie = useMemo(
    () =>
      filtrerMouvementsStock(mouvements, {
        produitIds: produitIdsCategorie,
        type: typeFiltre || undefined,
        depuis,
      }),
    [mouvements, produitIdsCategorie, typeFiltre, depuis]
  );

  function nomProduitMouvement(m: MouvementStock): string {
    return toutesLesLignes.find((l) => l.produitId === m.produit_id && l.varianteId === m.variante_id)?.nom ?? "—";
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {categoriesRacines.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setOngletId(c.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              ongletId === c.id ? "bg-primaire text-white" : "bg-fond text-texte-secondaire"
            }`}
          >
            {c.nom}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-bordure">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="bg-fond text-left text-texte-secondaire">
              <th scope="col" className="px-3 py-2 font-medium">Produit</th>
              <th scope="col" className="px-3 py-2 font-medium">Statut</th>
              <th scope="col" className="px-3 py-2 font-medium">Quantité</th>
              <th scope="col" className="px-3 py-2 font-medium">Dernière entrée</th>
              <th scope="col" className="px-3 py-2 font-medium">Dernière sortie</th>
              <th scope="col" className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {lignesCategorie.map((l) => {
              const badge = LIBELLES_PANIER[l.panier];
              const derniereEntree = derniereDateMouvement(mouvements, l.produitId, "entree", l.varianteId);
              const derniereSortie = derniereDateMouvement(mouvements, l.produitId, "sortie", l.varianteId);
              return (
                <tr key={l.id} className="border-t border-bordure text-texte-principal">
                  <td className="px-3 py-2">
                    <p className="font-medium">{l.nom}</p>
                    <p className="text-xs text-texte-secondaire">{l.categorieNom}</p>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${badge.classe}`}>
                      {l.panier === "rouge" && <AlertTriangle size={11} />}
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-semibold">{l.quantite === undefined ? "Non suivi" : l.quantite}</td>
                  <td className="px-3 py-2 text-texte-secondaire">{formaterDateCourte(derniereEntree)}</td>
                  <td className="px-3 py-2 text-texte-secondaire">{formaterDateCourte(derniereSortie)}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => setLigneMouvement(l)}
                      className="rounded-lg border border-bordure px-3 py-1.5 text-xs font-semibold text-texte-principal hover:bg-fond"
                    >
                      Mouvement
                    </button>
                  </td>
                </tr>
              );
            })}
            {lignesCategorie.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-sm text-texte-secondaire">
                  Aucun produit dans cette catégorie.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Historique des mouvements — vue globale des transactions de stock (entrées/sorties) pour la
          catégorie active, décision actée n°47. */}
      <div className="mt-8">
        <p className="mb-3 font-titres text-base font-semibold text-texte-principal">Historique des mouvements</p>

        <div className="mb-3 flex flex-wrap gap-3">
          <label className="text-sm">
            <span className="sr-only">Type de mouvement</span>
            <select
              value={typeFiltre}
              onChange={(e) => setTypeFiltre(e.target.value as TypeMouvementStock | "")}
              className="rounded-lg border border-bordure bg-background px-3 py-2 text-sm text-texte-principal"
            >
              <option value="">Entrées et sorties</option>
              <option value="entree">Entrées uniquement</option>
              <option value="sortie">Sorties uniquement</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="sr-only">Période</span>
            <select
              value={periode}
              onChange={(e) => setPeriode(e.target.value as Periode)}
              className="rounded-lg border border-bordure bg-background px-3 py-2 text-sm text-texte-principal"
            >
              {(Object.keys(LIBELLES_PERIODE) as Periode[]).map((p) => (
                <option key={p} value={p}>
                  {LIBELLES_PERIODE[p]}
                </option>
              ))}
            </select>
          </label>
          <p className="ml-auto self-center text-sm text-texte-secondaire">{mouvementsCategorie.length} mouvement(s)</p>
        </div>

        {mouvementsCategorie.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-bordure py-12 text-center">
            <PackageSearch size={24} className="text-texte-secondaire" />
            <p className="text-sm text-texte-secondaire">Aucun mouvement ne correspond à ces filtres.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-bordure">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-fond text-left text-texte-secondaire">
                  <th scope="col" className="px-3 py-2 font-medium">Date</th>
                  <th scope="col" className="px-3 py-2 font-medium">Produit</th>
                  <th scope="col" className="px-3 py-2 font-medium">Type</th>
                  <th scope="col" className="px-3 py-2 font-medium">Quantité</th>
                  <th scope="col" className="px-3 py-2 font-medium">Référence</th>
                </tr>
              </thead>
              <tbody>
                {mouvementsCategorie.map((m) => (
                  <tr key={m.id} className="border-t border-bordure text-texte-principal">
                    <td className="px-3 py-2 text-texte-secondaire">{formaterDateHeure(m.date)}</td>
                    <td className="px-3 py-2">{nomProduitMouvement(m)}</td>
                    <td className="px-3 py-2">
                      {m.type === "entree" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-succes/10 px-2 py-0.5 text-xs font-semibold text-succes">
                          <ArrowDownToLine size={11} /> Entrée
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-danger/10 px-2 py-0.5 text-xs font-semibold text-danger">
                          <ArrowUpFromLine size={11} /> Sortie
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-semibold">{m.quantite}</td>
                    <td className="px-3 py-2 text-texte-secondaire">{m.reference ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {ligneMouvement && (
        <FormulaireMouvement
          ligne={ligneMouvement}
          onFermer={() => setLigneMouvement(null)}
          onSucces={() => {
            router.refresh();
            setLigneMouvement(null);
          }}
        />
      )}
    </div>
  );
}

function FormulaireMouvement({
  ligne,
  onFermer,
  onSucces,
}: {
  ligne: LigneSuiviStock;
  onFermer: () => void;
  onSucces: () => void;
}) {
  const [type, setType] = useState<TypeMouvementStock>("entree");
  const [quantite, setQuantite] = useState(1);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function enregistrer() {
    setEnCours(true);
    try {
      const resultat = await enregistrerMouvementStockAction({
        produitId: ligne.produitId,
        varianteId: ligne.varianteId,
        type,
        quantite,
        date: new Date(date).toISOString(),
        reference: reference.trim() || undefined,
      });
      if (!resultat.succes) {
        setErreur(resultat.erreur ?? "Une erreur est survenue.");
        return;
      }
      onSucces();
    } finally {
      setEnCours(false);
    }
  }

  return (
    <Modal titre={`Mouvement de stock — ${ligne.nom}`} onFermer={onFermer}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-texte-secondaire">
          Quantité actuelle : <span className="font-semibold text-texte-principal">{ligne.quantite ?? "Non suivi"}</span>
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType("entree")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold ${
              type === "entree" ? "border-succes bg-succes/10 text-succes" : "border-bordure text-texte-principal hover:bg-fond"
            }`}
          >
            <ArrowDownToLine size={16} /> Entrée
          </button>
          <button
            type="button"
            onClick={() => setType("sortie")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold ${
              type === "sortie" ? "border-danger bg-danger/10 text-danger" : "border-bordure text-texte-principal hover:bg-fond"
            }`}
          >
            <ArrowUpFromLine size={16} /> Sortie
          </button>
        </div>

        <label className="block text-sm">
          <span className="text-texte-secondaire">Quantité</span>
          <input
            type="number"
            min={1}
            value={quantite}
            onChange={(e) => setQuantite(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>

        <label className="block text-sm">
          <span className="text-texte-secondaire">Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>

        <label className="block text-sm">
          <span className="text-texte-secondaire">Référence (facultatif)</span>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="ex. Réassort fournisseur, Commande #..."
            className="mt-1 w-full rounded-lg border border-bordure px-3 py-2 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair"
          />
        </label>

        {erreur && <p className="text-sm font-medium text-danger">{erreur}</p>}

        <button
          type="button"
          disabled={enCours}
          onClick={enregistrer}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primaire px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Enregistrer
        </button>
      </div>
    </Modal>
  );
}
