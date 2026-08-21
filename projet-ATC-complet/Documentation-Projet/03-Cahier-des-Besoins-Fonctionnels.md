# CAHIER DES BESOINS FONCTIONNELS

## Plateforme E-commerce B2B/B2C — Électronique & Énergie Solaire (Haïti & Diaspora)

---

### Page de garde

| | |
|---|---|
| **Projet** | Plateforme e-commerce Électronique, Énergie Solaire, Sécurité & Climatisation |
| **Client** | ATC |
| **Type de document** | Cahier des Besoins Fonctionnels (Document 3/15) |
| **Version** | 1.2 |
| **Date** | 01/08/2026 |
| **Statut** | Version finale — en attente de validation client (recadrage majeur : barème B2B, retrait Livraison, retrait Fidélisation) |
| **Documents parents** | Cahier de Vision (Doc. 1/15), PRD (Doc. 2/15) |
| **Diffusion** | Direction, Produit, UX/UI, Développement, QA, DevOps |
| **Confidentialité** | Document interne — usage projet uniquement |

---

### Historique des versions

| Version | Date | Auteur | Description |
|---|---|---|---|
| 0.1 | 01/08/2026 | Architecte Produit (IA) | Décomposition initiale des 15 Epics du PRD en besoins unitaires |
| 1.0 | 01/08/2026 | Architecte Produit (IA) | Version finale après auto-évaluation et intégration des améliorations |
| 1.1 | 01/08/2026 | Architecte Produit (IA) | Mise à jour suite aux réponses client (nom commercial, logistique, volumétrie) |
| 1.2 | 01/08/2026 | Architecte Produit (IA) | Recadrage majeur : barème B2B (BF-03-007), suppression EPIC-07 et volet fidélité EPIC-10, affichage USD, validation Entreprise en 4 étapes — 92 besoins au total |

---

### Sommaire

1. Introduction
2. Méthodologie et légende
3. Besoins fonctionnels par module (BF-01 à BF-15)
4. Exigences transverses traitées hors de ce cahier
5. Synthèse quantitative
6. Risques
7. Hypothèses
8. Décisions actées
9. Questions restantes
10. Traçabilité et documents liés
11. Conclusion

<!-- pagebreak -->

## 1. Introduction

