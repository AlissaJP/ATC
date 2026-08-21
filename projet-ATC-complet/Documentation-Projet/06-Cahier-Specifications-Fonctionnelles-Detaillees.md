# CAHIER DES SPÉCIFICATIONS FONCTIONNELLES DÉTAILLÉES

## Plateforme E-commerce B2B/B2C — Électronique & Énergie Solaire (ATC — Alpha Tech Center)

---

### Page de garde

| | |
|---|---|
| **Projet** | Plateforme e-commerce Électronique, Énergie Solaire, Sécurité & Climatisation |
| **Client** | ATC (Alpha Tech Center) |
| **Type de document** | Cahier des Spécifications Fonctionnelles Détaillées (Document 6/15) |
| **Version** | 1.1 |
| **Date** | 01/08/2026 |
| **Statut** | Version finale — validée, H1/H2 confirmées |
| **Documents parents** | Cahier de Vision (Doc. 1/15), PRD (Doc. 2/15), Besoins Fonctionnels (Doc. 3/15), Règles Métiers (Doc. 4/15), Cas d'Utilisation (Doc. 5/15) |
| **Diffusion** | Direction, Produit, UX/UI, Développement, QA, DevOps |
| **Confidentialité** | Document interne — usage projet uniquement |

---

### Historique des versions

| Version | Date | Auteur | Description |
|---|---|---|---|
| 0.1 | 01/08/2026 | Architecte Produit (IA) | Rédaction initiale des spécifications écran par écran |
| 1.0 | 01/08/2026 | Architecte Produit (IA) | Version finale après auto-évaluation et intégration des améliorations |
| 1.1 | 01/08/2026 | Architecte Produit (IA) | Règle du configurateur et formats de documents confirmés (décisions n°29, n°30) |

---

### Sommaire

1. Introduction et périmètre du document
2. Méthodologie et légende
3. Spécifications détaillées par écran
4. Synthèse des écrans complémentaires (traitement allégé)
5. Risques
6. Hypothèses
7. Décisions actées
8. Questions restantes
9. Traçabilité et documents liés
10. Conclusion

<!-- pagebreak -->

## 1. Introduction et périmètre du document

Ce cahier décrit, **écran par écran**, le contenu fonctionnel des interfaces de la plateforme : composants affichés, données, actions disponibles, règles de validation, comportements et états.

**Ce document ne couvre pas** la mise en page visuelle, la charte graphique, les micro-interactions ni les animations : ces éléments relèvent du **Cahier UX/UI (Cahier 7)**, qui s'appuiera directement sur les écrans définis ici pour en concevoir l'habillage visuel et l'expérience détaillée. Cette séparation évite toute redondance entre les deux cahiers.

Chaque écran référence les cas d'utilisation (`UC-XX-NNN`, Cahier 5) qu'il permet de réaliser, ainsi que les règles de gestion (`RG-XX-NNN`, Cahier 4) qu'il applique.

## 2. Méthodologie et légende

**Convention d'identifiant :** `ECR-[N° Epic]-[N° séquentiel]`, ex. `ECR-04-002` = 2ᵉ écran de l'EPIC-04 (Devis & Packages).

**Structure de chaque écran détaillé :**
- **Objectif**
- **Accès** (acteur, prérequis de connexion/statut)
- **Composants fonctionnels** (zones, listes, formulaires, boutons — description fonctionnelle)
- **Données affichées**
- **Actions disponibles**
- **Règles de validation**
- **États de l'écran** (vide, chargement, erreur, succès — description fonctionnelle, le traitement visuel étant réservé au Cahier 7)
- **Règles métier appliquées**
- **Cas d'utilisation liés**
- **Priorité**

<!-- pagebreak -->

## 3. Spécifications détaillées par écran

### ECR-01-001 — Page d'accueil

