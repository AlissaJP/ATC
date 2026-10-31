import { MessageCircle } from "lucide-react";
import { lienWhatsApp } from "@/lib/constants/contact";

// Intégration du catalogue ATC (étapes 5 et 7) — remplace « Ajouter au panier » pour un produit ou un
// package « Prix sur demande » : ouvre le support WhatsApp du site avec un message prérempli contenant la
// référence et le nom. Aucune connexion requise (simple prise de contact, rien n'est ajouté au panier).
export function BoutonDemanderPrix({
  type,
  reference,
  nom,
}: {
  type: "produit" | "package";
  reference?: string;
  nom: string;
}) {
  const message = `Bonjour ATC, je souhaite connaître le prix du ${type} ${reference ? `${reference} — ` : ""}${nom}.`;
  return (
    <a
      href={lienWhatsApp(message)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
    >
      <MessageCircle size={18} />
      Demander un prix
    </a>
  );
}
