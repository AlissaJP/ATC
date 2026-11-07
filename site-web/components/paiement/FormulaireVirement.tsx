"use client";

// Virement bancaire — pendant de FormulaireNouveauMoncash.tsx : coordonnées des comptes ATC (gourdes et
// dollars), montant exact à virer selon le compte choisi (conversion HTG au taux interne, comme MonCash) et
// envoi de la preuve de la transaction. Le paiement reste « en cours » jusqu'à sa vérification manuelle par
// l'Administrateur Général (app/admin/virements).
import { useId, useState } from "react";
import { Check, Copy, ImagePlus, Loader2, X } from "lucide-react";
import { BANQUE_VIREMENT, BANQUE_VIREMENT_DEMO } from "@/lib/constants/banque";
import type { CompteVirement, DetailVirement } from "@/lib/types/entities";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LOCALE_INTL } from "@/lib/i18n/langues";

export interface DonneesVirement {
  compte: CompteVirement | null;
  preuve: DetailVirement["preuve"] | null;
}

export function virementValide(donnees: DonneesVirement): boolean {
  return donnees.compte !== null && donnees.preuve !== null;
}

const TAILLE_MAX_OCTETS = 10 * 1024 * 1024;
const COTE_MAX_PX = 1600;

// La démo n'a pas de serveur de fichiers : la preuve est conservée en data URL dans le stockage local du
// navigateur (limité à quelques Mo). L'image est donc réduite et recompressée en JPEG avant enregistrement.
function compresserImage(fichier: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(fichier);
    const image = new Image();
    image.onload = () => {
      const echelle = Math.min(1, COTE_MAX_PX / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * echelle);
      canvas.height = Math.round(image.height * echelle);
      const contexte = canvas.getContext("2d");
      if (!contexte) {
        URL.revokeObjectURL(url);
        reject(new Error("canvas"));
        return;
      }
      contexte.fillStyle = "#ffffff"; // fond blanc pour les captures PNG transparentes
      contexte.fillRect(0, 0, canvas.width, canvas.height);
      contexte.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image"));
    };
    image.src = url;
  });
}