**Objectif :** Orienter rapidement le visiteur vers les univers produits phares et rassurer sur la fiabilité du site.
**Accès :** Visiteur, tout profil connecté.
**Composants fonctionnels :**
- Menu principal par grande catégorie (Électronique / Énergie solaire / Sécurité / Climatisation).
- Bloc de mise en avant des catégories phares (Solaire, Électronique).
- Bannière dédiée aux packages solaires pré-configurés, avec lien direct vers ECR-04-001.
- Bloc « Devenir client professionnel » avec lien vers l'inscription Entreprise (ECR-08-001).
- Bloc de réassurance (paiement sécurisé, modalités de retrait, support WhatsApp).
- Sélecteur de langue (FR/EN/ES).
**Données affichées :** Catégories actives, packages en avant définis par l'administrateur (BF-12-003).
**Actions disponibles :** Naviguer vers une catégorie, un package, l'inscription Entreprise, ou changer de langue.
**Règles de validation :** Aucune (page de lecture).
**États de l'écran :** Chargement (squelette de page), erreur (page de secours si le contenu dynamique ne charge pas), succès (page complète).
**Règles métier appliquées :** Aucune règle de calcul (page de composition éditoriale).
**Cas d'utilisation liés :** UC-01-001.
**Priorité :** Must have.

---

### ECR-01-002 — Page catégorie / liste produits

**Objectif :** Permettre au visiteur de parcourir les produits d'une catégorie et d'accéder aux filtres.
**Accès :** Visiteur, tout profil connecté.
**Composants fonctionnels :**
- Fil d'Ariane (Accueil > Catégorie > Sous-catégorie).
- Liste de produits avec, pour chaque produit : image, nom, prix (public par défaut, ou barème B2B si client Entreprise vérifié — RG-03-001, RG-03-004), indicateur de stock (RG-03-002).
- Panneau de filtres (marque, puissance, capacité, prix, « disponible en package »).
- Barre de recherche avec suggestions.
**Données affichées :** Produits actifs de la catégorie/sous-catégorie sélectionnée.
**Actions disponibles :** Filtrer, trier, accéder à une fiche produit (ECR-03-001), lancer une recherche.
**Règles de validation :** Aucune.
**États de l'écran :** Vide (« Aucun produit ne correspond à ces filtres »), chargement, erreur (échec de chargement du catalogue), succès.
**Règles métier appliquées :** RG-03-001, RG-03-002, RG-03-004.
**Cas d'utilisation liés :** UC-01-001, UC-02-001.
**Priorité :** Must have.

---

### ECR-03-001 — Fiche produit

**Objectif :** Fournir toutes les informations nécessaires à la décision d'achat, y compris le barème B2B pour les comptes Entreprise vérifiés.
**Accès :** Visiteur, tout profil connecté.
**Composants fonctionnels :**
- Galerie d'images, description, spécifications techniques.
- Prix affiché (public, ou barème B2B — voir ci-dessous), en USD.
- Indicateur de stock (En stock / Alerte orange / Alerte rouge / Rupture — RG-03-002).
- **Tableau du barème de prix B2B** (visible uniquement si le client Entreprise est au statut « B2B vérifié » — RG-08-001) : colonnes « Plage de quantité » et « Prix unitaire », avec sélecteur de quantité et affichage du prix total en temps réel (RG-03-004).
- Bouton « Ajouter au panier ».
- Bouton distinct « Ajouter au package personnalisé » (si le produit est éligible — BF-03-004).
- Bloc « Produits associés / accessoires compatibles ».
- Bloc avis clients (note moyenne + liste des avis modérés).
**Données affichées :** Fiche produit complète, barème B2B le cas échéant, avis publiés.
**Actions disponibles :** Sélectionner une quantité (B2B), ajouter au panier, ajouter au package personnalisé, consulter un produit associé, lire les avis.
**Règles de validation :** Quantité saisie doit être un entier positif ; si hors bornes des paliers définis, application du palier le plus proche (RG-03-004, scénario A2 de UC-03-001).
**États de l'écran :** Chargement, erreur (produit introuvable/retiré), rupture de stock (achat direct désactivé, ajout au package personnalisé possible), succès.
**Règles métier appliquées :** RG-03-001, RG-03-002, RG-03-003, RG-03-004, RG-08-001.
**Cas d'utilisation liés :** UC-03-001.
**Priorité :** Must have.

