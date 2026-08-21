# GUIDE ADMINISTRATEUR

## Plateforme E-commerce B2B/B2C — Électronique & Énergie Solaire (ATC — Alpha Tech Center)

---

### Page de garde

| | |
|---|---|
| **Projet** | Plateforme e-commerce Électronique, Énergie Solaire, Sécurité & Climatisation |
| **Client** | ATC (Alpha Tech Center) |
| **Type de document** | Guide Administrateur (Document 13/15) |
| **Version** | 1.1 |
| **Date** | 01/08/2026 |
| **Statut** | Version finale — validée, plus aucun point bloquant hormis Q2 |
| **Documents parents** | Besoins Fonctionnels (Doc. 3/15), Règles Métiers (Doc. 4/15), Spécifications Détaillées (Doc. 6/15), UX/UI (Doc. 7/15) |
| **Public visé** | Administrateur Général, Agent SAV/Support |
| **Confidentialité** | Document interne — usage ATC uniquement |

---

### Historique des versions

| Version | Date | Auteur | Description |
|---|---|---|---|
| 0.1 | 01/08/2026 | Rédacteur Technique (IA) | Rédaction initiale du guide, organisé par onglet du back-office |
| 1.0 | 01/08/2026 | Rédacteur Technique (IA) | Version finale après auto-évaluation et intégration des améliorations |
| 1.1 | 01/08/2026 | Rédacteur Technique (IA) | Mise à jour suite à la résolution de H1-H5 et Q3-Q7 (décisions n°29 à 38) |

---

### Sommaire

1. Introduction
2. Prise en main
3. Tableau de bord
4. Gestion du catalogue (produits, stock, barème B2B)
5. Gestion des packages
6. Traitement des devis
7. Suivi des commandes et du retrait
8. Gestion des comptes clients et validation Entreprise
9. Suivi des paiements et factures
10. SAV et installation
11. Gestion du contenu
12. Modération des avis clients
13. Statistiques
14. Comptes administrateurs et permissions
15. Paramètres généraux
16. Bonnes pratiques et sécurité
17. Questions fréquentes / Dépannage
18. Glossaire
19. Risques documentaires
20. Hypothèses
21. Décisions actées
22. Questions restantes
23. Traçabilité et documents liés
24. Conclusion

<!-- pagebreak -->

## 1. Introduction

Ce guide explique, étape par étape, comment utiliser le back-office de la plateforme ATC. Il s'adresse à deux profils :

| Rôle | Accès |
|---|---|
| **Administrateur Général** | Accès complet à tous les modules |
| **Agent SAV/Support** | Accès aux modules Devis, Commandes, Clients, Assistance/SAV — pas d'accès à la gestion des prix ni aux Paramètres généraux (décision actée n°20) |

Chaque section ci-dessous précise quel(s) rôle(s) y ont accès. Ce guide sera enrichi de captures d'écran réelles une fois l'interface développée ; en attendant, chaque écran est décrit textuellement, conformément aux spécifications du Cahier 6.

## 2. Prise en main

**Connexion :** rendez-vous sur l'adresse du back-office fournie par l'équipe technique, saisissez votre email professionnel et votre mot de passe.

**Après connexion**, vous arrivez directement sur le **Tableau de bord** (section 3), qui vous donne une vue d'ensemble de l'activité du jour.

**Déconnexion :** pensez à toujours vous déconnecter si vous utilisez un poste partagé, en particulier lorsque vous consultez des documents sensibles (dossiers Entreprise, section 8).

## 3. Tableau de bord

**Accès :** Administrateur Général, Agent SAV (vue adaptée à ses permissions)

Le tableau de bord affiche en un coup d'œil :
- Les ventes du jour et du mois.
- Le nombre de devis en attente de réponse.
- Les produits en alerte de stock (orange = à surveiller, rouge = à réapprovisionner en urgence).
- Les dernières commandes.
- Les dossiers Entreprise en attente de vérification.

**Astuce :** cliquez sur n'importe quel widget pour accéder directement au module concerné (ex. cliquer sur « 5 devis en attente » vous amène directement à la liste filtrée dans l'onglet Devis).

