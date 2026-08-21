# PLAN.md — Plateforme e-commerce ATC (démo client)

Document produit à l'issue de l'étape 1 (section 10 du prompt de mission), après lecture intégrale de `15-Dossier-Final-de-Validation.md`, `04-Cahier-des-Regles-Metiers.md` et `09-Cahier-des-Donnees.md`.

**Aucun code n'a été écrit. Ce plan attend validation avant de démarrer la phase de développement.**

---

## 1. Confirmation d'accès aux ressources

- `projet-ATC-complet\Documentation-Projet\` — 15 cahiers présents et lus (priorité : 15, 04, 09 ; 06 et 07 consultés en complément pour les écrans prioritaires).
- `projet-ATC-complet\Photos-Traitees\` — 4 dossiers : `logo\` (3 variantes), `energie-solaire\` (17 photos), `climatisation\` (9 photos), `securite-marketing-fournisseur\` (3 catalogues produit avec sous-dossiers dimensions/mise en situation/caractéristiques/produit isolé/emballage). Aucune photo Électronique — placeholders prévus.

## 2. Stack retenue (rappel section 5 du prompt)

- **Next.js 14+ (App Router, React, TypeScript)** — application unique, pas de backend séparé.
- **Tailwind CSS** configuré avec les tokens exacts du Cahier 7 (couleurs, espacement en base 8, typographie) plutôt qu'une bibliothèque de composants tierce, pour un contrôle pixel fidèle à la palette officielle.
- **next/font** pour Sora (600/700) et Inter (400/500), fallback système, `font-display: swap`.
- **Zustand** pour l'état client éphémère (panier, session simulée, langue).
- **Lucide** pour l'iconographie (recommandation Cahier 7, style trait fin cohérent).
- **i18n minimal maison** (FR par défaut, EN/ES — RG-14-001) : fichiers de traduction JSON + un hook de contexte, sans dépendance lourde puisque le périmètre est fini.
- Pas de base de données, pas de Redis. Pas d'authentification réelle : session simulée en mémoire (Zustand + éventuellement cookies non sécurisés pour persister le choix de rôle pendant la démo), jamais pré-connectée au démarrage.

## 3. Structure de dossiers proposée

Code applicatif dans un dossier séparé de la documentation, comme suggéré section 9 :

```
C:\Users\Alissa Jean Pierre\Documents\ATC\site-web\
│
├── app/
│   ├── layout.tsx                      # Layout racine : fonts, providers (panier, session, langue)
│   ├── globals.css                     # Tokens Tailwind (couleurs, espacements Cahier 7)
│   ├── page.tsx                        # ECR-01-001 — Accueil
│   ├── (catalogue)/
│   │   ├── categorie/[slug]/page.tsx   # ECR-01-002 — Liste produits par catégorie
│   │   ├── recherche/page.tsx          # Recherche + suggestions
│   │   └── produit/[slug]/page.tsx     # ECR-03-001 — Fiche produit + barème B2B
│   ├── packages/
│   │   ├── page.tsx                    # ECR-04-001 — Packages pré-configurés
│   │   └── configurateur/page.tsx      # ECR-04-002 — Configurateur personnalisé
│   ├── devis/page.tsx                  # ECR-04-003 — Suivi de devis (espace client)
│   ├── panier/page.tsx                 # ECR-05-001
│   ├── commande/[id]/page.tsx          # ECR-05-002 — Confirmation & statut retrait
│   ├── paiement/page.tsx               # ECR-06-001
│   ├── facture/[id]/page.tsx           # ECR-06-002 — Facture pro forma
│   ├── compte/
│   │   ├── connexion/page.tsx
│   │   ├── inscription/page.tsx        # Choix Particulier / Entreprise
│   │   ├── inscription-entreprise/page.tsx  # ECR-08-001 — étapes 1 et 2 (stepper)
│   │   ├── tableau-de-bord/page.tsx    # Espace client (commandes, devis, favoris)
│   │   └── profil/page.tsx
│   ├── sav/page.tsx                    # Tickets SAV client
│   ├── admin/
│   │   ├── layout.tsx                  # Layout back-office (sidebar, garde de rôle)
│   │   ├── page.tsx                    # ECR-12-001 — Tableau de bord admin
│   │   ├── produits/                   # Catalogue, stock, paliers B2B
│   │   ├── devis/page.tsx              # ECR-04-004 — Traitement des devis
│   │   ├── commandes/page.tsx
│   │   ├── clients/page.tsx
│   │   ├── entreprises/page.tsx        # ECR-08-002 — Validation compte Entreprise
│   │   ├── sav/page.tsx
│   │   ├── avis/page.tsx               # Modération avis (RG-12-002)
│   │   └── parametres/page.tsx         # Taux de change, langues actives (RG-06-003)
│   └── (contenu)/
│       ├── a-propos/page.tsx
│       ├── cgv/page.tsx
│       └── confidentialite/page.tsx
│
├── components/
│   ├── ui/                             # Bouton, Badge, Modale, Toast, Onglets, Tableau, ÉtatVide, Squelette, Stepper, ÉtiquetteStatut
│   ├── layout/                         # Header, Footer, NavCategories, DrawerMobile, SélecteurLangue
│   ├── product/                        # CarteProduit, GalerieImages, TableauBaremeB2B, BadgeStock
│   ├── devis/                          # CarteComposant, RécapitulatifFixe, CarteDevis
│   └── admin/                          # SidebarAdmin, TableauDonnées, GardeRole
│
├── lib/
│   ├── types/
│   │   └── entities.ts                 # Types miroir du Cahier 9 (17 entités, noms de champs fidèles)
│   ├── mock-data/                      # Données fictives statiques (Cahier 9 + décision n°42)
│   │   ├── categories.ts
│   │   ├── produits.ts
│   │   ├── stock.ts
│   │   ├── paliers-prix-b2b.ts
│   │   ├── packages-preconfigures.ts
│   │   ├── garanties.ts                # RG-09-001 : 12/24/12/12 mois
│   │   ├── utilisateurs.ts             # Comptes de test Particulier + Entreprise (statuts variés) + Admin
│   │   ├── profils-entreprise.ts
│   │   ├── devis.ts
│   │   ├── commandes.ts
│   │   ├── avis.ts
│   │   └── parametres-generaux.ts      # Taux de change manuel (RG-06-003)
│   ├── services/                       # Couche d'abstraction (signatures async, remplaçable par PostgreSQL)
│   │   ├── produits.ts
│   │   ├── stock.ts
│   │   ├── devis.ts
│   │   ├── commandes.ts
│   │   ├── paiement.ts
│   │   ├── utilisateurs.ts
│   │   ├── entreprise.ts
│   │   ├── avis.ts
│   │   └── parametres.ts
│   ├── business-rules/                 # Fonctions pures, testables isolément — 1 fichier par RG complexe
│   │   ├── stock-alerte.ts             # RG-03-002 (seuils 15 %/40 %)
│   │   ├── bareme-b2b.ts               # RG-03-004 (palier applicable, non-chevauchement)
│   │   ├── devis-prix.ts               # RG-04-003
│   │   ├── devis-expiration.ts         # RG-04-005 (cas limite J+3 exact)
│   │   ├── configurateur-coherence.ts  # RG-04-006 (≥ 1 panneau + 1 batterie)
│   │   ├── taxe.ts                     # RG-06-002 (10 %, arrondi centime)
│   │   └── change-htg.ts               # RG-06-003/004
│   ├── store/                          # Zustand : panier, session simulée, langue
│   ├── i18n/                           # fr.json, en.json, es.json + hook useTranslation
│   └── constants/                      # Tokens design (si besoin hors Tailwind config), routes nommées
│
├── public/
│   ├── images/
│   │   ├── energie-solaire/            # Copié/optimisé depuis Photos-Traitees
│   │   ├── climatisation/
│   │   ├── securite/                   # Réorganisé par produit (sonnette, PTZ standard, PTZ solaire)
│   │   ├── electronique/               # Placeholders propres (aucune photo réelle)
│   │   └── logo/
│   └── favicon...
│
├── tests/
│   └── business-rules/                 # Tests unitaires ciblant les cas limites du Cahier 12
│       ├── stock-alerte.test.ts        # 0 %, 15 % exact, 40 % exact, >40 %
│       ├── devis-expiration.test.ts    # J+3 exact = valide, J+3+1s = expiré
│       ├── bareme-b2b.test.ts          # Chevauchement de paliers, quantité hors bornes
│       └── taxe.test.ts                # Arrondi centime standard
│
├── tailwind.config.ts
├── next.config.ts
├── package.json
└── tsconfig.json
```

**Note de traçabilité (section 10.4) :** chaque fonction de service/règle métier référencera l'identifiant `BF-XX-NNN` ou `RG-XX-NNN` correspondant en commentaire d'en-tête, ex. `// RG-04-006 — cohérence minimale du configurateur`.