Ce cahier décompose chacun des 15 Epics définis dans le PRD (Document 2/15) en **besoins fonctionnels unitaires**, identifiables par un code unique, et destinés à être repris tels quels dans les cahiers suivants (Règles Métiers, Cas d'Utilisation, Spécifications Détaillées, Tests).

Conformément à la règle de non-suppression d'information, **chaque fonctionnalité mentionnée dans le document source de l'entreprise est représentée ici**, y compris celles explicitement non retenues pour la V1 (signalées comme telles plutôt que silencieusement omises).

## 2. Méthodologie et légende

**Convention d'identifiant :** `BF-[N° Epic]-[N° séquentiel]`, par exemple `BF-04-003` = 3ᵉ besoin fonctionnel de l'EPIC-04 (Devis & Packages).

**Priorité :** héritée de la priorisation MoSCoW établie au PRD (Document 2/15, section 4).

**Acteurs (légende) :**

| Code | Acteur |
|---|---|
| VIS | Visiteur non connecté |
| CP | Client Particulier |
| CE | Client Entreprise |
| CLI | Client (générique, CP + CE) |
| ADM | Administrateur / équipe interne |
| SYS | Comportement automatique du système |

**Statut des besoins :** *Retenu V1*, *Retenu Could have*, ou *Non retenu* (avec renvoi à la décision actée correspondante).

<!-- pagebreak -->

## 3. Besoins fonctionnels par module

### EPIC-01 — Navigation & Catalogue

| ID | Besoin fonctionnel | Acteur(s) | Priorité |
|---|---|---|---|
| BF-01-001 | Afficher un menu principal structuré par grandes catégories (Électronique / Énergie solaire / Sécurité / Climatisation) | VIS, CLI | Must have |
| BF-01-002 | Proposer un espace distinct « Espace Entreprise » et « Espace Particulier » | VIS, CLI | Should have |
| BF-01-003 | Afficher un fil d'Ariane à partir du niveau catégorie | VIS, CLI | Should have |
| BF-01-004 | Permettre de changer de langue (FR/EN/ES) depuis n'importe quelle page, sans perte de contexte | VIS, CLI | Must have |
| BF-01-005 | ~~Permettre de changer de devise d'affichage (HTG/USD)~~ — **Non retenu** : prix affichés exclusivement en USD (décision actée n°25) | — | — |
| BF-01-006 | Permettre de filtrer les produits par marque (HP, Dell, Toshiba, etc.) | VIS, CLI | Must have |
| BF-01-007 | Afficher une fiche technique comparative par sous-catégorie technique (ex. panneaux solaires, ordinateurs) | VIS, CLI | Should have |
| BF-01-008 | Mettre en avant les catégories phares (Énergie solaire, Électronique) sur la page d'accueil | VIS, CLI | Must have |
| BF-01-009 | Afficher une bannière dédiée aux packages solaires pré-configurés sur la page d'accueil | VIS, CLI | Should have |
| BF-01-010 | Afficher une section « Devenir client professionnel » incitant à l'inscription B2B | VIS | Should have |
| BF-01-011 | Afficher des éléments de réassurance en page d'accueil (paiement sécurisé, modalités de retrait, support WhatsApp) | VIS, CLI | Should have |
| BF-01-012 | Structurer le catalogue selon les familles : Électronique (moniteurs, ordinateurs, Starlink), Énergie solaire (batteries, panneaux, régulateurs, onduleurs, accessoires), Sécurité (caméras), Climatisation | ADM, SYS | Must have |

### EPIC-02 — Recherche & Filtres

| ID | Besoin fonctionnel | Acteur(s) | Priorité |
|---|---|---|---|
| BF-02-001 | Proposer une barre de recherche avec suggestions dynamiques dès la saisie | VIS, CLI | Must have |
| BF-02-002 | Permettre le filtrage par caractéristiques techniques (puissance en watts, capacité de batterie) | VIS, CLI | Must have |
| BF-02-003 | Permettre le filtrage par fourchette de prix et par marque | VIS, CLI | Must have |
| BF-02-004 | Permettre de filtrer les produits disponibles en package pré-configuré | VIS, CLI | Should have |

### EPIC-03 — Fiche Produit

| ID | Besoin fonctionnel | Acteur(s) | Priorité |
|---|---|---|---|
| BF-03-001 | Afficher description, spécifications techniques, images multiples et prix pour chaque produit | VIS, CLI | Must have |
| BF-03-002 | Afficher un indicateur de stock basé sur un pourcentage du stock de référence : alerte orange ≤ 40 %, alerte rouge ≤ 15 %, rupture à 0 % (décision actée n°21) | VIS, CLI | Must have |
| BF-03-003 | Proposer un bouton « Ajouter au panier » pour l'achat direct | VIS, CLI | Must have |
| BF-03-004 | Proposer un bouton distinct « Ajouter au package personnalisé » sur les produits éligibles | CLI | Must have |
| BF-03-005 | Afficher un prix différencié B2B/B2C selon le profil du client connecté (le prix B2B est déterminé par le barème de palier, voir BF-03-007) | CE, CP | Should have |
| BF-03-006 | Afficher les produits associés/accessoires compatibles (ex. régulateur compatible avec tel panneau) | VIS, CLI | Should have |
| BF-03-007 | Afficher un barème de prix par palier de quantité pour les comptes Entreprise validés, avec sélection de la quantité et affichage immédiat du prix applicable (modèle inspiré d'Alibaba — décision actée n°16) | CE | Must have |

### EPIC-04 — Devis & Packages personnalisés

| ID | Besoin fonctionnel | Acteur(s) | Priorité |
|---|---|---|---|
| BF-04-001 | Proposer un catalogue de packages solaires pré-configurés, achetables et payables immédiatement en ligne | VIS, CLI | Must have |
| BF-04-002 | Fournir un générateur de package personnalisé (panneaux + batteries + régulateur + accessoires), avec validation possible uniquement si au moins un panneau et une batterie sont sélectionnés (décision actée n°29) | CLI | Must have |
| BF-04-003 | Envoyer automatiquement un package personnalisé constitué vers une demande de devis | CLI, SYS | Must have |
| BF-04-004 | Permettre au client de suivre le statut de sa demande de devis (en attente / répondu / accepté / expiré) | CLI | Should have |
| BF-04-005 | Conserver un historique des devis précédents dans l'espace client | CLI | Could have |
| BF-04-006 | Permettre à l'administrateur de répondre à une demande de devis, dont le prix est calculé automatiquement à partir des barèmes de chaque composant (décision actée n°16) | ADM | Must have |
| BF-04-007 | Permettre la conversion d'un devis accepté en commande | ADM, SYS | Must have |
| BF-04-008 | Faire expirer automatiquement un devis répondu et non accepté par le client dans un délai de 3 jours (décision actée n°22) | SYS | Must have |

### EPIC-05 — Panier & Commande

| ID | Besoin fonctionnel | Acteur(s) | Priorité |
|---|---|---|---|
| BF-05-001 | Proposer un panier classique pour les achats directs multi-catégories | VIS, CLI | Must have |
| BF-05-002 | Afficher un résumé de commande avec sous-total par catégorie de produit | CLI | Should have |
| BF-05-003 | Appliquer automatiquement dans le panier le prix du palier de quantité B2B sélectionné sur la fiche produit | CE | Must have |
| BF-05-004 | Afficher un statut de commande « Prête pour retrait » avec notification au client (aucune livraison proposée — décision actée n°27) | CLI, SYS | Must have |

### EPIC-06 — Paiement & Facturation

| ID | Besoin fonctionnel | Acteur(s) | Priorité |
|---|---|---|---|
| BF-06-001 | Permettre le paiement via MonCash, avec conversion automatique du montant en HTG selon le taux interne (décision actée n°24) | CLI | Must have |
| BF-06-002 | Permettre le paiement par carte Visa/Mastercard | CLI | Must have |
| BF-06-003 | Permettre le paiement via PayPal | CLI | Must have |
| BF-06-004 | ~~Permettre le paiement par virement bancaire~~ — **Non retenu** : exclu du périmètre quel que soit le montant (décision actée n°23) | — | — |
| BF-06-005 | Générer une facture pro forma téléchargeable pour toute commande B2B, incluant la taxe locale applicable (décision actée n°18) | CE, SYS | Must have |
| BF-06-006 | Afficher tous les prix exclusivement en USD sur l'ensemble de la plateforme (décision actée n°25) | CLI | Must have |

### ~~EPIC-07 — Livraison & Logistique~~ — ANNULÉ (décision actée n°27)

| ID | Besoin fonctionnel | Acteur(s) | Priorité |
|---|---|---|---|
| BF-07-001 | ~~Proposer des zones de livraison différenciées Haïti / diaspora-international~~ — **Non retenu** | — | — |
| BF-07-002 | ~~Fournir un numéro de suivi de commande (tracking)~~ — **Non retenu** | — | — |
| BF-07-003 | ~~Estimer automatiquement les frais de livraison selon la zone et le poids/volume~~ — **Non retenu** | — | — |
| BF-07-004 | ~~Proposer une option de retrait en magasin en alternative à la livraison~~ — **Reformulé et déplacé vers BF-05-004** : le retrait devient la seule modalité de récupération de commande, à la charge du client | — | — |

*Note : aucun service de livraison n'est proposé par la plateforme (décision actée n°27). Le client organise lui-même le retrait ou le transport de sa commande, selon des modalités définies par ATC. Le besoin fonctionnel correspondant est conservé sous BF-05-004 (EPIC-05).*

### EPIC-08 — Compte Client (B2B/B2C)

| ID | Besoin fonctionnel | Acteur(s) | Priorité | Statut |
|---|---|---|---|---|
| BF-08-001 | Permettre la création d'un compte avec distinction « Entreprise » ou « Particulier » dès l'inscription | VIS | Must have | Retenu V1 |
| BF-08-002 | Permettre à un client de gérer plusieurs adresses (Haïti et international) | CLI | Should have | Retenu V1 |
| BF-08-003 | Afficher l'historique des commandes et des devis dans l'espace client | CLI | Must have | Retenu V1 |
| BF-08-004 | Permettre à un client de gérer une liste de produits favoris | CLI | Should have | Retenu V1 |
| BF-08-005 | Gérer plusieurs utilisateurs sous un même compte Entreprise | CE | — | **Non retenu** (décision actée n°8) |
| BF-08-006 | Collecter les informations d'inscription Entreprise (nom légal, nom commercial, NIF, registre de commerce, adresse, téléphone et email professionnels, représentant, secteur d'activité, taille) | CE | Must have | Retenu V1 (décision actée n°17) |
| BF-08-007 | Permettre le téléversement des documents justificatifs (patente/licence, NIF, registre de commerce, pièce d'identité du représentant), aux formats PDF/JPG/PNG, 5 Mo maximum par fichier (décision actée n°30) | CE | Must have | Retenu V1 (décision actée n°17) |
| BF-08-008 | Permettre à l'administrateur de vérifier les informations et documents soumis, puis d'Approuver, Rejeter ou Demander des informations complémentaires | ADM | Must have | Retenu V1 (décision actée n°17) |
| BF-08-009 | Activer automatiquement le statut « B2B vérifié » après approbation, donnant accès aux barèmes de prix et à la facturation professionnelle | SYS | Must have | Retenu V1 (décision actée n°17) |

### EPIC-09 — SAV & Assistance

| ID | Besoin fonctionnel | Acteur(s) | Priorité |
|---|---|---|---|
| BF-09-001 | Afficher la garantie applicable par catégorie de produit sur chaque fiche produit | VIS, CLI | Must have |
| BF-09-002 | Permettre au client de créer un ticket SAV (panne, réclamation) depuis son espace client | CLI | Should have |
| BF-09-003 | Proposer une assistance client via chatbot et/ou WhatsApp accessible depuis toutes les pages | VIS, CLI | Must have |
| BF-09-004 | Permettre de planifier une prestation d'assistance à l'installation solaire, réalisée par l'équipe interne (décision actée n°5) | CLI, ADM | Must have |

### EPIC-10 — Marketing (Avis clients)

| ID | Besoin fonctionnel | Acteur(s) | Priorité | Statut |
|---|---|---|---|---|
| BF-10-001 | ~~Attribuer automatiquement un statut de fidélité (Bronze/Argent/Or)~~ | — | — | **Non retenu — Annulé** (décision actée n°26, remplace les décisions n°4 et n°13) |
| BF-10-002 | ~~Afficher le statut de fidélité et ses avantages~~ | — | — | **Non retenu — Annulé** (décision actée n°26) |
| BF-10-003 | Envoyer une newsletter avec offres automatiques, sans code promotionnel | CLI, SYS | Could have | Retenu Could have |
| BF-10-004 | Ne proposer aucun mécanisme de code promotionnel | SYS | — | **Contrainte actée** (choix confirmé par l'entreprise) |
| BF-10-005 | Ventes groupées / tarifs préférentiels B2B automatiques, sans code | CE, SYS | — | **Non retenu** — remplacé par le barème de prix par palier (BF-03-007, décision actée n°16) |
| BF-10-006 | Permettre aux clients ayant acheté un produit de laisser un avis et une note | CLI | Should have | Retenu V1 |

### EPIC-11 — Contenu (FAQ, Blog, Légal, Contact)

| ID | Besoin fonctionnel | Acteur(s) | Priorité |
|---|---|---|---|
| BF-11-001 | Proposer une FAQ générale | VIS, CLI | Must have |
| BF-11-002 | Proposer des FAQ spécifiques par catégorie (ex. FAQ solaire, FAQ livraison internationale) | VIS, CLI | Must have |
| BF-11-003 | Publier un blog avec articles (conseils installation, comparatifs matériel) | VIS, CLI | Could have |
| BF-11-004 | Publier les CGV, la politique de confidentialité multi-juridictions et les mentions légales, accessibles depuis toutes les pages | VIS, CLI | Must have |
| BF-11-005 | Publier des conditions spécifiques export/international (douanes, responsabilité diaspora) | VIS, CLI | Should have |
| BF-11-006 | Proposer un formulaire de contact avec coordonnées de l'entreprise et accès direct à WhatsApp | VIS, CLI | Must have |

### EPIC-12 — Administration / Back-office

| ID | Besoin fonctionnel | Acteur(s) | Priorité |
|---|---|---|---|
| BF-12-001 | Afficher un tableau de bord (ventes du jour/mois, devis en attente, stock bas, dernières commandes) | ADM | Must have |
| BF-12-002 | Créer/modifier produits, catégories, marques, stock (avec stock de référence pour le calcul du pourcentage) et barèmes de prix B2B par palier de quantité | ADM | Must have |
| BF-12-003 | Créer des packages pré-configurés et traiter les demandes de packages personnalisés | ADM | Must have |
| BF-12-004 | Consulter et répondre aux devis, convertir un devis en commande | ADM | Must have |
| BF-12-005 | Suivre les commandes (statut de paiement et statut de retrait) | ADM | Must have |
| BF-12-006 | Consulter la liste des clients, avec distinction Entreprise/Particulier, statut de validation B2B et historique d'achat/devis | ADM | Must have |
| BF-12-007 | ~~Configurer les zones de livraison, délais, tarifs, suivre les expéditions~~ | — | **Non retenu — Annulé** (décision actée n°27) |
| BF-12-008 | Suivre les transactions par méthode de paiement et les factures pro forma générées | ADM | Must have |
| BF-12-009 | Gérer les demandes d'assistance à l'installation et les tickets SAV | ADM | Should have |
| BF-12-010 | Consulter l'historique des échanges chatbot/WhatsApp rattachés à un client ou une commande | ADM | Could have |
| BF-12-011 | Gérer le contenu (FAQ, blog, informations légales) | ADM | Must have (requalifié — décision actée n°9) |
| BF-12-012 | Modérer les avis clients avant publication | ADM | Should have |
| BF-12-013 | Consulter des statistiques (ventes par catégorie, conversion des devis) | ADM | Should have |
| BF-12-014 | Gérer les comptes administrateurs selon deux rôles fixes : Général et Agent SAV (décision actée n°20) | ADM | Should have |
| BF-12-015 | Configurer les paramètres généraux (langues actives, taux de change interne, textes légaux, notifications) | ADM | Must have |

### EPIC-13 — Sécurité & Conformité

| ID | Besoin fonctionnel | Acteur(s) | Priorité |
|---|---|---|---|
| BF-13-001 | Chiffrer toutes les communications via certificat SSL et sécuriser les paiements | SYS | Must have |
| BF-13-002 | Protéger les données personnelles des clients selon une politique multi-juridictions | SYS, ADM | Must have |

### EPIC-14 — Internationalisation

| ID | Besoin fonctionnel | Acteur(s) | Priorité |
|---|---|---|---|
| BF-14-001 | Rendre le site disponible en français, anglais et espagnol | VIS, CLI | Must have |
| BF-14-002 | ~~Adapter les informations de livraison affichées selon le pays de résidence du client~~ | — | **Non retenu — Annulé** (décision actée n°27) |

### EPIC-15 — Analytics & Pilotage

| ID | Besoin fonctionnel | Acteur(s) | Priorité |
|---|---|---|---|
| BF-15-001 | Suivre le volume de ventes par catégorie | ADM, SYS | Should have |
| BF-15-002 | Suivre le taux de transformation des devis en commandes | ADM, SYS | Should have |
| BF-15-003 | Suivre le comportement client sur le site (parcours, abandons) | ADM, SYS | Could have |

<!-- pagebreak -->

## 4. Exigences transverses traitées hors de ce cahier

Le document source de l'entreprise mentionne trois besoins qui, par nature, ne sont **pas des besoins fonctionnels** mais des **exigences non fonctionnelles (NFR)** — ils ne sont donc volontairement pas dupliqués ici sous forme de BF, afin de ne pas mélanger les deux natures d'exigences :

| Exigence source | Nature | Traitée dans |
|---|---|---|
| Performance (temps de chargement, connexions faibles) | Non fonctionnelle | Cahier 11 — Exigences Non Fonctionnelles |
| SEO multilingue | Non fonctionnelle | Cahier 11 — Exigences Non Fonctionnelles |
| Responsive / multi-device | Non fonctionnelle | Cahier 11 — Exigences Non Fonctionnelles |

De même, les **intégrations techniques** (passerelles de paiement, WhatsApp/chatbot) sont capturées ici comme besoins fonctionnels côté utilisateur (ex. BF-06-001 à BF-06-003, BF-09-003), mais leur mise en œuvre technique détaillée (API, webhooks, formats d'échange) sera spécifiée dans le **Cahier des Intégrations (Cahier 10)**. Aucune intégration transporteur n'est nécessaire, la livraison ayant été retirée du périmètre (décision actée n°27).

## 5. Synthèse quantitative

| Module (Epic) | Nombre de besoins identifiés | Dont Must have | Dont Should have | Dont Could have | Dont Non retenu |
|---|---|---|---|---|---|
| EPIC-01 Navigation & Catalogue | 12 | 5 | 6 | 0 | 1 |
| EPIC-02 Recherche & Filtres | 4 | 3 | 1 | 0 | 0 |
| EPIC-03 Fiche Produit | 7 | 5 | 2 | 0 | 0 |
| EPIC-04 Devis & Packages | 8 | 6 | 1 | 1 | 0 |
| EPIC-05 Panier & Commande | 4 | 3 | 1 | 0 | 0 |
| EPIC-06 Paiement & Facturation | 6 | 5 | 0 | 0 | 1 |
| EPIC-07 Livraison & Logistique | 4 | 0 | 0 | 0 | 4 |
| EPIC-08 Compte Client | 9 | 6 | 2 | 0 | 1 |
| EPIC-09 SAV & Assistance | 4 | 3 | 1 | 0 | 0 |
| EPIC-10 Marketing (Avis clients) | 6 | 0 | 1 | 1 | 3 (+1 contrainte) |
| EPIC-11 Contenu | 6 | 4 | 1 | 1 | 0 |
| EPIC-12 Administration | 15 | 9 | 4 | 1 | 1 |
| EPIC-13 Sécurité | 2 | 2 | 0 | 0 | 0 |
| EPIC-14 Internationalisation | 2 | 1 | 0 | 0 | 1 |
| EPIC-15 Analytics | 3 | 0 | 2 | 1 | 0 |
| **Total** | **92** | **52** | **22** | **5** | **12 (+1 contrainte)** |

*Évolution par rapport à la version 1.1 (85 besoins) : +7 besoins nets, résultant de l'ajout du barème de prix B2B (BF-03-007), du processus de validation Entreprise en 4 étapes (BF-08-006 à 009), du statut « prêt pour retrait » (BF-05-004) et du délai d'expiration de devis (BF-04-008), compensés par le retrait de la quasi-totalité de l'EPIC-07 et du volet fidélité de l'EPIC-10.*

## 6. Risques

| Risque | Impact | Niveau |
|---|---|---|
| Granularité des besoins encore insuffisante pour certains modules complexes (ex. EPIC-04, EPIC-12), nécessitant un raffinement au Cahier des Spécifications Détaillées | Risque de rework au Cahier 6 | Moyen |
| Besoins « Non retenus » (ex. multi-utilisateurs Entreprise, livraison) mal communiqués en interne et redemandés en cours de développement | Scope creep, retard | Faible à moyen |
| Complexité du barème de prix B2B par palier (BF-03-007) si le nombre de paliers par produit devient élevé | Risque d'erreur d'affichage ou de calcul | Moyen |
| Processus de validation Entreprise en 4 étapes (BF-08-006 à 009) reposant sur une vérification manuelle par l'administrateur | Délai de validation variable selon la charge de l'équipe | Faible à moyen |

## 7. Hypothèses

Toutes les hypothèses initialement posées dans ce cahier (durées de garantie, taux de taxe, stock de référence) sont désormais résolues et actées (voir décisions n°18, 19 et 28, section 8). Les hypothèses H1 à H5 du Cahier UX/UI et du Cahier des Tests sont également toutes résolues (décisions n°29 à 33). Il ne reste aucune hypothèse ouverte à ce stade du projet.

## 8. Décisions actées

Reprises à l'identique du Cahier de Vision (section 17) et du PRD (section 13), sans modification :

| # | Sujet | Décision |
|---|---|---|
| 1 | Transporteurs/logistique internationale | ~~Information non disponible~~ → **rendu sans objet par la décision n°27** |
| 2 | Cadre légal / données personnelles | Politique de confidentialité multi-juridictions |
| 3 | Tarifs préférentiels B2B | ~~Négociation au cas par cas~~ → **remplacé par la décision n°16** (barème par palier) |
| 4 | Programme de fidélité | ~~Statuts Bronze / Argent / Or~~ → **annulé par la décision n°26** |
| 5 | Assistance à l'installation solaire | Réalisée en interne |
| 6 | Ambition technique | Plateforme scalable dès le départ |
| 7 | Contrainte budgétaire | Aucune contrainte identifiée |
| 8 | Rôles multi-utilisateurs compte Entreprise | Non nécessaire (BF-08-005 non retenu) |
| 9 | Onglet Admin « Contenu » | Requalifié Essentielle (BF-12-011 en Must have) |
| 10 | Nom commercial de l'entreprise | ATC |
| 11 | Partenaires logistiques / transporteurs internationaux | ~~Aucun partenaire identifié~~ → **rendu sans objet par la décision n°27** |
| 12 | Volumétrie cible pour la scalabilité | Environ 50 transactions (commandes/devis) par jour |
| 13 | Seuils des statuts de fidélité | ~~Bronze/Argent/Or~~ → **annulé par la décision n°26** |
| 14 | Ordre de mise en œuvre des Epics | Confirmé par le client (EPIC-07 retiré de la séquence) |
| 15 | Nom légal complet de l'entreprise | ATC signifie « Alpha Tech Center » |
| 16 | Tarification B2B | Barème de prix par palier de quantité (BF-03-007), remplace la négociation |
| 17 | Validation des comptes Entreprise | Processus en 4 étapes (BF-08-006 à 009) |
| 18 | Taxe/TVA sur factures | Taux confirmé à 10 %, doit apparaître sur pro forma et factures définitives (BF-06-005) |
| 19 | Durées de garantie par catégorie | Valeurs de travail validées par ATC en attendant les durées définitives (BF-09-001) |
| 20 | Rôles administrateurs | Deux rôles uniquement : Général et Agent SAV (BF-12-014) |
| 21 | Seuils d'alerte de stock | Pourcentage du stock de référence : orange ≤ 40 %, rouge ≤ 15 % (BF-03-002) |
| 22 | Délai d'expiration d'un devis | 3 jours après réponse commerciale (BF-04-008) |
| 23 | Paiement par virement bancaire | Exclu du périmètre (BF-06-004 non retenu) |
| 24 | Gestion du taux de change HTG/USD | Manuel, indépendant de toute source externe (BF-06-001) |
| 25 | Affichage des prix | Exclusivement en USD (BF-06-006, BF-01-005 non retenu) |
| 26 | Programme de fidélisation | Annulé intégralement (BF-10-001, BF-10-002 non retenus) |
| 27 | Service de livraison | Annulé intégralement (EPIC-07 non retenu, BF-05-004 conservé pour le retrait) |
| 28 | Valeur par défaut du stock de référence | 100 unités (valeur fictive de travail, remplaçable sans impact structurel) |
| 29 | Règle minimale du configurateur de package | Au moins un panneau solaire et une batterie requis (BF-04-002) |
| 30 | Formats et taille des documents Entreprise | PDF, JPG, PNG — taille maximale 5 Mo par fichier (BF-08-007) |
| 31 | Palette et typographie du design system | Validées comme base de travail, en attendant les fichiers de marque définitifs d'ATC |
| 32 | Cas limite d'expiration du devis (J+3 exact) | Acceptation exactement à J+3 considérée comme encore valide (BF-04-008) |
| 33 | Arrondi de la taxe sur les factures | Au centime le plus proche (BF-06-005) |
| 34 | Choix du prestataire de paiement carte (PSP) | Laissé libre à l'équipe technique |
| 35 | Équipe de développement | Projet confié à un prestataire déjà identifié par ATC |
| 36 | Conservation des documents Entreprise | Durée indéfinie |
| 37 | Politique de suppression des comptes inactifs | Aucune, conservation indéfinie |
| 38 | Intégration WhatsApp | Intégration directe avec Meta (BF-09-003) |
| 39 | Palette de couleurs officielle | Mesurée sur le logo officiel reçu (bleu `#014DAB`, accent `#FE4028`) |
| 40 | Visuels marketing fournisseur (Sécurité) | Utilisés tels quels, texte anglais incrusté conservé |
| 41 | Comptes techniques tiers | Développement en sandbox/test ; démo client avant bascule en production |
| 42 | Catalogue produit réel | Données fictives de démonstration en attendant les informations réelles |
| 43 | Typographie officielle | Confirmée : Sora (titres) / Inter (texte courant) |
| 44 | Charte graphique écrite | N'existe pas ; seuls les fichiers logo font foi |
| 45 | Nom de domaine et hébergement | Non déterminés, laissés au prestataire de développement |

## 9. Questions restantes

1. ~~Transporteurs/partenaires logistiques~~ — **Sans objet** : aucun service de livraison n'est proposé (décision actée n°27).
2. ~~Identité de marque~~ — **Résolu** : nom légal complet ATC = Alpha Tech Center (décision actée n°15).
3. ~~Cadrage chiffré de la scalabilité~~ — **Résolu** : volumétrie cible d'environ 50 transactions/jour (décision actée n°12).
4. ~~Critères des statuts de fidélité~~ — **Sans objet** : programme de fidélisation annulé (décision actée n°26).
5. ~~Cadre de négociation B2B~~ — **Résolu** : remplacé par le barème de prix par palier de quantité (décision actée n°16, BF-03-007).
6. ~~Grille de calcul des frais de livraison~~ — **Sans objet** : aucune livraison proposée (décision actée n°27).

**Toutes les questions opérationnelles sont désormais résolues** (registre détaillé au Cahier des Règles Métiers, Cahier 4, décisions n°16 à 28). Aucune question restante à ce stade.

## 10. Traçabilité et documents liés

Ce cahier constitue le pôle « **besoins** » de la matrice de traçabilité globale (besoins → fonctionnalités → cas d'utilisation → tests) qui sera consolidée dans le Dossier Final de Validation (Cahier 15). Chaque identifiant `BF-XX-NNN` introduit ici sera repris :

- Dans le **Cahier des Règles Métiers (Cahier 4)**, pour formaliser les règles de calcul et de gestion associées (ex. BF-03-007, BF-08-006 à 009).
- Dans le **Cahier des Cas d'Utilisation (Cahier 5)**, pour dérouler chaque besoin en scénarios utilisateur détaillés.
- Dans le **Cahier des Spécifications Fonctionnelles Détaillées (Cahier 6)**, pour la description écran par écran.
- Dans le **Cahier des Tests (Cahier 12)**, pour la couverture de test associée à chaque besoin.

## 11. Conclusion

Ce cahier recense **92 besoins fonctionnels** répartis sur 15 modules (dont un désormais annulé — EPIC-07), directement traçables vers les Epics du PRD et les décisions actées du Cahier de Vision. Aucune fonctionnalité du document source n'a été omise : celles non retenues sont explicitement signalées plutôt que supprimées silencieusement.

Ce cahier intègre le recadrage majeur d'ATC : barème de prix B2B par palier de quantité (BF-03-007), suppression du module Livraison et du programme de fidélité, affichage USD exclusif, processus de validation Entreprise en 4 étapes. Le taux de taxe exact et les durées de garantie réelles restent à recevoir avant la finalisation complète du **Cahier des Règles Métiers (Cahier 4)**, également mis à jour.

---

*Fin du Cahier des Besoins Fonctionnels — Document 3/15*