---

### ECR-04-001 — Catalogue de packages pré-configurés

**Objectif :** Permettre un achat immédiat d'un système solaire standard.
**Accès :** Visiteur, tout profil connecté.
**Composants fonctionnels :**
- Liste des packages pré-configurés (nom, composition résumée, prix, disponibilité).
- Filtre par gamme de puissance/usage.
**Données affichées :** Packages publiés et disponibles (composants tous en stock).
**Actions disponibles :** Consulter le détail d'un package, l'ajouter directement au panier.
**Règles de validation :** Aucune.
**États de l'écran :** Vide (aucun package disponible), chargement, erreur, succès.
**Règles métier appliquées :** RG-03-002 (disponibilité des composants).
**Cas d'utilisation liés :** UC-04-001.
**Priorité :** Must have.

---

### ECR-04-002 — Configurateur de package personnalisé

**Objectif :** Permettre de composer un système solaire sur-mesure et de générer une demande de devis.
**Accès :** Client connecté (Particulier ou Entreprise) — un visiteur non connecté est invité à se connecter/s'inscrire avant validation.
**Composants fonctionnels :**
- Sélecteurs successifs : panneaux solaires, batteries, régulateur, accessoires (quantité par élément).
- Estimation de prix indicative, calculée à partir des barèmes de chaque composant (RG-03-004).
- Récapitulatif de la configuration.
- Bouton « Envoyer ma demande de devis ».
**Données affichées :** Catalogue filtré aux composants solaires compatibles entre eux.
**Actions disponibles :** Ajouter/retirer un composant, ajuster les quantités, valider la configuration.
**Règles de validation :** Au moins un panneau et une batterie doivent être sélectionnés pour valider (règle de cohérence minimale, à raffiner en Cahier des Données) ; composant en rupture bloquant (UC-04-002, E1).
**États de l'écran :** Vide (configuration non démarrée), chargement, erreur (composant indisponible), succès (devis créé, redirection vers ECR-04-003).
**Règles métier appliquées :** RG-03-002, RG-03-004, RG-04-001, RG-04-002.
**Cas d'utilisation liés :** UC-04-002.
**Priorité :** Must have — Epic différenciant.

---

### ECR-04-003 — Suivi de devis (espace client)

**Objectif :** Permettre au client de suivre le statut de ses demandes de devis et d'accepter une proposition.
**Accès :** Client connecté (Particulier ou Entreprise).
**Composants fonctionnels :**
- Liste des devis avec statut (En attente / Répondu / Accepté / Refusé / Expiré — RG-04-001).
- Détail d'un devis répondu : composition, prix total, décompte du délai avant expiration (3 jours — RG-04-005).
- Boutons « Accepter » / « Refuser » (visibles uniquement au statut « Répondu »).
- Historique des devis passés (BF-04-005).
**Données affichées :** Devis du client connecté uniquement.
**Actions disponibles :** Consulter le détail, accepter, refuser, relancer une demande après expiration.
**Règles de validation :** Acceptation impossible après expiration (RG-04-005, UC-04-004 E1).
**États de l'écran :** Vide (aucun devis), chargement, erreur, succès.
**Règles métier appliquées :** RG-04-001, RG-04-004, RG-04-005.
**Cas d'utilisation liés :** UC-04-004.
**Priorité :** Should have.

---

### ECR-04-004 — Traitement des devis (back-office)