<!-- pagebreak -->

## 4. Gestion du catalogue (produits, stock, barème B2B)

**Accès :** Administrateur Général uniquement

### 4.1 Créer ou modifier un produit

1. Ouvrez l'onglet **Catalogue**.
2. Cliquez sur « Nouveau produit » (ou sélectionnez un produit existant pour le modifier).
3. Renseignez : nom, description, catégorie, marque, spécifications techniques, images, prix public.
4. Renseignez le **stock actuel** et le **stock de référence** (ce dernier sert à calculer le pourcentage d'alerte — voir encadré ci-dessous).
5. Cochez « Éligible B2B » si le produit doit disposer d'un barème de prix par palier.
6. Cochez « Éligible package personnalisé » si le produit doit apparaître dans le configurateur solaire.
7. Enregistrez.

> **Note sur le stock de référence :** par défaut, ce champ est pré-rempli à **100 unités** (valeur de travail — décision actée n°28). Ajustez-le produit par produit selon vos volumes réels : un produit dont vous stockez habituellement 10 unités devrait avoir un stock de référence proche de 10, pas 100, pour que les alertes soient pertinentes.

**Calcul de l'alerte de stock (automatique, pas d'action requise) :**
- Stock ≤ 15 % du stock de référence → alerte rouge.
- Stock entre 15 % et 40 % → alerte orange.
- Stock > 40 % → aucune alerte.
- Stock à 0 → rupture, achat direct désactivé automatiquement.

### 4.2 Définir un barème de prix B2B par palier

1. Depuis la fiche du produit, ouvrez l'onglet « Barème B2B ».
2. Cliquez sur « Ajouter un palier ».
3. Renseignez la plage de quantité (ex. 1-9) et le prix unitaire correspondant.
4. Répétez pour chaque palier souhaité (ex. 10-49, 50+).

> **Attention :** le système refuse l'enregistrement si deux paliers se chevauchent (ex. 1-10 et 5-20). Vérifiez que chaque plage de quantité est distincte avant d'enregistrer.

### 4.3 Gérer les accessoires compatibles

Depuis la fiche produit, section « Produits associés », ajoutez manuellement les accessoires compatibles (ex. régulateur compatible avec tel panneau). Cette association est manuelle : le système ne la déduit pas automatiquement des spécifications techniques.

## 5. Gestion des packages

**Accès :** Administrateur Général uniquement

**Packages pré-configurés :** depuis l'onglet Packages, créez un package en sélectionnant les produits qui le composent et son prix global. Il sera immédiatement achetable en ligne, sans devis.

**Packages personnalisés :** ces packages sont composés par les clients eux-mêmes via le configurateur (section 6) ; vous n'avez rien à créer en amont pour cette voie.

<!-- pagebreak -->

## 6. Traitement des devis

**Accès :** Administrateur Général, Agent SAV

### 6.1 Répondre à une demande de devis

1. Ouvrez l'onglet **Devis**, filtré par défaut sur « En attente », trié par ancienneté.
2. Sélectionnez une demande pour voir son détail (produits, quantités, client).
3. Le système calcule automatiquement le prix total à partir des barèmes de chaque composant — vous n'avez pas à le calculer manuellement.
4. Si le devis concerne un système solaire, ajoutez le coût du service d'installation interne dans le champ dédié.
5. Cliquez sur « Envoyer la réponse au client ».

> **Important :** dès l'envoi, le client dispose de **3 jours** pour accepter (décision actée n°22). Passé ce délai, le devis expire automatiquement et le client devra en redemander un.

### 6.2 Convertir un devis accepté en commande

Une fois le client passé au statut « Accepté » de son côté, ouvrez le devis et cliquez sur « Convertir en commande ». Le prix est alors figé et ne peut plus être modifié sans une nouvelle validation.

## 7. Suivi des commandes et du retrait

**Accès :** Administrateur Général, Agent SAV

L'onglet **Commandes** liste toutes les commandes avec leur statut : *En préparation → Prête pour retrait → Retirée*.

