# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Plateforme E-commerce B2B/B2C — Électronique & Énergie Solaire (Haïti & Diaspora)

---

### Page de garde

| | |
|---|---|
| **Projet** | Plateforme e-commerce Électronique, Énergie Solaire, Sécurité & Climatisation |
| **Client** | ATC |
| **Type de document** | Product Requirements Document — PRD (Document 2/15) |
| **Version** | 1.2 |
| **Date** | 01/08/2026 |
| **Statut** | Version finale — validée, mise à jour majeure suite au recadrage client (tarification B2B, retrait Livraison, retrait Fidélisation, politique de devise) |
| **Document parent** | Cahier de Vision du Projet (Document 1/15) |
| **Diffusion** | Direction, Produit, UX/UI, Développement, QA, DevOps |
| **Confidentialité** | Document interne — usage projet uniquement |

---

### Historique des versions

| Version | Date | Auteur | Description |
|---|---|---|---|
| 0.1 | 01/08/2026 | Architecte Produit (IA) | Rédaction initiale, déclinaison du Cahier de Vision |
| 1.0 | 01/08/2026 | Architecte Produit (IA) | Version finale après auto-évaluation et intégration des améliorations |
| 1.1 | 01/08/2026 | Architecte Produit (IA) | Mise à jour suite aux réponses client (nom commercial, logistique, volumétrie) — cf. Cahier de Vision v1.1 |
| 1.2 | 01/08/2026 | Architecte Produit (IA) | Recadrage majeur aligné sur le Cahier de Vision v1.2 : barème B2B, suppression EPIC-07 (Livraison) et volet fidélité de l'EPIC-10, affichage USD uniquement |

---

### Sommaire

1. Introduction et lien avec le Cahier de Vision
2. Objectifs produit
3. Personas (résumé)
4. Méthode de priorisation (MoSCoW)
5. Périmètre produit par domaine fonctionnel (Epics)
6. Exigences non fonctionnelles — résumé
7. Dépendances externes
8. Hors périmètre V1
9. Definition of Done — Lancement V1
10. Roadmap produit (releases)
11. Risques produit
12. Hypothèses
13. Décisions actées
14. Questions restantes
15. Traçabilité et documents liés
16. Conclusion

<!-- pagebreak -->

## 1. Introduction et lien avec le Cahier de Vision

Ce PRD traduit la vision stratégique définie dans le **Cahier de Vision du Projet (Document 1/15)** en exigences produit concrètes, organisées par **domaine fonctionnel (epic)**, priorisées selon la méthode MoSCoW, et associées à des critères de succès mesurables.

Il ne détaille ni les règles métiers précises (Cahier 4), ni les cas d'utilisation pas à pas (Cahier 5), ni les spécifications techniques (Cahier 6) : ces éléments seront construits **au-dessus** des exigences ici définies, dans la continuité et sans les contredire.

## 2. Objectifs produit

Déclinaison opérationnelle des objectifs stratégiques (OB1 à OB5) du Cahier de Vision, section 4 :

| Réf. | Objectif produit | Objectif business associé |
|---|---|---|
| PO1 | Permettre à un client de soumettre une demande de devis solaire complète via le configurateur, sans intervention humaine préalable | OB1 |
| PO2 | Offrir un parcours d'achat entièrement fonctionnel en FR/EN/ES, avec prix affichés en USD, dès le lancement | OB2 |
| PO3 | Permettre à un compte Entreprise de télécharger une facture pro forma conforme immédiatement après acceptation d'un devis | OB3 |
| PO4 | Fournir sur chaque fiche produit les informations techniques, le stock et les avis nécessaires à une décision d'achat sans contact humain préalable | OB4 |
| PO5 | Livrer une architecture V1 validée pour absorber la montée en charge sans refonte majeure | OB5 |

## 3. Personas (résumé)

Repris du Cahier de Vision, section 5 — détail complet, scénarios et points de friction dans le **Cahier UX/UI (Cahier 7)** :

- **Particulier Haïti** — achat direct, paiement MonCash, retrait simple.
- **Particulier diaspora** — paiement carte/PayPal, modalités de retrait à clarifier en amont.
- **Entreprise (B2B)** — barème de prix par volume, devis sur-mesure, facturation professionnelle.
- **Administrateur / équipe interne** — back-office, traitement des devis, SAV, installation.

