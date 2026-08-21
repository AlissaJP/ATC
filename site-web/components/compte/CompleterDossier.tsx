"use client";

import { useRef, useState } from "react";
import { FileUp, Send, Trash2 } from "lucide-react";
import { useComptesStore, type DocumentTeleverse } from "@/lib/store/comptes-store";
import type { TypeDocumentEntreprise } from "@/lib/types/entities";

const FORMATS_ACCEPTES = [".pdf", ".jpg", ".jpeg", ".png"];
const TAILLE_MAX_OCTETS = 5 * 1024 * 1024;

// UC-08-002, scénario A1 — un dossier « Complément demandé » retourne à l'étape 2 côté client.
export function CompleterDossier({ profilId, motif }: { profilId: string; motif?: string }) {
  const televerserDocumentsComplement = useComptesStore((s) => s.televerserDocumentsComplement);
  const [fichiers, setFichiers] = useState<File[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoye, setEnvoye] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function gererFichier(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier) return;
    const extension = "." + fichier.name.split(".").pop()?.toLowerCase();
    if (!FORMATS_ACCEPTES.includes(extension)) {
      setErreur("Format non supporté — PDF, JPG ou PNG uniquement.");
      return;
    }
    if (fichier.size > TAILLE_MAX_OCTETS) {
      setErreur("Ce fichier dépasse 5 Mo.");
      return;
    }
    setErreur(null);
    setFichiers((prev) => [...prev, fichier]);
  }

  function soumettre() {
    if (fichiers.length === 0) return;
    const documents: DocumentTeleverse[] = fichiers.map((f) => ({
      type_document: "patente" as TypeDocumentEntreprise, // document complémentaire générique
      nom_fichier: f.name,
      taille_octets: f.size,
    }));
    televerserDocumentsComplement(profilId, documents);
    setEnvoye(true);
  }

  if (envoye) {
    return (
      <p className="mt-3 text-sm font-medium text-succes">
        Documents complémentaires envoyés — votre dossier repasse en attente de vérification.
      </p>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-dashed border-bordure p-4">
      {motif && <p className="mb-3 text-sm text-texte-secondaire">Motif : {motif}</p>}
      <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={gererFichier} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-bordure py-2.5 text-sm font-medium text-primaire hover:bg-primaire/5"
      >
        <FileUp size={16} /> Ajouter un document (PDF, JPG, PNG — 5 Mo max)
      </button>
      {erreur && <p className="mt-2 text-xs font-medium text-danger">{erreur}</p>}

      {fichiers.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {fichiers.map((f, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg bg-fond px-3 py-2 text-sm">
              <span className="truncate text-texte-principal">{f.name}</span>
              <button
                type="button"
                aria-label={`Retirer ${f.name}`}
                onClick={() => setFichiers((prev) => prev.filter((_, idx) => idx !== i))}
                className="shrink-0 text-texte-secondaire hover:text-danger"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        disabled={fichiers.length === 0}
        onClick={soumettre}
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primaire px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Send size={14} /> Envoyer le complément
      </button>
    </div>
  );
}