**Rappel important :** ATC ne propose aucun service de livraison (décision actée n°27). Une fois la commande prête, marquez-la « Prête pour retrait » — le client reçoit alors automatiquement une notification avec les modalités de récupération. Lorsqu'il se présente, marquez la commande comme « Retirée ».

## 8. Gestion des comptes clients et validation Entreprise

**Accès :** Administrateur Général, Agent SAV

### 8.1 Consulter les comptes

L'onglet **Clients** liste tous les comptes, avec un filtre par type (Particulier/Entreprise) et par statut de validation.

### 8.2 Valider un compte Entreprise (les 4 étapes)

Un client Entreprise passe par 4 étapes avant d'accéder aux tarifs professionnels ; les 2 premières sont réalisées par le client lui-même, les 2 suivantes par vous :

1. *(Côté client)* Inscription : informations légales de l'entreprise.
2. *(Côté client)* Documents : patente, NIF, registre de commerce, pièce d'identité du représentant.
3. **Vérification (votre action) :** ouvrez le dossier depuis l'onglet Clients, consultez les informations et les documents (aperçu intégré, pas besoin de les télécharger un par un), vérifiez la cohérence de l'email professionnel.
4. **Décision (votre action) :** cliquez sur **Approuver**, **Rejeter**, ou **Demander des informations complémentaires**.

> Si vous approuvez, le compte passe immédiatement au statut « B2B vérifié » et le client accède aux barèmes de prix, aux devis et à la facturation pro forma. Si vous demandez un complément, le dossier retourne à l'étape 2 côté client.

**Traitez les dossiers par ordre d'ancienneté** : le tableau de bord signale les dossiers en attente depuis plus de 48 heures.

<!-- pagebreak -->

## 9. Suivi des paiements et factures

**Accès :** Administrateur Général

L'onglet **Paiements** liste toutes les transactions par méthode (MonCash, Carte, PayPal), avec leur statut. Les factures pro forma générées automatiquement (incluant la taxe de 10 %) sont consultables et retéléchargeables depuis cet onglet si un client en fait la demande.

## 10. SAV et installation

**Accès :** Administrateur Général, Agent SAV

**Tickets SAV :** depuis l'onglet Assistance/SAV, consultez et répondez aux réclamations des clients.

**Planification d'installation :** pour les systèmes solaires vendus (packages ou devis personnalisés), planifiez une date d'intervention avec le client depuis le même onglet. Rappel : cette prestation est réalisée en interne par l'équipe ATC (décision actée n°5), pas de sous-traitance.

## 11. Gestion du contenu

**Accès :** Administrateur Général

Depuis l'onglet **Contenu**, mettez à jour la FAQ (générale et par catégorie), le blog, ainsi que les mentions légales, CGV et politique de confidentialité.

## 12. Modération des avis clients

**Accès :** Administrateur Général

Les avis déposés par les clients apparaissent en attente de modération. Consultez chaque avis et choisissez de le publier ou de le rejeter avant qu'il ne soit visible publiquement sur la fiche produit.

## 13. Statistiques

**Accès :** Administrateur Général

Consultez les ventes par catégorie et le taux de transformation des devis en commandes, utiles pour piloter l'activité commerciale.

## 14. Comptes administrateurs et permissions

**Accès :** Administrateur Général uniquement

Créez ou modifiez les comptes de vos collaborateurs administrateurs. Rappel : seuls deux rôles existent — **Général** (accès complet) et **Agent SAV** (accès restreint) — il n'est pas possible de créer un rôle personnalisé (décision actée n°20).

## 15. Paramètres généraux

**Accès :** Administrateur Général uniquement

- **Langues actives :** activez/désactivez le français, l'anglais, l'espagnol.
- **Taux de change HTG/USD :** ce taux est saisi manuellement par vos soins et sert à convertir automatiquement les paiements MonCash. Il n'est **jamais récupéré automatiquement** depuis une source externe (décision actée n°24) — pensez à le mettre à jour régulièrement selon votre politique commerciale.
- **Textes légaux et notifications :** configuration générale.