## 4. Organisation des données fictives

Les modules de `lib/mock-data/` respectent strictement le dictionnaire d'entités du Cahier 9 (noms de champs en français, ex. `stock_reference`, `prix_unitaire`, `date_expiration_prevue`) pour que la traduction ultérieure vers un schéma PostgreSQL soit directe.

**Jeu de données de démonstration prévu :**
- **Catégories :** Électronique, Énergie solaire, Sécurité, Climatisation (+ sous-catégories cohérentes avec les 3 catalogues photo reçus).
- **Produits :** un échantillon réaliste par catégorie, avec au moins :
  - quelques produits B2B éligibles avec 2-3 paliers de prix chacun (dont un jeu de test volontairement construit pour valider la non-chevauchement, RG-03-004/section 6 Cahier 9) ;
  - des niveaux de stock couvrant les 4 états (rupture, alerte rouge ≤15 %, alerte orange ≤40 %, en stock) ;
  - les composants nécessaires au configurateur solaire (panneaux, batteries, régulateurs, accessoires).
- **Comptes de test** (aucun connecté par défaut — section 6) :
  - 1 Particulier ;
  - 1 Entreprise « B2B vérifié » (accès barème) ;
  - 1 Entreprise « en attente » et 1 « complément demandé » (pour démontrer le cycle de validation) ;
  - 1 Administrateur Général, 1 Agent SAV (RG-12-001, exactement 2 rôles).