function LigneCopiable({ libelle, valeur }: { libelle: string; valeur: string }) {
  const { t } = useTranslation();
  const [copie, setCopie] = useState(false);

  async function copier() {
    try {
      await navigator.clipboard.writeText(valeur);
      setCopie(true);
      setTimeout(() => setCopie(false), 1500);
    } catch {
      // Presse-papiers indisponible (contexte non sécurisé) : la valeur reste lisible et sélectionnable.
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div className="min-w-0">
        <p className="text-xs text-texte-secondaire">{libelle}</p>
        <p className="break-all text-sm font-medium text-texte-principal">{valeur}</p>
      </div>
      <button
        type="button"
        onClick={copier}
        aria-label={t("paiement.virement.copier", { element: libelle })}
        className="shrink-0 rounded-md p-1.5 text-texte-secondaire hover:bg-fond hover:text-primaire"
      >
        {copie ? <Check size={15} className="text-succes" /> : <Copy size={15} />}
      </button>
    </div>
  );
}

export function FormulaireVirement({
  donnees,
  onChange,
  montantUsd,
  montantHtg,
  taux,
  reference,
}: {
  donnees: DonneesVirement;
  onChange: (donnees: DonneesVirement) => void;
  montantUsd: number;
  montantHtg: number;
  taux: number;
  reference: string;
}) {
  const { t, langue } = useTranslation();
  const idFichier = useId();
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function choisirFichier(fichier: File | undefined) {
    setErreur(null);
    if (!fichier) return;
    if (!fichier.type.startsWith("image/")) {
      setErreur(t("paiement.virement.erreurFormat"));
      return;
    }
    if (fichier.size > TAILLE_MAX_OCTETS) {
      setErreur(t("paiement.virement.erreurTaille"));
      return;
    }
    setChargement(true);
    try {
      const donneesImage = await compresserImage(fichier);
      onChange({ ...donnees, preuve: { nom: fichier.name, donnees: donneesImage } });
    } catch {
      setErreur(t("paiement.virement.erreurLecture"));
    } finally {
      setChargement(false);
    }
  }

  const montantAffiche =
    donnees.compte === "htg"
      ? `${montantHtg.toLocaleString(LOCALE_INTL[langue], { maximumFractionDigits: 2 })} HTG`
      : `$${montantUsd.toFixed(2)}`;

  return (
    <div className="mt-4 flex flex-col gap-4 rounded-lg border border-bordure p-4">
      <div>
        <p className="text-sm font-semibold text-texte-principal">{t("paiement.virement.titre")}</p>
        <p className="mt-1 text-xs text-texte-secondaire">{t("paiement.virement.intro")}</p>
      </div>

      {BANQUE_VIREMENT_DEMO && (
        <p className="rounded-md bg-avertissement/10 px-3 py-2 text-xs font-medium text-avertissement">
          {t("paiement.virement.demo")}
        </p>
      )}

      <div className="divide-y divide-bordure rounded-lg bg-fond px-3">
        <LigneCopiable libelle={t("paiement.virement.beneficiaire")} valeur={BANQUE_VIREMENT.beneficiaire} />
        <LigneCopiable libelle={t("paiement.virement.banque")} valeur={BANQUE_VIREMENT.banque} />
        <LigneCopiable libelle={t("paiement.virement.compteHtg")} valeur={BANQUE_VIREMENT.comptes.htg} />
        <LigneCopiable libelle={t("paiement.virement.compteUsd")} valeur={BANQUE_VIREMENT.comptes.usd} />
        <LigneCopiable libelle={t("paiement.virement.reference")} valeur={reference} />
      </div>

      <fieldset>
        <legend className="text-xs font-medium text-texte-secondaire">{t("paiement.virement.compteUtilise")}</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(["usd", "htg"] as const).map((compte) => (
            <button
              key={compte}
              type="button"
              aria-pressed={donnees.compte === compte}
              onClick={() => onChange({ ...donnees, compte })}
              className={`rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors ${
                donnees.compte === compte
                  ? "border-primaire bg-primaire/5 text-texte-principal"
                  : "border-bordure text-texte-secondaire hover:border-primaire-clair"
              }`}
            >
              {t(`paiement.virement.compte.${compte}`)}
            </button>
          ))}
        </div>
      </fieldset>

      {donnees.compte && (
        <div className="rounded-lg bg-fond p-3 text-sm">
          <p className="text-texte-secondaire">{t("paiement.virement.montantAVirer")}</p>
          <p className="font-titres text-xl font-bold text-texte-principal">{montantAffiche}</p>
          {donnees.compte === "htg" && (
            <p className="mt-1 text-xs text-texte-secondaire">{t("paiement.tauxApplique", { taux })}</p>
          )}
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-texte-secondaire">{t("paiement.virement.preuve")}</p>
        <p className="mt-0.5 text-xs text-texte-secondaire">{t("paiement.virement.preuveAide")}</p>

        {donnees.preuve ? (
          <div className="mt-2 flex items-center gap-3 rounded-lg border border-bordure p-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL locale, next/image inutile ici */}
            <img src={donnees.preuve.donnees} alt={t("paiement.virement.apercu")} className="h-16 w-16 rounded object-cover" />
            <p className="min-w-0 flex-1 truncate text-sm text-texte-principal">{donnees.preuve.nom}</p>
            <button
              type="button"
              onClick={() => onChange({ ...donnees, preuve: null })}
              aria-label={t("paiement.virement.retirerPreuve")}
              className="rounded-md p-1.5 text-texte-secondaire hover:bg-fond hover:text-danger"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label
            htmlFor={idFichier}
            className="mt-2 flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border-2 border-dashed border-bordure px-4 py-6 text-center text-sm text-texte-secondaire hover:border-primaire-clair"
          >
            {chargement ? <Loader2 size={22} className="animate-spin" /> : <ImagePlus size={22} />}
            <span className="font-medium text-primaire">{t("paiement.virement.choisirFichier")}</span>
            <span className="text-xs">{t("paiement.virement.formats")}</span>
            <input
              id={idFichier}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                void choisirFichier(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        )}
        {erreur && <p className="mt-1.5 text-xs font-medium text-danger">{erreur}</p>}
      </div>
    </div>
  );
}