> **Vigilance :** un taux de change non mis à jour peut désavantager vos clients payant en MonCash ou réduire vos marges. Vérifiez-le à une fréquence régulière que vous définirez en interne.

## 16. Bonnes pratiques et sécurité

- Ne partagez jamais votre mot de passe, même entre collègues administrateurs.
- Les documents Entreprise (pièces d'identité, NIF) sont des données sensibles : ne les téléchargez sur un poste personnel que si nécessaire, et supprimez-les après usage.
- Vérifiez toujours qu'un devis répondu correspond bien au barème affiché avant envoi.
- En cas de doute sur une transaction suspecte, contactez l'équipe technique avant toute action.

## 17. Questions fréquentes / Dépannage

**« Le barème B2B ne s'affiche pas pour un client Entreprise. »** → Vérifiez que son compte est bien au statut « B2B vérifié » (section 8.2) et que le produit est bien coché « Éligible B2B » (section 4.1).

**« Un devis a expiré alors que le client n'a pas eu le temps de répondre. »** → Le délai de 3 jours est fixe (décision actée n°22) ; invitez le client à soumettre une nouvelle demande.

**« Je ne trouve pas l'option de configuration de la livraison. »** → C'est normal : ATC ne propose aucun service de livraison (décision actée n°27), seule l'option de retrait existe.

## 18. Glossaire

| Terme | Définition |
|---|---|
| Barème B2B | Grille de prix par palier de quantité, propre aux comptes Entreprise vérifiés |
| Stock de référence | Quantité de référence utilisée pour calculer le pourcentage d'alerte de stock |
| B2B vérifié | Statut d'un compte Entreprise ayant passé avec succès les 4 étapes de validation |
| Devis expiré | Devis répondu non accepté par le client dans le délai de 3 jours |

<!-- pagebreak -->

## 19. Risques documentaires

| Risque | Impact | Niveau |
|---|---|---|
| Ce guide décrit des écrans non encore développés ; des écarts sont possibles une fois l'interface réelle livrée | Guide à mettre à jour après développement | Moyen |
| Les durées de garantie mentionnées (12/24 mois) restent des valeurs de travail en attendant les durées définitives d'ATC | Section 4.1 et section SAV à corriger en conséquence | Faible |

## 20. Hypothèses

Ce guide suppose que l'interface finale respectera fidèlement les spécifications des Cahiers 6 et 7. Toute divergence lors du développement devra être répercutée dans une version mise à jour de ce guide.

## 21. Décisions actées

Reprises à l'identique du Cahier des Règles Métiers, sans modification. Voir Cahier 4 pour la table complète des 39 décisions.

## 22. Questions restantes

Aucune question bloquante ne subsiste : H1 à H5 et Q3 à Q7 sont désormais résolues (décisions actées n°29 à 38 — choix du PSP laissé à l'équipe technique, développement confié à un prestataire déjà identifié, conservation indéfinie des documents et des comptes, intégration WhatsApp directe avec Meta). Seule la réception des fichiers de marque ATC (Q2) reste en attente, sans impact sur ce guide.

## 23. Traçabilité et documents liés

Ce guide s'appuie sur les écrans du **Cahier des Spécifications Fonctionnelles Détaillées (Cahier 6)** et du **Cahier UX/UI (Cahier 7)**. Il devra être mis à jour avec des captures d'écran réelles une fois le développement achevé, avant la mise en production.

## 24. Conclusion

Ce guide couvre les 14 modules du back-office ATC, avec des instructions pas-à-pas adaptées aux deux rôles administrateurs. Il met un accent particulier sur les processus les plus spécifiques au projet : gestion du barème B2B par palier, validation d'un compte Entreprise en 4 étapes, cycle de vie du devis avec expiration à 3 jours, et gestion du retrait en l'absence de tout service de livraison.

La rédaction peut se poursuivre avec le **Guide Utilisateur (Cahier 14)**, destiné cette fois aux clients Particuliers et Entreprise.

---

*Fin du Guide Administrateur — Document 13/15*