**Objectif :** Permettre à l'administrateur de répondre à une demande de devis avec un prix calculé automatiquement.
**Accès :** Administrateur Général (ADM-G).
**Composants fonctionnels :**
- Liste des devis en attente, triable par date/ancienneté.
- Détail de la configuration demandée.
- Prix calculé automatiquement à partir des barèmes de chaque composant (RG-04-003), champ additionnel pour le coût d'installation (RG-09-002).
- Bouton « Envoyer la réponse au client ».
**Données affichées :** Toutes les demandes de devis, tous clients confondus.
**Actions disponibles :** Consulter, ajouter le coût d'installation, envoyer la réponse, demander une clarification au client.
**Règles de validation :** Impossible d'envoyer une réponse si un composant a été retiré du catalogue depuis la demande (UC-04-003, E1).
**États de l'écran :** Vide (aucun devis en attente), chargement, erreur, succès.
**Règles métier appliquées :** RG-04-001, RG-04-002, RG-04-003, RG-04-005, RG-09-002.
**Cas d'utilisation liés :** UC-04-003.
**Priorité :** Must have.

---

### ECR-05-001 — Panier

**Objectif :** Récapituler les produits sélectionnés avant paiement, avec le prix exact du palier B2B le cas échéant.
**Accès :** Visiteur (panier temporaire), tout profil connecté (panier persistant).
**Composants fonctionnels :**
- Liste des produits (nom, quantité, prix unitaire appliqué, sous-total).
- Sous-total par catégorie de produit (BF-05-002).
- Total général en USD.
- Bouton « Procéder au paiement ».
**Données affichées :** Contenu du panier du visiteur/client.
**Actions disponibles :** Modifier une quantité (recalcul automatique du palier B2B applicable — UC-05-001, E1), retirer un produit, procéder au paiement.
**Règles de validation :** Quantité modifiée ne peut pas dépasser le stock disponible (RG-03-002).
**États de l'écran :** Vide (panier vide), chargement, erreur, succès.
**Règles métier appliquées :** RG-03-004.
**Cas d'utilisation liés :** UC-05-001.
**Priorité :** Must have.

---

### ECR-05-002 — Confirmation de commande & statut de retrait

**Objectif :** Confirmer la commande et informer clairement le client des modalités de retrait, en l'absence de tout service de livraison.
**Accès :** Client ayant finalisé un paiement.
**Composants fonctionnels :**
- Récapitulatif de la commande (produits, montant, mode de paiement utilisé).
- Statut de la commande (En préparation / Prête pour retrait / Retirée — RG-05-001).
- Bloc d'information sur les modalités de retrait (lieu, horaires).
**Données affichées :** Détail de la commande confirmée.
**Actions disponibles :** Télécharger la facture pro forma si applicable (→ ECR-06-002), contacter le support.
**Règles de validation :** Aucune.
**États de l'écran :** Chargement, erreur (échec de confirmation), succès.
**Règles métier appliquées :** RG-05-001.
**Cas d'utilisation liés :** UC-05-002.
**Priorité :** Must have.

---

### ECR-06-001 — Paiement

