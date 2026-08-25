// Témoignages de confiance affichés sur l'accueil — contenu mock de démonstration (décision actée n°42),
// à remplacer par de vrais avis clients une fois une table "reviews"/"testimonials" en place (Cahier 8).
import type { TemoignageClient } from "@/lib/types/entities";

export const temoignages: TemoignageClient[] = [
  {
    id: "temoin-1",
    nom: "Jean R.",
    note: 5,
    commentaire:
      "Installation de panneaux solaires impeccable, l'équipe a tout géré du début à la fin. Je recommande vivement.",
    localisation: "Port-au-Prince, Haïti",
  },
  {
    id: "temoin-2",
    nom: "Marie-Claude D.",
    note: 5,
    commentaire: "Le paiement par MonCash a rendu tout le processus tellement simple, et le retrait en magasin a été rapide.",
    localisation: "Cap-Haïtien, Haïti",
  },
  {
    id: "temoin-3",
    nom: "Wesner P.",
    note: 4,
    commentaire: "Très bon service pour notre compte professionnel — les tarifs par palier nous font vraiment économiser.",
    localisation: "Pétion-Ville, Haïti",
  },
  {
    id: "temoin-4",
    nom: "Nadège L.",
    note: 5,
    commentaire: "J'ai pu commander un système solaire pour ma famille en Haïti directement depuis la Floride. Service excellent.",
    localisation: "Miami, États-Unis",
  },
  {
    id: "temoin-5",
    nom: "Fritz A.",
    note: 5,
    commentaire: "La climatisation Carrier fonctionne parfaitement, installation propre et rapide par l'équipe technique.",
    localisation: "New York, États-Unis",
  },
  {
    id: "temoin-6",
    nom: "Rose-Myrlande C.",
    note: 4,
    commentaire: "Bon accompagnement pour la validation de mon compte Entreprise — un peu de patience nécessaire mais ça vaut le coup.",
    localisation: "Montréal, Canada",
  },
];