## 4. Méthode de priorisation (MoSCoW)

Les priorités *Essentielle / Recommandée / Optionnelle* du document source sont traduites en MoSCoW pour piloter la mise en œuvre :

| Priorité document source | Équivalent MoSCoW | Signification pour la V1 |
|---|---|---|
| Essentielle | **Must have** | Bloquant pour le lancement |
| Recommandée | **Should have** | Fortement souhaité au lancement (absence de contrainte budgétaire — décision actée n°7) |
| Optionnelle | **Could have** | Envisageable en V1 si le temps le permet, sinon V1.x |
| Hors périmètre V1 (Cahier 1, section 7) | **Won't have (this time)** | Explicitement reporté |

## 5. Périmètre produit par domaine fonctionnel (Epics)

### EPIC-01 — Navigation & Catalogue
**Priorité :** Must have
**Périmètre V1 :** Menu par grandes catégories, espace Entreprise/Particulier, fil d'Ariane, sélecteur de langue (prix affichés exclusivement en USD), filtrage par marque, fiches techniques comparatives par sous-catégorie.
**User stories représentatives :**
- En tant que particulier, je veux naviguer par grande catégorie (Électronique / Solaire / Sécurité / Climatisation) afin de trouver rapidement le bon univers produit.
- En tant qu'entreprise, je veux accéder à un espace dédié afin de retrouver une expérience adaptée à mes besoins professionnels.
**Métrique de succès :** Taux de rebond sur la page d'accueil, profondeur moyenne de navigation.
**Référence détail :** Cahiers 3, 6, 7

### EPIC-02 — Recherche & Filtres
**Priorité :** Must have
**Périmètre V1 :** Barre de recherche avec suggestions, filtres techniques (puissance, capacité batterie, marque, prix), filtre « disponible en package ».
**User stories représentatives :**
- En tant que client B2B, je veux filtrer les panneaux solaires par puissance et prix afin de composer rapidement une short-list technique.
**Métrique de succès :** Taux d'usage des filtres, taux de conversion recherche → fiche produit.
**Référence détail :** Cahiers 3, 6

### EPIC-03 — Fiche Produit
**Priorité :** Must have
**Périmètre V1 :** Description, spécifications techniques, images, prix, indicateur de stock (alerte par pourcentage), **barème de prix B2B par palier de quantité** pour les comptes Entreprise validés, produits associés/compatibles, bouton « Ajouter au package personnalisé » distinct du panier.
**User stories représentatives :**
- En tant que particulier diaspora, je veux voir clairement le prix et la disponibilité afin de décider sans contact humain préalable.
- En tant qu'entreprise, je veux consulter le barème de prix par palier de quantité et sélectionner directement la quantité qui m'intéresse afin de connaître immédiatement le prix applicable, sans négociation manuelle.
**Métrique de succès :** Taux d'ajout au panier/package depuis la fiche produit ; taux d'utilisation du barème par les comptes B2B.
**Référence détail :** Cahiers 3, 4, 6, 7

