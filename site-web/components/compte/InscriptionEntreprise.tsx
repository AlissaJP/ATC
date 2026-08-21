"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileUp, Trash2 } from "lucide-react";
import { Stepper } from "./Stepper";
import { useComptesStore, type DocumentTeleverse, type InscriptionEntrepriseInput } from "@/lib/store/comptes-store";
import { useSessionStore } from "@/lib/store/session-store";
import type { TypeDocumentEntreprise } from "@/lib/types/entities";

const ETAPES = ["Inscription", "Documents", "Vérification", "Activation"];

const CHAMPS_ETAPE_1: { cle: keyof InscriptionEntrepriseInput; label: string; requis: boolean; info?: string }[] = [
  { cle: "nom_legal", label: "Nom légal de l'entreprise", requis: true },
  { cle: "nom_commercial", label: "Nom commercial (si différent)", requis: false },
  { cle: "nif", label: "NIF", requis: true, info: "Numéro d'Identification Fiscale, délivré par la DGI." },
  { cle: "registre_commerce", label: "Registre de commerce (si disponible)", requis: false },
  { cle: "adresse_entreprise", label: "Adresse", requis: true },
  { cle: "telephone_professionnel", label: "Téléphone professionnel", requis: true },
  { cle: "email_professionnel", label: "Email professionnel", requis: true },
  { cle: "representant_nom", label: "Nom du représentant", requis: true },
  { cle: "representant_fonction", label: "Fonction du représentant", requis: true },
  { cle: "secteur_activite", label: "Secteur d'activité", requis: true },
  { cle: "taille_entreprise", label: "Taille de l'entreprise (optionnel)", requis: false },
];

const TYPES_DOCUMENTS: { cle: TypeDocumentEntreprise; label: string; requis: boolean }[] = [
  { cle: "patente", label: "Patente ou licence commerciale", requis: true },
  { cle: "nif", label: "NIF", requis: true },
  { cle: "registre_commerce", label: "Registre de commerce (si applicable)", requis: false },
  { cle: "piece_identite", label: "Pièce d'identité du représentant", requis: true },
];

const FORMATS_ACCEPTES = [".pdf", ".jpg", ".jpeg", ".png"];
const TAILLE_MAX_OCTETS = 5 * 1024 * 1024; // RG-08-002, décision actée n°30

const DONNEES_INITIALES: InscriptionEntrepriseInput = {
  nom_legal: "",
  nom_commercial: "",
  nif: "",
  registre_commerce: "",
  adresse_entreprise: "",
  telephone_professionnel: "",
  email_professionnel: "",
  representant_nom: "",
  representant_fonction: "",
  secteur_activite: "",
  taille_entreprise: "",
};

