"use server";

// BF-01-004 / RG-14-001 — enregistre la langue choisie dans un cookie (un Server Component ne peut pas
// poser de cookie lui-même) ; le client rafraîchit ensuite la route pour obtenir les pages serveur dans la
// nouvelle langue.
import { cookies } from "next/headers";
import { COOKIE_LANGUE, estLangue } from "@/lib/i18n/langues";

const UN_AN = 60 * 60 * 24 * 365;

export async function definirLangueAction(langue: string): Promise<void> {
  if (!estLangue(langue)) return;
  (await cookies()).set(COOKIE_LANGUE, langue, { path: "/", maxAge: UN_AN, sameSite: "lax" });
}
