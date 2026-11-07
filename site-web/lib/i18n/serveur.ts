// RG-14-001 — langue courante côté serveur (Server Components), lue dans le cookie posé au changement de
// langue (lib/actions/langue.ts). Lire un cookie rend la page dynamique : chaque visiteur reçoit le HTML
// directement dans sa langue, sans clignotement français → langue choisie au chargement.
import { cookies } from "next/headers";
import type { Langue } from "@/lib/types/entities";
import { COOKIE_LANGUE, LANGUE_PAR_DEFAUT, estLangue } from "./langues";
import { creerTraducteur, type Traducteur } from "./traduire";

export async function obtenirLangue(): Promise<Langue> {
  const valeur = (await cookies()).get(COOKIE_LANGUE)?.value;
  return estLangue(valeur) ? valeur : LANGUE_PAR_DEFAUT;
}

export async function obtenirTraduction(): Promise<{ t: Traducteur; langue: Langue }> {
  const langue = await obtenirLangue();
  return { t: creerTraducteur(langue), langue };
}