export function InscriptionEntreprise() {
  const router = useRouter();
  const inscrireEntreprise = useComptesStore((s) => s.inscrireEntreprise);
  const connecterClient = useSessionStore((s) => s.connecterClient);

  const [etape, setEtape] = useState(1);
  const [donnees, setDonnees] = useState<InscriptionEntrepriseInput>(DONNEES_INITIALES);
  const [champsTouches, setChampsTouches] = useState<Set<string>>(new Set());
  const [fichiers, setFichiers] = useState<Record<TypeDocumentEntreprise, File | undefined>>({
    patente: undefined,
    nif: undefined,
    registre_commerce: undefined,
    piece_identite: undefined,
  });
  const [erreurFichier, setErreurFichier] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [typeEnCours, setTypeEnCours] = useState<TypeDocumentEntreprise | null>(null);

  function champValide(cle: keyof InscriptionEntrepriseInput): boolean {
    const champ = CHAMPS_ETAPE_1.find((c) => c.cle === cle);
    if (!champ?.requis) return true;
    return (donnees[cle] ?? "").trim().length > 0;
  }

  const etape1Valide =
    CHAMPS_ETAPE_1.every((c) => champValide(c.cle)) && /\S+@\S+\.\S+/.test(donnees.email_professionnel);

  function ouvrirSelecteur(type: TypeDocumentEntreprise) {
    setTypeEnCours(type);
    inputRef.current?.click();
  }

  function gererFichierSelectionne(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier || !typeEnCours) return;

    const extension = "." + fichier.name.split(".").pop()?.toLowerCase();
    if (!FORMATS_ACCEPTES.includes(extension)) {
      setErreurFichier(`Format non supporté pour "${fichier.name}" — formats acceptés : PDF, JPG, PNG.`);
      return;
    }
    if (fichier.size > TAILLE_MAX_OCTETS) {
      setErreurFichier(`"${fichier.name}" dépasse la taille maximale de 5 Mo.`);
      return;
    }
    setErreurFichier(null);
    setFichiers((prev) => ({ ...prev, [typeEnCours]: fichier }));
  }

  const documentsRequisManquants = TYPES_DOCUMENTS.filter((t) => t.requis && !fichiers[t.cle]);
  const etape2Valide = documentsRequisManquants.length === 0;

  function soumettreDossier() {
    const documents: DocumentTeleverse[] = TYPES_DOCUMENTS.filter((t) => fichiers[t.cle]).map((t) => ({
      type_document: t.cle,
      nom_fichier: fichiers[t.cle]!.name,
      taille_octets: fichiers[t.cle]!.size,
    }));
    const profil = inscrireEntreprise(donnees, documents);
    connecterClient({
      type: "client",
      utilisateur_id: profil.utilisateur_id,
      nom: donnees.representant_nom,
      type_compte: "entreprise",
      statut_validation_entreprise: "en_attente",
    });
    setEtape(3);
  }

  return (
    <div>
      <Stepper etapes={ETAPES} etapeActuelle={etape} />

      <div className="mx-auto mt-8 max-w-xl">
        {etape === 1 && (
          <div className="flex flex-col gap-4">
            {CHAMPS_ETAPE_1.map((champ) => {
              const touche = champsTouches.has(champ.cle);
              const invalide = touche && !champValide(champ.cle);
              return (
                <label key={champ.cle} className="block text-sm">
                  <span className="text-texte-secondaire">
                    {champ.label}
                    {champ.requis && " *"}
                  </span>
                  {champ.info && <p className="text-xs text-texte-secondaire/80">{champ.info}</p>}
                  <input
                    value={donnees[champ.cle]}
                    onChange={(e) => setDonnees((prev) => ({ ...prev, [champ.cle]: e.target.value }))}
                    onBlur={() => setChampsTouches((prev) => new Set(prev).add(champ.cle))}
                    type={champ.cle === "email_professionnel" ? "email" : "text"}
                    className={`mt-1 w-full rounded-lg border px-3 py-2.5 text-texte-principal focus:outline-none focus:ring-2 focus:ring-primaire-clair ${
                      invalide ? "border-danger" : "border-bordure"
                    }`}
                  />
                  {invalide && <p className="mt-1 text-xs text-danger">Ce champ est obligatoire.</p>}
                </label>
              );
            })}

            <button
              type="button"
              disabled={!etape1Valide}
              onClick={() => setEtape(2)}
              className="mt-2 self-end rounded-lg bg-primaire px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continuer →
            </button>
          </div>
        )}

        {etape === 2 && (
          <div className="flex flex-col gap-4">
            <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={gererFichierSelectionne} />
            {TYPES_DOCUMENTS.map((type) => {
              const fichier = fichiers[type.cle];
              return (
                <div key={type.cle} className="rounded-lg border border-dashed border-bordure p-4">
                  <p className="text-sm font-medium text-texte-principal">
                    {type.label}
                    {type.requis && " *"}
                  </p>
                  {fichier ? (
                    <div className="mt-2 flex items-center justify-between rounded-lg bg-fond px-3 py-2 text-sm">
                      <span className="truncate text-texte-principal">{fichier.name}</span>
                      <button
                        type="button"
                        aria-label={`Retirer ${fichier.name}`}
                        onClick={() => setFichiers((prev) => ({ ...prev, [type.cle]: undefined }))}
                        className="shrink-0 text-texte-secondaire hover:text-danger"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => ouvrirSelecteur(type.cle)}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-bordure py-3 text-sm font-medium text-primaire hover:bg-primaire/5"
                    >
                      <FileUp size={16} /> Ajouter un fichier (PDF, JPG, PNG — 5 Mo max)
                    </button>
                  )}
                </div>
              );
            })}
            {erreurFichier && <p className="text-sm font-medium text-danger">{erreurFichier}</p>}

            <div className="mt-2 flex justify-between">
              <button
                type="button"
                onClick={() => setEtape(1)}
                className="rounded-lg border border-bordure px-5 py-2.5 text-sm font-medium text-texte-principal hover:bg-fond"
              >
                ← Précédent
              </button>
              <button
                type="button"
                disabled={!etape2Valide}
                onClick={soumettreDossier}
                className="rounded-lg bg-primaire px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Soumettre le dossier
              </button>
            </div>
          </div>
        )}

        {etape === 3 && (
          <div className="rounded-xl border border-succes/30 bg-succes/5 p-8 text-center">
            <CheckCircle2 size={32} className="mx-auto text-succes" />
            <p className="mt-3 font-titres text-lg font-semibold text-texte-principal">
              Dossier envoyé, vérification sous quelques jours
            </p>
            <p className="mt-2 text-sm text-texte-secondaire">
              Vous pouvez dès maintenant naviguer sur le site et consulter les prix publics. Les barèmes
              professionnels et la facturation pro forma seront accessibles après validation de votre dossier
              par notre équipe.
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-5 rounded-lg bg-primaire px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Aller à l&apos;accueil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