### EPIC-04 — Devis & Packages personnalisés
**Priorité :** Must have — **Epic différenciant du projet**
**Périmètre V1 :** Catalogue de packages pré-configurés en achat immédiat, générateur de package personnalisé, envoi automatique en demande de devis (dont le prix s'appuie sur les barèmes de chaque composant), suivi de statut du devis dans l'espace client, expiration automatique après 3 jours sans réponse du client.
**User stories représentatives :**
- En tant que particulier, je veux acheter un package solaire pré-configuré directement en ligne afin d'obtenir mon système rapidement si mon besoin est standard.
- En tant qu'entreprise, je veux composer mon propre système solaire (panneaux + batteries + régulateur + accessoires) afin d'obtenir un devis adapté à mon besoin réel.
- En tant que client, je veux suivre le statut de mon devis (en attente / répondu / accepté) afin de ne pas avoir à relancer par téléphone.
**Métrique de succès :** Taux de transformation devis → commande, délai moyen de première réponse.
**Référence détail :** Cahiers 3, 4, 5, 6 — Epic prioritaire à spécifier en premier

### EPIC-05 — Panier & Commande
**Priorité :** Must have
**Périmètre V1 :** Panier classique pour achats directs, résumé de commande avec sous-total par catégorie, application automatique du prix du palier de quantité sélectionné pour les comptes B2B.
**User stories représentatives :**
- En tant qu'acheteur B2B, je veux voir un sous-total par catégorie de produit afin de faciliter mon suivi comptable interne.
- En tant qu'acheteur B2B, je veux que le prix du palier de quantité choisi sur la fiche produit soit automatiquement repris dans mon panier, sans ressaisie ni erreur.
**Métrique de succès :** Taux d'abandon panier.
**Référence détail :** Cahiers 3, 4, 6

### EPIC-06 — Paiement & Facturation
**Priorité :** Must have
**Périmètre V1 :** MonCash, Visa/Mastercard, PayPal, facture pro forma téléchargeable (avec taxe locale applicable), prix affichés exclusivement en USD, conversion automatique en HTG uniquement lors du paiement MonCash (taux interne défini par l'administrateur). Le virement bancaire n'est pas proposé, quel que soit le montant.
**User stories représentatives :**
- En tant qu'entreprise, je veux recevoir une facture pro forma téléchargeable après acceptation de mon devis afin de la transmettre à mon service comptable.
- En tant que particulier en Haïti, je veux payer par MonCash et voir automatiquement le montant converti en gourdes afin de payer dans ma devise locale.
**Métrique de succès :** Taux de succès des transactions par moyen de paiement.
**Référence détail :** Cahiers 3, 4, 9 (Intégrations), 11 (Exigences non fonctionnelles)

### ~~EPIC-07 — Livraison & Logistique~~ — **ANNULÉ**
**Priorité :** Won't have (retiré du périmètre du projet — décision actée n°27)
**Décision :** Aucun service de livraison n'est proposé par la plateforme. Le client organise lui-même le retrait ou le transport de sa commande, selon des modalités définies par ATC et communiquées lors de la confirmation de commande.
**Élément conservé :** un statut de commande « Prête pour retrait » avec notification au client, désormais rattaché à l'EPIC-05 (Panier & Commande).
**Référence détail :** Cahier de Vision v1.2, section 17 (décision n°27) ; Cahier 3 (BF-07)

### EPIC-08 — Compte Client (B2B/B2C)
**Priorité :** Must have
**Périmètre V1 :** Distinction compte Entreprise / Particulier à l'inscription, processus de validation Entreprise en 4 étapes (inscription, documents, vérification, activation — décision actée n°17), carnet d'adresses multiples, historique des commandes et des devis.
**Non retenu (décision actée n°8) :** Gestion de plusieurs utilisateurs sous un même compte entreprise.
**User stories représentatives :**
- En tant qu'entreprise, je veux soumettre mes documents légaux (patente, NIF, registre de commerce) afin d'obtenir l'accès aux tarifs professionnels après vérification par ATC.
- En tant qu'entreprise validée, je veux que mon compte affiche automatiquement les barèmes B2B et mon historique de devis afin de gagner du temps sur mes commandes récurrentes.
**Métrique de succès :** Taux de complétion du profil, délai moyen de validation d'un compte Entreprise, taux de réachat.
**Référence détail :** Cahiers 3, 4, 6

### EPIC-09 — SAV & Assistance
**Priorité :** Must have (garantie, chatbot/WhatsApp) / Should have (ticket SAV)
**Périmètre V1 :** Garantie produit affichée par catégorie, système de ticket SAV, assistance via chatbot/WhatsApp, **assistance à l'installation réalisée en interne** (décision actée n°5).
**User stories représentatives :**
- En tant que client ayant acheté un système solaire, je veux planifier une installation avec l'équipe interne afin d'être sûr de la qualité du service.
- En tant que client, je veux ouvrir un ticket SAV directement depuis mon compte afin de suivre ma réclamation.
**Métrique de succès :** Délai moyen de résolution SAV, taux de satisfaction post-installation.
**Référence détail :** Cahiers 3, 4, 5 — **Point de vigilance opérationnel : capacité de l'équipe interne (voir Cahier de Vision, section 14, recommandation 4)**

### EPIC-10 — Marketing (Avis clients)
**Priorité :** Should have
**Périmètre V1 :** Avis et notes sur les produits, modération avant publication.
**Priorité Could have :** Newsletter/offres automatiques sans code.
**~~Annulé (décision actée n°26)~~ :** programme de fidélité par statuts, ventes groupées B2B automatiques — aucun mécanisme de fidélisation ne sera développé (statuts, points, récompenses, remises, niveaux de membres).
**User stories représentatives :**
- En tant que futur acheteur, je veux lire les avis d'autres clients afin de compenser l'absence de contact physique avec le produit.
**Métrique de succès :** Note moyenne des avis, taux de dépôt d'avis après achat.
**Référence détail :** Cahiers 3, 4, 7

### EPIC-11 — Contenu (FAQ, Blog, Légal)
**Priorité :** Must have (requalifié — décision actée n°9)
**Périmètre V1 :** FAQ générale et par catégorie, blog (conseils installation, comparatifs), CGV, politique de confidentialité multi-juridictions, mentions légales, conditions export/international.
**User stories représentatives :**
- En tant que client diaspora, je veux comprendre les conditions douanières applicables à ma commande afin d'éviter une mauvaise surprise à réception.
**Métrique de succès :** Taux de consultation FAQ avant contact SAV (indicateur d'autonomie client).
**Référence détail :** Cahiers 3, 4, 6

### EPIC-12 — Administration / Back-office
**Priorité :** Must have
**Périmètre V1 :** Tableau de bord, onglets Catalogue (avec gestion des barèmes de prix B2B par palier), Packages, Devis, Commandes, Clients (dont validation des comptes Entreprise), Paiements, **Contenu** (requalifié Essentielle), Paramètres généraux ; onglets Should have : Assistance/SAV, Avis clients, Statistiques, Utilisateurs & permissions (2 rôles fixes — décision actée n°20) ; onglet Could have : Support client centralisé.
**User stories représentatives :**
- En tant qu'administrateur commercial, je veux voir en un coup d'œil les devis en attente afin de prioriser mes réponses.
- En tant qu'administrateur catalogue, je veux définir plusieurs paliers de prix par quantité pour un produit B2B afin de refléter la stratégie tarifaire par volume.
- En tant qu'administrateur, je veux examiner les documents soumis par une entreprise afin d'approuver, rejeter ou demander des informations complémentaires avant activation du compte.
**Métrique de succès :** Délai moyen de traitement d'un devis depuis le back-office, délai moyen de validation d'un compte Entreprise.
**Référence détail :** Cahiers 3, 4, 5, 6, 13 (Guide Administrateur) — Epic transverse, dépend de tous les autres

### EPIC-13 — Sécurité & Conformité
**Priorité :** Must have
**Périmètre V1 :** Certificat SSL / paiement sécurisé, protection des données clients selon politique multi-juridictions (décision actée n°2).
**Métrique de succès :** Absence d'incident de sécurité, conformité validée en audit.
**Référence détail :** Cahier 11 (Exigences non fonctionnelles)

### EPIC-14 — Internationalisation
**Priorité :** Must have (langues)
**Périmètre V1 :** FR/EN/ES, prix affichés exclusivement en USD sur toute la plateforme.
**Métrique de succès :** Répartition du trafic et des commandes par langue.
**Référence détail :** Cahiers 3, 4, 9, 10

### EPIC-15 — Analytics & Pilotage
**Priorité :** Should have
**Périmètre V1 :** Suivi des ventes, des demandes de devis, du comportement client ; onglet Statistiques/Analytics en back-office.
**Métrique de succès :** Disponibilité des tableaux de bord dès le jour 1 de mise en production.
**Référence détail :** Cahiers 6, 9, 15 (Dossier Final)

<!-- pagebreak -->

## 6. Exigences non fonctionnelles — résumé

*Détail complet dans le Cahier des Exigences Non Fonctionnelles (Cahier 11) ; les éléments ci-dessous sont les lignes directrices déjà actées à ce stade :*

- **Performance :** temps de chargement optimisé pour connexions faibles, marché haïtien en priorité.
- **Scalabilité :** architecture prévue pour montée en charge dès le lancement (décision actée n°6), sans refonte majeure anticipée.
- **Sécurité :** SSL, protection des données selon une politique multi-juridictions (Haïti, USA, Canada, UE le cas échéant).
- **Accessibilité :** conformité visée aux normes WCAG 2.2 AA (cf. exigences UX/UI du cadrage projet), à détailler au Cahier UX/UI.
- **Responsive :** approche mobile-first, compatible mobile/tablette/desktop.
- **Disponibilité :** back-office et front-office critiques pour l'activité (devis, paiement) — niveau de service cible à définir au Cahier 11.

## 7. Dépendances externes

| Dépendance / point ouvert | Statut | Impact |
|---|---|---|
| Choix d'un transporteur international | **Sans objet** : aucun service de livraison n'est proposé (décision actée n°27) | — |
| Identité de marque (nom commercial, logo, charte graphique) | **Résolue** : nom légal complet ATC = Alpha Tech Center (décision actée n°15) ; logo et charte graphique existants, à transmettre pour le Cahier UX/UI | Aucun blocage |
| Cadrage chiffré de la scalabilité | **Résolue** : volumétrie cible d'environ 50 transactions/jour (décision actée n°12) | Permet le dimensionnement au Cahier d'Architecture |
| Taux de taxe applicable sur les factures | **Résolue** : 10 % (décision actée n°18) | Aucun blocage |
| Durées de garantie réelles par catégorie | **Résolue provisoirement** : valeurs de travail validées par ATC (décision actée n°19) ; durées définitives à transmettre ultérieurement | Aucun blocage |
| Valeur par défaut du stock de référence par produit | **Ouverte** | À traiter au Cahier des Données (Cahier 9) |

La quasi-totalité des dépendances initialement identifiées sont désormais résolues ou rendues sans objet par le recadrage du projet (voir Cahier de Vision v1.2).

## 8. Hors périmètre V1

Repris et confirmé du Cahier de Vision, section 7 :

- Historique de devis avancé avec analytics poussée.
- **Tout service de livraison** (transport, suivi de colis, zones et frais) — retiré intégralement du périmètre, et non simplement reporté (décision actée n°27).
- **Tout mécanisme de fidélisation** (statuts, points, récompenses, remises, niveaux de membres) — retiré intégralement du périmètre (décision actée n°26).
- **Le paiement par virement bancaire** — exclu du périmètre quel que soit le montant (décision actée n°23).
- Support client centralisé avancé au-delà du strict onglet Contenu/Support.
- Gestion multi-utilisateurs sous un même compte Entreprise (décision actée n°8).

## 9. Definition of Done — Lancement V1

Le lancement V1 est considéré prêt lorsque :

- [ ] Tous les Epics **Must have** (01, 02, 03, 04, 05, 06, 08, 09 partiel, 11, 12, 13, 14) sont fonctionnels de bout en bout.
- [ ] Le parcours de bout en bout « achat direct » et le parcours « devis solaire » ont chacun été testés (Cahier 12 — Tests).
- [ ] La politique de confidentialité multi-juridictions et les CGV sont publiées (EPIC-11).
- [ ] Le back-office permet à un administrateur de traiter un devis de bout en bout sans intervention technique (EPIC-12).
- [ ] Les moyens de paiement MonCash, carte, PayPal sont opérationnels en environnement de production (EPIC-06).
- [ ] Les trois langues (FR/EN/ES) sont disponibles sur l'ensemble des parcours Must have (EPIC-14).
- [ ] Le barème de prix B2B par palier de quantité est fonctionnel sur les fiches produits éligibles (EPIC-03).
- [ ] Le processus de validation des comptes Entreprise en 4 étapes est opérationnel (EPIC-08).
- [ ] Les modalités de retrait de commande sont clairement communiquées au client, en l'absence de tout service de livraison (EPIC-05).

## 10. Roadmap produit (releases)

| Release | Contenu | Référence |
|---|---|---|
| **V1.0 — Lancement** | Ensemble des Epics Must have + Should have priorisés (voir section 5), y compris le barème B2B | Cahier de Vision, section 13 (court terme) |
| **V1.1 — Post-lancement rapide** | Epics Could have non intégrés en V1.0 (newsletter, support centralisé, analytics avancé) | Cahier de Vision, section 13 (moyen terme) |
| **V2** | Extension du catalogue à de nouvelles familles de produits ; un service de livraison n'est pas planifié à ce stade | Cahier de Vision, section 13 (long terme) |

## 11. Risques produit

| Risque | Impact | Niveau |
|---|---|---|
| Sous-estimation de la complexité de l'EPIC-04 (Devis & Packages), pourtant epic différenciant | Retard de la fonctionnalité la plus stratégique | Élevé |
| Grand nombre d'Epics classés Must have en l'absence de contrainte budgétaire, sans ordre d'implémentation défini | Risque de développement en parallèle mal coordonné | Moyen |
| Absence de tout service de livraison, alors que la clientèle diaspora est habituée à un service porte-à-porte | Risque commercial d'attractivité réduite pour la clientèle internationale | Moyen |
| Back-office (EPIC-12) sous-estimé car transverse à tous les autres epics | Sous-évaluation de la charge de développement back-office | Moyen |
| Complexité de gestion du barème de prix B2B par palier (EPIC-03/05) si le nombre de paliers par produit est élevé | Risque d'erreur d'affichage ou de calcul du prix applicable | Moyen |

## 12. Hypothèses

Reprises sans modification du Cahier de Vision, section 16. Aucune hypothèse supplémentaire n'a été nécessaire à ce stade du PRD.

## 13. Décisions actées

Reprises à l'identique du Cahier de Vision, section 17 (aucune modification — conformément à la règle de réutilisation des décisions déjà prises) :

| # | Sujet | Décision |
|---|---|---|
| 1 | Transporteurs/logistique internationale | ~~Information non disponible~~ → **rendu sans objet par la décision n°27** |
| 2 | Cadre légal / données personnelles | Politique de confidentialité multi-juridictions |
| 3 | Tarifs préférentiels B2B | ~~Négociation au cas par cas~~ → **remplacé par la décision n°16** (barème par palier) |
| 4 | Programme de fidélité | ~~Statuts Bronze / Argent / Or~~ → **annulé par la décision n°26** |
| 5 | Assistance à l'installation solaire | Réalisée en interne |
| 6 | Ambition technique | Plateforme scalable dès le départ |
| 7 | Contrainte budgétaire | Aucune contrainte identifiée |
| 8 | Rôles multi-utilisateurs compte Entreprise | Non nécessaire |
| 9 | Onglet Admin « Contenu » | Requalifié Essentielle |
| 10 | Nom commercial de l'entreprise | ATC |
| 11 | Partenaires logistiques / transporteurs internationaux | ~~Aucun partenaire identifié~~ → **rendu sans objet par la décision n°27** |
| 12 | Volumétrie cible pour la scalabilité | Environ 50 transactions (commandes/devis) par jour |
| 13 | Seuils des statuts de fidélité | ~~Bronze/Argent/Or~~ → **annulé par la décision n°26** |
| 14 | Ordre de mise en œuvre des Epics | Confirmé par le client |
| 15 | Nom légal complet de l'entreprise | ATC signifie « Alpha Tech Center » |
| 16 | Tarification B2B | Barème de prix par palier de quantité par produit, affiché sur la fiche produit (modèle Alibaba), remplace la négociation |
| 17 | Validation des comptes Entreprise | Processus en 4 étapes : inscription, documents, vérification, activation |
| 18 | Taxe/TVA sur factures | Taux confirmé à **10 %** |
| 19 | Durées de garantie par catégorie | Valeurs de travail validées par ATC |
| 20 | Rôles administrateurs | Deux rôles uniquement : Général et Agent SAV |
| 21 | Seuils d'alerte de stock | Pourcentage du stock de référence : orange ≤ 40 %, rouge ≤ 15 % |
| 22 | Délai d'expiration d'un devis | 3 jours après réponse commerciale |
| 23 | Paiement par virement bancaire | Exclu du périmètre, quel que soit le montant |
| 24 | Gestion du taux de change HTG/USD | Manuel, indépendant de toute source externe, politique commerciale interne |
| 25 | Affichage des prix | Exclusivement en USD ; conversion HTG automatique uniquement au paiement MonCash |
| 26 | Programme de fidélisation | Annulé intégralement |
| 27 | Service de livraison | Annulé intégralement — retrait à la charge du client |
| 28 | Valeur par défaut du stock de référence | 100 unités (valeur fictive de travail), remplaçable sans impact structurel |
| 29 | Règle minimale du configurateur de package | Au moins un panneau solaire et une batterie requis |
| 30 | Formats et taille des documents Entreprise | PDF, JPG, PNG — taille maximale 5 Mo par fichier |
| 31 | Palette et typographie du design system | Validées comme base de travail, en attendant les fichiers de marque définitifs d'ATC |
| 32 | Cas limite d'expiration du devis (J+3 exact) | Acceptation exactement à J+3 considérée comme encore valide |
| 33 | Arrondi de la taxe sur les factures | Au centime le plus proche |
| 34 | Choix du prestataire de paiement carte (PSP) | Laissé libre à l'équipe technique |
| 35 | Équipe de développement | Projet confié à un prestataire déjà identifié par ATC |
| 36 | Conservation des documents Entreprise | Durée indéfinie |
| 37 | Politique de suppression des comptes inactifs | Aucune, conservation indéfinie |
| 38 | Intégration WhatsApp | Intégration directe avec Meta |
| 39 | Palette de couleurs officielle | Mesurée sur le logo officiel reçu (bleu `#014DAB`, accent `#FE4028`) |
| 40 | Visuels marketing fournisseur (Sécurité) | Utilisés tels quels, texte anglais incrusté conservé |
| 41 | Comptes techniques tiers | Développement en sandbox/test ; démo client avant bascule en production |
| 42 | Catalogue produit réel | Données fictives de démonstration en attendant les informations réelles |
| 43 | Typographie officielle | Confirmée : Sora (titres) / Inter (texte courant) |
| 44 | Charte graphique écrite | N'existe pas ; seuls les fichiers logo font foi |
| 45 | Nom de domaine et hébergement | Non déterminés, laissés au prestataire de développement |

## 14. Questions restantes

1. ~~Transporteurs/partenaires logistiques~~ — **Sans objet** : aucun service de livraison n'est proposé (décision actée n°27).
2. ~~Identité de marque~~ — **Résolu** : nom légal complet ATC = Alpha Tech Center (décision actée n°15) ; logo et charte graphique existants.
3. ~~Cadrage chiffré de la scalabilité~~ — **Résolu** : volumétrie cible d'environ 50 transactions/jour (décision actée n°12).
4. ~~Ordre de mise en œuvre des Epics Must have~~ — **Confirmé explicitement par le client**, sous réserve de retirer l'EPIC-07 (Livraison), désormais annulé, de la séquence proposée : (1) EPIC-01/02/03 Catalogue-Recherche-Fiche produit, (2) EPIC-04 Devis & Packages, (3) EPIC-06 Paiement, (4) EPIC-05 Panier, (5) EPIC-08 Compte Client, (6) EPIC-12 Back-office (transverse), (7) EPIC-11/13/14, (8) EPIC-09/10/15.
5. ~~Valeur par défaut du stock de référence~~ — **Résolu** : 100 unités (décision actée n°28).

**Toutes les questions produit de ce PRD sont désormais résolues.** Des questions plus opérationnelles ont émergé dans les cahiers suivants (Architecture, Données).

## 15. Traçabilité et documents liés

Ce PRD s'appuie intégralement sur le Cahier de Vision (Document 1/15) et sert de référence pour :

- Le **Cahier des Besoins Fonctionnels (Cahier 3)**, qui détaillera chaque Epic en besoins fonctionnels unitaires.
- Le **Cahier des Règles Métiers (Cahier 4)**, qui formalisera les règles évoquées ici en filigrane (ex. calcul du barème de prix B2B par palier, validation des comptes Entreprise).
- Le **Cahier des Cas d'Utilisation (Cahier 5)**, qui déclinera les user stories macro en scénarios détaillés.
- Le **Cahier UX/UI (Cahier 7)**, qui approfondira personas et parcours.
- Le **Cahier d'Architecture (Cahier 8)**, qui répondra à l'exigence de scalabilité (PO5).

## 16. Conclusion

Ce PRD établit un pont clair entre la vision stratégique et la mise en œuvre produit : quinze domaines fonctionnels priorisés (dont un désormais annulé — EPIC-07 Livraison), des critères de succès mesurables par domaine, et une Definition of Done explicite pour le lancement. L'Epic Devis & Packages (EPIC-04) demeure le cœur différenciant du projet et doit faire l'objet d'une attention particulière dès le Cahier des Besoins Fonctionnels.

Ce PRD intègre le recadrage majeur communiqué par ATC : barème de prix B2B par palier de quantité (remplace la négociation), suppression complète du module Livraison et du programme de fidélité, affichage exclusif en USD, et processus détaillé de validation des comptes Entreprise. Ces changements sont répercutés dans le **Cahier des Besoins Fonctionnels (Cahier 3)** et le **Cahier des Règles Métiers (Cahier 4)**, également mis à jour.

---

*Fin du Product Requirements Document — Document 2/15*