**Objectif :** Permettre le règlement d'une commande ou d'un devis accepté, avec conversion automatique pour MonCash.
**Accès :** Client avec panier ou devis accepté en attente de paiement.
**Composants fonctionnels :**
- Montant total affiché en USD.
- Sélecteur de moyen de paiement : MonCash, Visa/Mastercard, PayPal (le virement bancaire n'est pas proposé — RG-06-001).
- Si MonCash sélectionné : affichage du montant converti en HTG selon le taux interne (RG-06-003, RG-06-004).
- Bouton de confirmation du paiement.
**Données affichées :** Montant, devise, moyens de paiement disponibles.
**Actions disponibles :** Choisir un moyen de paiement, confirmer, annuler.
**Règles de validation :** Transaction refusée → message d'erreur et proposition de réessayer ou changer de moyen de paiement (UC-06-001 E1, UC-06-002 E1).
**États de l'écran :** Chargement (traitement de la transaction), erreur (échec de paiement), succès (redirection vers ECR-05-002).
**Règles métier appliquées :** RG-06-001, RG-06-003, RG-06-004.
**Cas d'utilisation liés :** UC-06-001, UC-06-002.
**Priorité :** Must have.

---

### ECR-06-002 — Facture pro forma

**Objectif :** Mettre à disposition un document conforme, avec la taxe applicable, pour la comptabilité du client Entreprise.
**Accès :** Client Entreprise ayant un devis accepté ou une commande facturable.
**Composants fonctionnels :**
- Numéro de facture séquentiel.
- Identité ATC et identité client.
- Détail produits/prix, taxe de 10 % (RG-06-002), total.
- Bouton de téléchargement (PDF).
**Données affichées :** Facture générée automatiquement à l'acceptation du devis.
**Actions disponibles :** Télécharger, consulter l'historique des factures.
**Règles de validation :** Aucune (génération automatique).
**États de l'écran :** Chargement, erreur (génération échouée, à régénérer), succès.
**Règles métier appliquées :** RG-06-002.
**Cas d'utilisation liés :** UC-06-003.
**Priorité :** Must have.

---

### ECR-08-001 — Inscription Entreprise (étapes 1 et 2)

**Objectif :** Collecter les informations et documents nécessaires à la validation B2B.
**Accès :** Visiteur non connecté.
**Composants fonctionnels :**
- **Étape 1 — Formulaire d'inscription :** nom légal, nom commercial (optionnel), NIF, registre de commerce (optionnel), adresse, téléphone professionnel, email professionnel, nom et fonction du représentant, secteur d'activité, taille (optionnel).
- **Étape 2 — Téléversement de documents :** patente/licence commerciale, NIF, registre de commerce (si applicable), pièce d'identité du représentant.
- Indicateur de progression (étape 1/4 à 4/4, cf. Cahier 4, RG-08-001).
**Données affichées :** Formulaire vierge, puis récapitulatif avant soumission.
**Actions disponibles :** Saisir, téléverser, soumettre le dossier.
**Règles de validation :** Champs obligatoires de l'étape 1 (tous sauf nom commercial, registre de commerce, taille) ; formats de fichiers acceptés pour les documents (PDF/JPG/PNG, taille maximale à définir en Cahier des Données) ; email professionnel au format valide.
**États de l'écran :** Chargement, erreur (champ ou document manquant — UC-08-001 E1), succès (dossier soumis, statut « en attente de vérification »).
**Règles métier appliquées :** RG-08-001.
**Cas d'utilisation liés :** UC-08-001.
**Priorité :** Must have.

---

### ECR-08-002 — Validation compte Entreprise (back-office, étapes 3 et 4)

**Objectif :** Permettre à l'administrateur de vérifier et activer un compte Entreprise.
**Accès :** Administrateur Général (ADM-G).
**Composants fonctionnels :**
- Liste des dossiers Entreprise en attente de vérification.
- Détail du dossier : informations saisies, documents téléversés (visualisation), indicateur de cohérence email/site web.
- Boutons « Approuver », « Rejeter », « Demander des informations complémentaires ».
**Données affichées :** Dossiers Entreprise soumis, tous statuts.
**Actions disponibles :** Examiner, approuver, rejeter, demander un complément (retour à l'étape 2 côté client).
**Règles de validation :** Une décision (Approuver/Rejeter/Compléments) est obligatoire pour clore l'examen d'un dossier.
**États de l'écran :** Vide (aucun dossier en attente), chargement, erreur, succès.
**Règles métier appliquées :** RG-08-001.
**Cas d'utilisation liés :** UC-08-002.
**Priorité :** Must have.

---

### ECR-08-003 — Espace client (tableau de bord et historique)

**Objectif :** Centraliser l'historique et les informations du client.
**Accès :** Client connecté (Particulier ou Entreprise).
**Composants fonctionnels :**
- Historique des commandes (statut, montant, date).
- Historique des devis (BF-04-005, lien vers ECR-04-003).
- Statut du compte (Particulier / Entreprise en attente / B2B vérifié).
- Carnet d'adresses (facturation).
- Liste de favoris.
**Données affichées :** Données propres au client connecté.
**Actions disponibles :** Consulter, modifier ses informations, gérer ses adresses et favoris.
**Règles de validation :** Aucune, hormis format des champs d'adresse.
**États de l'écran :** Vide (nouveau compte sans historique), chargement, erreur, succès.
**Règles métier appliquées :** RG-08-001 (affichage conditionnel selon le statut B2B).
**Cas d'utilisation liés :** UC-08-003 (allégé, section 4), UC-08-004 (allégé, section 4).
**Priorité :** Must have.

---

### ECR-12-001 — Tableau de bord administrateur

**Objectif :** Donner à l'administrateur une vue d'ensemble de l'activité du jour.
**Accès :** Administrateur Général (ADM-G), Agent SAV (ADM-S — vue restreinte).
**Composants fonctionnels :**
- Ventes du jour/mois.
- Devis en attente (nombre, ancienneté).
- Produits en alerte de stock (orange/rouge — RG-03-002).
- Dernières commandes.
- Dossiers Entreprise en attente de vérification.
**Données affichées :** Agrégats temps réel ou quasi temps réel.
**Actions disponibles :** Accéder directement à chaque module concerné (Devis, Catalogue, Clients, Commandes) depuis les widgets.
**Règles de validation :** Aucune.
**États de l'écran :** Chargement, erreur (données indisponibles), succès.
**Règles métier appliquées :** RG-03-002.
**Cas d'utilisation liés :** UC-12-002 (allégé, section 4).
**Priorité :** Must have.

---

### ECR-12-002 — Gestion catalogue (produit, stock, barème B2B)

**Objectif :** Permettre la création et la mise à jour complète d'un produit, y compris son stock de référence et ses paliers de prix B2B.
**Accès :** Administrateur Général (ADM-G).
**Composants fonctionnels :**
- Formulaire produit (description, spécifications, images, prix public, catégorie/marque).
- Champs stock actuel et **stock de référence** (RG-03-002), pré-rempli à 100 unités par défaut (décision actée n°28), modifiable produit par produit.
- Éditeur de paliers de prix B2B : ajout/suppression de lignes `[quantité min–max] → prix unitaire` (RG-03-004).
- Gestion des accessoires compatibles (RG-03-003).
**Données affichées :** Fiche produit en cours d'édition.
**Actions disponibles :** Créer, modifier, publier/dépublier un produit, gérer les paliers.
**Règles de validation :** Détection de chevauchement entre paliers de quantité (UC-12-001, E1) ; stock de référence doit être un entier positif.
**États de l'écran :** Chargement, erreur (conflit de paliers), succès.
**Règles métier appliquées :** RG-03-002, RG-03-003, RG-03-004.
**Cas d'utilisation liés :** UC-12-001.
**Priorité :** Must have.

## 4. Synthèse des écrans complémentaires (traitement allégé)

Ces écrans sont fonctionnellement simples et directement traçables aux besoins et cas d'utilisation déjà détaillés :

| ECR | Nom de l'écran | Acteur | UC associé | Priorité |
|---|---|---|---|---|
| ECR-02-001 | Résultats de recherche | VIS, CLI | UC-02-001 | Must have |
| ECR-08-004 | Favoris | CLI | UC-08-003 | Should have |
| ECR-09-001 | Ouverture / suivi d'un ticket SAV | CLI | UC-09-002 | Should have |
| ECR-09-002 | Planification d'une installation | CLI, ADM | UC-09-001 | Must have |
| ECR-10-001 | Dépôt d'un avis produit | CLI | UC-10-001 | Should have |
| ECR-11-001 | FAQ générale et par catégorie | VIS, CLI | UC-11-001 | Must have |
| ECR-11-002 | Blog | VIS, CLI | UC-11-002 | Could have |
| ECR-11-003 | Contact (formulaire + WhatsApp) | VIS, CLI | UC-11-003 | Must have |
| ECR-11-004 | Mentions légales / CGV / Confidentialité | VIS, CLI | BF-11-004, BF-11-005 | Must have |
| ECR-12-003 | Modération des avis clients | ADM | UC-12-003 | Should have |
| ECR-12-004 | Gestion du contenu (FAQ/blog/légal) | ADM | UC-12-004 | Must have |
| ECR-12-005 | Paramètres généraux (langues, taux de change interne) | ADM | UC-12-005 | Must have |
| ECR-12-006 | Gestion des comptes administrateurs (2 rôles fixes) | ADM-G | UC-12-006 | Should have |
| ECR-15-001 | Statistiques (ventes, conversion des devis) | ADM | UC-15-001 | Should have |

<!-- pagebreak -->

## 5. Risques

| Risque | Impact | Niveau |
|---|---|---|
| ~~Règle de cohérence minimale du configurateur de package non encore validée métier~~ | — | **Résolu** (décision actée n°29) |
| Formats et taille maximale des documents téléversés (ECR-08-001) non encore définis | Risque d'ambiguïté pour le développement du composant de téléversement | Faible |
| Éditeur de paliers de prix B2B (ECR-12-002) : risque d'erreur de saisie côté administrateur si l'interface ne guide pas suffisamment | Prix incohérents affichés en façade | Moyen |

## 6. Hypothèses

- ~~La règle de cohérence minimale du configurateur~~ — **Confirmée** : au moins un panneau et une batterie sont requis pour valider une demande de devis (décision actée n°29).
- ~~Les formats et tailles de fichiers acceptés pour les documents Entreprise~~ — **Confirmés** : PDF/JPG/PNG, 5 Mo maximum par fichier (décision actée n°30).
- L'hypothèse relative au stock de référence est désormais résolue (100 unités par défaut, décision actée n°28) et n'est plus reproduite ici.

## 7. Décisions actées

Reprises à l'identique du Cahier des Règles Métiers (section 7), sans modification. Voir Cahier 4 pour la table complète des 39 décisions.

## 8. Questions restantes

Toutes les questions et hypothèses de ce cahier sont désormais résolues (voir section 6) : règle de cohérence du configurateur et formats de documents Entreprise sont actés (décisions n°29 et n°30).

## 9. Traçabilité et documents liés

Chaque écran `ECR-XX-NNN` référence les cas d'utilisation (`UC-XX-NNN`, Cahier 5) et règles de gestion (`RG-XX-NNN`, Cahier 4) qu'il met en œuvre. Ces écrans seront directement repris :

- Dans le **Cahier UX/UI (Cahier 7)**, pour la conception visuelle, la disposition, les micro-interactions et l'accessibilité de chaque écran.
- Dans le **Cahier d'Architecture Logicielle (Cahier 8)**, pour le découpage en composants techniques et API.
- Dans le **Cahier des Données (Cahier 9)**, pour la modélisation des champs (stock de référence, paliers de prix, documents Entreprise).
- Dans le **Cahier des Tests (Cahier 12)**, pour la couverture de test de chaque écran et de ses états.

## 10. Conclusion

Ce cahier détaille **16 écrans majeurs** avec leurs composants, données, actions et règles de validation, et recense **14 écrans complémentaires** à traitement allégé. Il constitue la base directe du Cahier UX/UI, en séparant clairement le « quoi » (ce cahier) du « comment visuel » (Cahier 7).

Deux précisions mineures (règle de cohérence du configurateur, formats de documents) sont à trancher au Cahier des Données, sans bloquer la poursuite immédiate de la rédaction du **Cahier UX/UI (Cahier 7)**.

---

*Fin du Cahier des Spécifications Fonctionnelles Détaillées — Document 6/15*
