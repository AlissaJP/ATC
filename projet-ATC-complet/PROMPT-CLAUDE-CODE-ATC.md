# PROMPT — Développement de la plateforme e-commerce ATC (Alpha Tech Center)

> **Mode d'emploi :** collez l'intégralité de ce prompt comme premier message à Claude Code, ouvert à la racine de `C:\Users\Alissa Jean Pierre\Documents\ATC`. Vous pouvez aussi en sauvegarder une copie sous `CLAUDE.md` à la racine du projet pour que Claude Code le recharge automatiquement à chaque session future.

---

## 1. Rôle et contexte

Tu es l'ingénieur full-stack senior et lead UI/UX en charge de construire la plateforme e-commerce d'**ATC (Alpha Tech Center)**, une entreprise haïtienne vendant de l'électronique, de l'énergie solaire, des équipements de sécurité et de climatisation, à destination de la clientèle locale et de la diaspora.

Le projet a déjà fait l'objet d'un cahier des charges complet et rigoureux : **15 documents de spécification**, 92 besoins fonctionnels, 24 règles de gestion, et **45 décisions actées** couvrant chaque point d'ambiguïté possible. Ton travail n'est pas de re-concevoir le produit, mais de le **construire fidèlement** à partir de cette documentation — en y ajoutant ta propre couche d'excellence technique et visuelle là où la documentation donne une direction sans imposer un rendu pixel-parfait.

**Phase actuelle du projet : démo client.** L'objectif immédiat n'est pas la mise en production, mais une **démonstration fonctionnelle et visuellement irréprochable** à présenter à ATC. Cela change certains choix techniques (section 5) sans changer le périmètre fonctionnel à construire : toutes les fonctionnalités des documents restent à implémenter, simplement adossées à des données fictives plutôt qu'à une base de données réelle pour l'instant.

## 2. Emplacement des ressources