- **Devis d'exemple** couvrant les 6 statuts (`en_attente`, `repondu`, `accepte`, `refuse`, `expire`, `converti`), dont un cas construit exactement à J+3 pour illustrer le cas limite (décision n°32).
- **Paramètres généraux :** taux de change HTG/USD fixé manuellement (valeur de démonstration plausible), langues actives FR/EN/ES.

**Couche de service :** aucune donnée mockée n'est importée directement dans un composant ; tout passe par `lib/services/*`, avec des signatures `async` dès le départ (même si l'implémentation actuelle est synchrone en mémoire) pour que le remplacement par des appels PostgreSQL (architecture cible, Cahier 8) ne change aucune interface consommée par l'UI.

## 5. Découpage en phases de développement (ordre acté — décision n°14)

Chaque phase suit la boucle : implémenter → vérifier contre les cas de test critiques du Cahier 12 (seuils de stock 40 %/15 %, expiration J+3, chevauchement de paliers, arrondi de taxe) → résumer avant de passer à la suivante.

| # | Phase | Contenu principal | Écrans (Cahier 6) |
|---|---|---|---|
| 0 | **Socle** | Init Next.js/TS/Tailwind, tokens design (couleurs/typo/grille Cahier 7), Header/Footer premium, i18n FR/EN/ES, stores Zustand (panier/session/langue), types d'entités, structure `mock-data`/`services` de base | — |
| 1 | **Accueil & Catalogue/Recherche/Fiche produit** | ECR-01-001 (accueil premium), ECR-01-002 (liste + filtres), ECR-03-001 (fiche produit + barème B2B), recherche avec suggestions | ECR-01-001, 01-002, 03-001 |
| 2 | **Devis & Packages** | Packages pré-configurés, configurateur personnalisé (RG-04-006), cycle de vie du devis, suivi côté client, traitement côté admin | ECR-04-001 à 004 |
| 3 | **Paiement** | Sélecteur MonCash/Carte/PayPal (RG-06-001), conversion HTG au paiement (RG-06-003/004), facture pro forma (RG-06-002) | ECR-06-001, 06-002 |
| 4 | **Panier & Commande** | Panier avec re-calcul de palier B2B, statut de retrait uniquement (RG-05-001, pas de livraison) | ECR-05-001, 05-002 |
| 5 | **Compte Client** | Connexion/inscription, inscription Entreprise en 4 étapes strictes (RG-08-001), espace client (devis, commandes, favoris) | ECR-08-001 + écrans compte |
| 6 | **Back-office (transverse)** | Tableau de bord admin, gestion catalogue/stock/paliers, traitement devis, validation Entreprise, 2 rôles stricts (RG-12-001), paramètres (taux de change) | ECR-12-001, 08-002, 04-004 |
| 7 | **Contenu / Sécurité / International** | Pages contenu (CGV, à propos, confidentialité), garde d'accès par rôle, sélecteur de langue fonctionnel FR/EN/ES | — |
| 8 | **SAV / Marketing / Analytics** | Tickets SAV, avis clients avec modération (RG-12-002), widgets analytics de base | — |

## 6. Points de vigilance transverses (à respecter à chaque phase)

- Jamais de session pré-connectée au démarrage (section 6 du prompt).
- Jamais de réintroduction des éléments exclus (section 8) : livraison, fidélité, code promo, virement bancaire, sélecteur de devise, négociation B2B libre, rôles admin personnalisables, raccourci de validation Entreprise.
- Utiliser les vraies photos disponibles (solaire, climatisation, sécurité) ; placeholders propres uniquement pour Électronique.
- Vérifier systématiquement les cas limites métier du Cahier 12 avant de clore une phase.

---

**En attente de votre validation avant de démarrer la Phase 0 (socle technique) et l'écriture de code.**