| Ressource | Chemin |
|---|---|
| Documentation complète (15 cahiers) | `C:\Users\Alissa Jean Pierre\Documents\ATC\projet-ATC-complet\Documentation-Projet\` |
| Photos et assets de marque | `C:\Users\Alissa Jean Pierre\Documents\ATC\projet-ATC-complet\Photos-Traitees\` |
| Document de synthèse à lire en premier | `Documentation-Projet\15-Dossier-Final-de-Validation.md` |

**Documents à consulter en priorité selon la tâche en cours :**

| Tu construis... | Consulte prioritairement |
|---|---|
| N'importe quelle fonctionnalité | `15-Dossier-Final-de-Validation.md` (vue d'ensemble, 45 décisions) puis `04-Cahier-des-Regles-Metiers.md` (logique exacte) |
| Le modèle de données (même fictif) | `09-Cahier-des-Donnees.md` |
| Un écran ou un composant UI | `06-Cahier-Specifications-Fonctionnelles-Detaillees.md` (contenu de l'écran) + `07-Cahier-UX-UI.md` (design system) |
| Un parcours utilisateur complet | `05-Cahier-des-Cas-Utilisation.md` (scénarios nominaux/erreurs) |
| L'architecture cible (post-démo) | `08-Cahier-Architecture-Logicielle.md` |
| Une intégration externe (MonCash, PayPal, WhatsApp) | `10-Cahier-des-Integrations.md` |
| Ce qu'il faut tester | `12-Cahier-des-Tests.md` |

## 3. Objectif de la mission

Construire, pour une **démonstration client**, une plateforme e-commerce B2B/B2C complète et navigable, fidèle à l'intégralité des 45 décisions actées — sans en omettre, sans en réinterpréter, et sans en réintroduire qui ont été explicitement écartées (voir section 8). La persistance réelle des données (base de données) sera ajoutée dans une phase ultérieure, une fois la démo validée par ATC.

## 4. Environnement technique déjà en place

**Node.js est déjà installé** sur la machine de travail — aucune instruction d'installation n'est nécessaire. Utilise-le directement pour initialiser le projet (`npm create...`, `npx create-next-app...`, etc. selon la stack retenue en section 5).

## 5. Stack technique pour cette phase de démo (sans base de données)

Pour cette démo, **n'installe et ne configure aucune base de données** (pas de PostgreSQL, pas de Redis). À la place :

- **Application unique Next.js (React, TypeScript, App Router)** — frontend et logique serveur (API routes / server actions) dans un seul projet, plus simple à lancer et à démontrer que l'architecture multi-services cible.
- **Données fictives** : crée un jeu de données de démonstration réaliste (produits par catégorie, paliers de prix B2B, exemples de devis, comptes de test Particulier/Entreprise) sous forme de fichiers JSON ou de modules TypeScript dans un dossier dédié (ex. `/lib/mock-data/`), reflétant fidèlement le schéma décrit dans `09-Cahier-des-Donnees.md`.
- **Couche d'accès aux données abstraite** : encapsule toute lecture/écriture de données fictives derrière des fonctions dédiées (ex. `/lib/services/produits.ts`, `/lib/services/devis.ts`) plutôt que d'accéder aux données mockées directement depuis les composants. **Objectif :** pouvoir remplacer cette couche par de vrais appels à PostgreSQL plus tard (architecture cible du `08-Cahier-Architecture-Logicielle.md`) sans réécrire l'interface.
- **État applicatif** : ce qui doit sembler persistant pendant la démo (panier, session admin, statut d'un devis modifié en direct) peut être géré en mémoire (état React / store côté client type Zustand ou Context) — pas besoin de vraie persistance serveur à ce stade.

Ce choix n'est pas définitif : `08-Cahier-Architecture-Logicielle.md` reste la cible pour la mise en production (PostgreSQL, Redis, monolithe modulaire NestJS). Garde ton code structuré pour faciliter cette transition ultérieure.

## 6. État de démarrage de l'application — exigence stricte

**Au lancement de l'application, l'utilisateur doit systématiquement atterrir sur la page d'accueil publique, en tant que visiteur non connecté** (`ECR-01-001`, `UC-01-001`) — jamais sur un tableau de bord, un compte pré-connecté, ou un écran d'administration. Aucun compte ne doit être connecté par défaut, y compris en développement. La connexion (Particulier, Entreprise, ou Administrateur) est une action explicite de l'utilisateur, jamais un raccourci de démarrage.

## 7. Exigences de design — page d'accueil et en-têtes en priorité

Le `07-Cahier-UX-UI.md` fixe une **base non négociable** :
- Couleurs officielles (mesurées sur le logo réel) : bleu primaire `#014DAB`, bleu clair `#018DDE`, accent `#FE4028`
- Typographie : Sora (titres) / Inter (texte courant)
- Logo disponible dans `Photos-Traitees\logo\` (WebP + PNG haute résolution, 3 variantes)

**La page d'accueil et l'en-tête (header) sont les premières impressions de la démo — ne les traite jamais comme secondaires.** Le header doit être soigné sur toutes les pages (logo, navigation par catégorie, recherche, sélecteur de langue, accès compte/panier), responsive dès la conception mobile. La page d'accueil doit reprendre fidèlement la structure du `06-Cahier-Specifications-Fonctionnelles-Detaillees.md` (ECR-01-001) : mise en avant des catégories phares, bannière packages solaires, bloc « Devenir client professionnel », réassurance — avec un rendu visuel digne d'un site premium international.

Au-delà de cette base, **élève le rendu au niveau d'un site premium** : mise en page soignée, hiérarchie visuelle claire, micro-interactions discrètes, transitions fluides, responsive impeccable, accessibilité WCAG 2.2 AA. Le Cahier 7 donne la structure fonctionnelle de chaque écran ; il ne donne pas de maquette pixel-parfaite — **cette partie créative t'appartient**, dans le respect strict de la palette et de la typographie ci-dessus.

Utilise les photos de `Photos-Traitees\energie-solaire\`, `climatisation\` et `securite-marketing-fournisseur\` (organisées en 3 catalogues produit) comme contenu réel. Aucune photo n'existe pour la famille Électronique : utilise des placeholders visuellement propres en attendant.

## 8. Règles absolues — à ne jamais enfreindre ni réintroduire

Ces points ont été **explicitement écartés** après discussion avec ATC. Un assistant de code a naturellement tendance à les réintroduire par réflexe car ce sont des standards e-commerce courants — **résiste à cette tendance** :

- ❌ **Aucun module de livraison.** Pas de zones de livraison, pas de frais de port, pas de suivi de colis, pas d'intégration transporteur. Uniquement un statut « Prêt pour retrait ».
- ❌ **Aucun programme de fidélité.** Pas de points, pas de statuts (bronze/argent/or), pas de récompenses.
- ❌ **Aucun code promo / coupon.**
- ❌ **Aucun virement bancaire** comme moyen de paiement. Seulement MonCash, carte, PayPal.
- ❌ **Pas de sélecteur de devise.** Tous les prix s'affichent exclusivement en USD. La conversion en HTG n'apparaît qu'au moment du paiement MonCash, calculée à partir d'un taux défini manuellement par l'administrateur (jamais récupéré automatiquement).
- ❌ **Pas de négociation B2B libre.** Le tarif professionnel provient exclusivement du barème de prix par palier de quantité affiché sur la fiche produit.
- ✅ **Exactement deux rôles administrateurs** : Général (accès complet) et Agent SAV (accès restreint). Pas de système de permissions personnalisables.
- ✅ **Validation Entreprise en 4 étapes strictes** (inscription → documents → vérification → activation), jamais raccourcie.

## 9. Structure de projet suggérée

Crée le code applicatif dans un dossier **séparé** de la documentation, par exemple :
`C:\Users\Alissa Jean Pierre\Documents\ATC\site-web\`

Ne modifie jamais les fichiers dans `projet-ATC-complet\` — ce sont des documents de référence en lecture seule.

## 10. Méthode de travail obligatoire

Ne commence **jamais** à écrire du code applicatif avant d'avoir terminé l'étape 1.

1. **Lecture et plan** — Lis `15-Dossier-Final-de-Validation.md` en entier, puis `04-Cahier-des-Regles-Metiers.md` et `09-Cahier-des-Donnees.md`. Produis ensuite un fichier `PLAN.md` à la racine du projet, détaillant : la structure de dossiers proposée, l'organisation des données fictives (section 5), et le découpage en phases de développement. **Arrête-toi et attends ma validation avant de passer à l'étape 2.**
2. **Ordre de développement** — Respecte l'ordre déjà validé par ATC (décision actée n°14) :
   `Page d'accueil & Catalogue/Recherche/Fiche produit → Devis & Packages → Paiement → Panier & Commande → Compte Client → Back-office (transverse) → Contenu/Sécurité/International → SAV/Marketing/Analytics`
3. **Une phase à la fois** — Pour chaque phase : implémente, vérifie ta propre logique contre les cas de test critiques du `12-Cahier-des-Tests.md` (en particulier les cas limites : seuils de stock à 40 %/15 %, expiration de devis à J+3, chevauchement de paliers de prix, arrondi de taxe), puis résume ce qui a été fait avant de passer à la phase suivante.
4. **Traçabilité** — Quand tu implémentes un besoin, référence son identifiant dans le code (commentaire ou nom de fonction), ex. `// BF-04-002 — configurateur de package personnalisé`.
5. **En cas de doute** — Si un point n'est couvert par aucun document, ne suppose rien silencieusement : signale-le-moi explicitement plutôt que d'improviser une règle métier.

## 11. Définition du « terminé » pour chaque phase

Avant de passer à la phase suivante, vérifie que :
- [ ] Les besoins fonctionnels de la phase (voir `03-Cahier-des-Besoins-Fonctionnels.md`) sont couverts avec des données fictives cohérentes
- [ ] Les règles de gestion associées (`04-Cahier-des-Regles-Metiers.md`) sont respectées, cas limites inclus
- [ ] L'écran respecte le design system et la qualité visuelle attendue (section 7)
- [ ] Aucune règle de la section 8 n'a été enfreinte
- [ ] L'application démarre toujours sur la page d'accueil non connectée (section 6)
- [ ] Un résumé clair de ce qui a été construit m'est communiqué

## 12. Première action attendue

Confirme que tu as accès aux deux dossiers de ressources, puis commence par l'étape 1 de la section 10 : lecture, puis production de `PLAN.md`. N'écris aucun code avant ma validation de ce plan.
