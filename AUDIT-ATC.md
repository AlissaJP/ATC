# Audit du site e-commerce ATC (Alpha Tech Center)

| | |
|---|---|
| Date | 1er novembre 2026 |
| Périmètre audité | Dossier `site-web/`, copie de travail de la branche `main` (dernier commit `b049cc0`) **plus 119 modifications non commitées** (traduction FR/EN/ES et paiement par virement, ajoutés le même jour) |
| Méthode | Audit en lecture seule : lecture du code, outils du projet (TypeScript, ESLint, Vitest, build), navigateur headless (Playwright) sur le serveur local |
| Référence | Règles métier fournies avec la demande d'audit ; catalogue client `ATC-integration-site/ATC-integration/catalogue-data.json` |

---

# Rapport final

## 1. Synthèse

Le site est **complet, soigné et fidèle au catalogue du client** :
- les 41 produits sont affichés exactement comme dans son fichier ;
- les parcours d'achat, de devis, de compte professionnel et d'administration fonctionnent sur ordinateur, sans aucune erreur technique ;
- le code est propre et bien organisé.

**Il est prêt pour une démonstration au client, à condition de corriger d'abord une courte liste de points visibles** (lot 1, environ une journée de travail). Le plus important : **sur téléphone, le bouton de paiement du panier est inaccessible**. Il faut aussi :
- indiquer la taxe dans le panier ;
- retirer le badge « En stock » sans stock connu, les notes internes et la photo portant le nom d'un client ;
- limiter les droits de l'agent SAV ;
- mettre Next.js à jour.

**Il n'est pas prêt pour une mise en ligne.** Il n'y a pas encore de backend : les mots de passe ne sont pas vérifiés et les prix payés viennent du navigateur. De plus, n'importe qui peut modifier les prix et les CGV par une simple requête. Les coordonnées (WhatsApp, adresse, banque) sont aussi encore des valeurs de démonstration.

## 2. Tableau de bord

**Problèmes ouverts, par gravité et par phase**

| Phase | 🔴 Critique | 🟠 Majeur | 🟡 Mineur | ⚪ Suggestion | Clos par décision |
|---|---|---|---|---|---|
| 1. Cartographie | — | — | — | — | — |
| 2. Règles métier | 0 | 6 | 1 | 0 | 3 |
| 3. Catalogue et contenu | 0 | 3 | 6 | 0 | 0 |
| 4. Parcours utilisateurs | 1 | 2 | 4 | 0 | 0 |
| 5. Interface et accessibilité | 0 | 0 | 4 | 1 | 1 |
| 6. Performance et SEO | 0 | 1 | 2 | 3 | 0 |
| 7. Sécurité et code | 4 | 2 | 4 | 0 | 0 |
| **Total (48)** | **5** | **14** | **21** | **4** | **4** |

**Indicateurs clés**

| Indicateur | Valeur |
|---|---|
| Fidélité au catalogue client | 41/41 fiches conformes, 0 différence de données |
| Règles métier (17 contrôles de la phase 2) | 14 ✅ (dont 2 avec réserve : taxe, police), 3 ⚠️ partielles (paliers B2B, rôles, images publiques), 0 ❌ après décisions |
| Build, TypeScript, ESLint, tests | ✅ 0 erreur, 44 tests réussis |
| Erreurs JavaScript dans les parcours | 0 |
| Liens internes morts | 0 sur 58 |
| Lighthouse ordinateur (accueil / catégorie / fiche) | Performance 57 / 55 / 74 ; Accessibilité 92 / 91 / 96 ; Bonnes pratiques 100 ; SEO 100 |
| Dépendances vulnérables (`npm audit`) | Pendant l'audit : 1 critique (next), 6 élevées, 18 modérées. **Après la correction d'A-42 : 0 critique, 5 élevées, 18 modérées**, toutes liées aux outils de développement ou à la compilation |

## 3. Liste des problèmes (triée par gravité)

*Le détail complet de chaque problème (constat, preuve, impact, correction) est dans la section de sa phase, plus bas. Effort : S = moins d'une demi-journée, M = 1 à 3 jours, L = plus de 3 jours.*

### 🔴 Critique

| N° | Phase | Description | Preuve | Impact pour ATC | Correction proposée | Effort |
|---|---|---|---|---|---|---|
| A-20 ✅ **Corrigé** | 4 | Sur téléphone, le panier est plus large que l'écran et le bouton « Procéder au paiement » devient inaccessible. *Corrigé le 1er nov. : grille en `minmax(0,1fr)` et nom en `block truncate` (`PanierContenu.tsx:109-111`, `:145`) ; page de 375/390 px, paiement atteint pour les 3 produits testés sur 375, 390 et 1440 px ; tests et build OK* | `PanierContenu.tsx:109`, `:143`, `:209-217` ; page de 409 à 755 px pour un écran de 375 px ; touche impossible en émulation 375 et 390 px | Achat bloqué sur téléphone | `min-w-0` sur la colonne des articles, `block truncate` sur le nom | S |
| A-39 | 7 | Les 21 actions de l'admin s'exécutent sans session ni rôle | Requête `curl` anonyme : prix d'ES-13 passé à $1.00 et CGV réécrites, HTTP 200 ; `lib/actions/*.ts` | Faux prix et fausses CGV dès la mise en ligne | Vérifier une session serveur et le rôle dans chaque action ; ne pas déployer publiquement d'ici là | M |
| A-40 | 7 | Connexion sans vérification du mot de passe ; session falsifiable dans le navigateur ; `/admin` non protégé côté serveur | `connexion/page.tsx:74-92` ; mot de passe quelconque accepté ; session forgée → admin général | N'importe qui entre dans n'importe quel compte, y compris l'admin | Authentification côté backend, cookie `httpOnly`, `proxy.ts`, rôle vérifié | L |
| A-41 | 7 | Prix et montants payés calculés dans le navigateur | Panier modifié → « Montant à régler $1.10 », paiement « réussie » | Un client peut payer le prix qu'il veut | Recalcul complet côté serveur | L |
| A-42 ✅ **Corrigé** | 7 | Next.js 16.3.1 : 4 failles critiques (exécution de code à distance) ; sharp : 2 failles élevées. *Corrigé le 1er nov. : `next` et `eslint-config-next` passés en 16.4.3 (sharp 0.35.5 inclus). `npm audit` : 0 critique (contre 1). TypeScript, ESLint, 44 tests, build OK. Contrôle dans le navigateur : 8 pages, images optimisées, variante, Server Action de langue, paiement sur téléphone, 4 pages admin* | `npm audit` : GHSA-p293-qw3h-jr36, GHSA-2xp9-vwfh-vxw4, GHSA-2464-fhr4-w9xw, GHSA-673q-mjm6-r5xr | Prise de contrôle du serveur possible | Passer à next 16.4.3 (version mineure) | S |

### 🟠 Majeur

| N° | Phase | Description | Preuve | Impact pour ATC | Correction proposée | Effort |
|---|---|---|---|---|---|---|
| A-01 ✅ **Corrigé** | 2 | Le panier annonce un montant hors taxe comme montant à payer (+10 % au paiement). *Corrigé le 1er nov. : le récapitulatif affiche « Sous-total / Taxe (10 %) / Total », et le bouton mobile affiche le total TTC, avec le même calcul (`calculerFacture`) que l'écran de paiement. Vérifié sur ordinateur et téléphone, en FR, EN et ES : panier $1437.70 = à régler $1437.70* | `PanierContenu.tsx:197`, `:215` ; panier $151.00 → paiement $166.10 | Mauvaise surprise au paiement, abandons | Afficher HT, taxe et TTC dans le panier | S |
| A-02 | 2 | L'agent SAV ouvre `/admin/transactions` par son adresse | Page sans garde ; constaté dans le navigateur | Données financières visibles par le support | Garde de rôle « général » | S |
| A-03 | 2 | L'agent SAV accède aux modules Avis et Contenu, dont les CGV (confirmé non autorisé, Q2-1) | `AdminSidebar.tsx:154-156`, `:193-195` ; cahier 4, l. 216 | Le support peut modifier des textes juridiques | Réserver ces modules à l'admin général | S |
| A-04 | 2 | Les produits à variantes ignorent les paliers B2B (latent) | `AchatProduit.tsx:81-83`, `prix.ts:21-23` | 4 des 8 produits avec prix n'auront jamais de tarif pro | Paliers par variante | M |
| A-05 | 2 | Un client B2B qui ajoute un produit en deux fois ne bénéficie pas du palier sur le total (latent, reproduit) | `AchatProduit.tsx:97`, `cart-store.ts:57-63` ; 5 + 5 unités → $920 facturés en trop | Client B2B surfacturé | Laisser le panier recalculer sur la quantité totale | S |
| A-10 | 2 | Photo RE-01 portant « RADIO TELEVISION CARAÏBES » et photo du sèche-linge LG accessibles publiquement | `public/images/produits/RE-01.webp`, `HC-01.webp` : HTTP 200 | Nom d'un client publié sans accord | Retirer ces fichiers de `public/` | S |
| A-11 ✅ **Corrigé** | 3 | Badge « En stock » affiché sans aucun stock connu (8 produits). *Corrigé le 1er nov. : nouveau niveau `non_suivi` (`stock-alerte.ts`, `entities.ts`). Côté visiteur : aucun badge. Côté admin : statut gris « Non suivi ». Les alertes 40 % / 15 % réapparaissent dès qu'un stock est saisi (vérifié : entrée de 30 → « Stock faible » dans l'admin et sur la fiche). 4 tests ajoutés ou mis à jour* | `stock-alerte.ts:14` ; badge vu sur les 8 fiches | Disponibilité promise sans confirmation | Pas de badge, ou « Disponibilité à confirmer » | S |
| A-12 ✅ **Corrigé (masquage)** | 3 | Notes internes du fichier client visibles (ES-24, CL-S, ES-09, ES-13, ES-22, « Cible : » des PK). *Masquées le 1er nov. à l'affichage, en FR, EN et ES, par une liste explicite (`lib/mock-data/catalogue-masquages.ts`). Le fichier client n'est pas modifié. Test automatique sur les 41 fiches × 3 langues, et vérification dans le navigateur. Le client doit encore réécrire ces passages ; les masques seront alors retirés* | `catalogue-data.json` ; fiches dans le navigateur | Image peu professionnelle | Masquer maintenant (accord Q3-2), faire réécrire par le client | S |
| A-14 | 3 | WhatsApp, adresse du magasin et coordonnées bancaires de démonstration ; aucun e-mail (🔴 à la mise en ligne) | `lib/constants/contact.ts`, `magasin.ts`, `banque.ts` | Demandes de prix et de support envoyées au mauvais numéro | Remplacer les 3 constantes par les vraies valeurs | S |
| A-21 | 4 | Le configurateur ajoute les produits à variantes sans choix (le client doit pouvoir choisir, Q4-1) | `ConfigurateurPackage.tsx:40` ; devis `ES-04×1, ES-01×1` | Devis ambigus, estimations fausses | Sélecteur de variante, variante enregistrée dans le devis | M |
| A-26 | 4 | Documents Entreprise non conservés ni consultables par l'admin (reporté au backend, Q4-2) | `comptes-store.ts:36-40` ; `GestionClients.tsx` | Tarif pro accordé sans vérification réelle | Stockage de fichiers avec le backend | M |
| A-33 | 6 | Même titre et même description sur toutes les pages, aucun Open Graph | `app/layout.tsx:19-22` ; 10 pages contrôlées | Liens partagés sur WhatsApp sans nom, photo ni prix ; mauvais référencement | `generateMetadata` par page, `openGraph.images` | M |
| A-43 | 7 | Comptes (e-mails, téléphones, NIF) inclus dans le JavaScript public | `.next/static/chunks/2ly6r07ub-w8e.js`, `447fcy8qqbwfi.js` | Fuite de données personnelles avec de vraies données | Données de comptes côté serveur | M |
| A-48 | 7 | Passage à PostgreSQL : 49 composants lisent les mocks directement, données métier dans le `localStorage`, identifiants et montants générés côté client | Voir 7.2 | Refonte de la couche de données nécessaire | Tout faire passer par `lib/services`, API page par page | L |

### 🟡 Mineur

| N° | Phase | Description | Preuve | Correction proposée | Effort |
|---|---|---|---|---|---|
| A-06 | 2 | Paliers B2B par défaut inventés (−8 % / −15 %) | `paliers-prix-b2b.ts:7-13` ; constaté dans l'admin | Barème vide à saisir par l'admin | S |
| A-13 | 3 | Caractéristiques d'ES-18 coupées dans une liste de chiffres | `caracteristiques.ts:23-24` | Ne pas couper entre deux nombres | S |
| A-15 | 3 | Données de démonstration incohérentes : Carrier, sonnettes, « panneau 405W », `j***@exemple.com`, encadré « Comptes de démonstration » | `temoignages.ts:39`, `faq.ts:53`, `sav-store.ts:67`, `comptes-store.ts:133` | Réaligner sur le vrai catalogue | S |
| A-16 | 3 | CGV et FAQ : garantie « indiquée sur chaque fiche » (faux), « régulateurs » | `contenu-legal.ts:59`, `faq.ts:34` | Corriger le texte | S |
| A-17 | 3 | Mentions légales incomplètes (éditeur, hébergeur) | `contenu-legal.ts:119`, `:129` | À compléter avec les données du client (Q3-1 : oui) | S |
| A-18 | 3 | « Énergie solaire » / « Énergies solaires » | `categories.ts:14` contre `fr.json:3` | Un seul libellé | S |
| A-19 | 3 | 80 images inutilisées (environ 7 Mo) restent publiques | `public/images/…` | Supprimer et archiver hors du site | S |
| A-22 | 4 | Retirer le dernier article du panier ne permet pas d'annuler | `PanierContenu.tsx:96-106` contre `:219` | Afficher le message aussi panier vide | S |
| A-23 | 4 | Le chatbot répond hors sujet (« pompes à eau solaires ») | Constaté dans le navigateur | Seuil de correspondance plus strict | S |
| A-24 | 4 | Marques fictives dans le formulaire produit de l'admin | `lib/mock-data/marques.ts` | Marques réelles | S |
| A-25 | 4 | Tableau de bord de l'admin à 388 px sur un écran de 375 px | Mesure dans le navigateur | Corriger la mise en page | S |
| A-28 | 5 | Curseur de prix sans libellé, étoiles sans rôle, erreurs non annoncées, niveau de titre sauté | `CatalogueBrowser.tsx:224`, `Etoiles.tsx:6` ; axe-core | `aria-label`, `role="img"`, `role="alert"` | S |
| A-29 | 5 | Pas de lien d'évitement ; Échap sans effet sur le menu mobile et le chatbot | `Header.tsx`, `Chatbot.tsx` | Lien d'évitement, gestion d'Échap et du focus | S |
| A-30 | 5 | 404 par défaut de Next.js en anglais ; « soft 404 » ; pas de page d'erreur propre au site | `app/not-found.tsx`, `error.tsx`, `loading.tsx` absents | Pages traduites, appel à `notFound()` | S |
| A-31 | 5 | Tablette : le bouton du chatbot masque un nom de produit ; vide dans la bannière d'accueil. *Constaté aussi après la correction d'A-20 : sur téléphone, le bouton du chatbot recouvre la fin de la barre « Procéder au paiement — $… » (la barre reste utilisable)* | `BanniereSolaire.tsx:52`, `:70` | Point de rupture `lg`, marge en bas | S |
| A-34 | 6 | Ni `sitemap.xml` ni `robots.txt` ; pages privées indexables | Réponses 404, pas de balise `robots` | `app/sitemap.ts`, `app/robots.ts`, `noindex` | S |
| A-35 | 6 | Trop de JavaScript : catalogue et 3 dictionnaires envoyés à chaque visiteur (mesure à refaire) | Lighthouse ; chunks `2ly6r07ub`, `2l6jp6tfod6zh` | Charger le seul dictionnaire utile, données côté serveur | M |
| A-44 | 7 | Aucun en-tête HTTP de sécurité, `X-Powered-By` exposé | `curl -I` ; `next.config.ts` vide | `headers()` et `poweredByHeader: false` | S |
| A-45 | 7 | 24 alertes de sécurité sur les outils de développement. *Après la correction d'A-42 : 23 alertes (0 critique, 5 élevées, 18 modérées). Une seule touche l'arbre de production : `source-map-js` (sous next → postcss), utilisé seulement pendant la compilation du CSS* | `npm audit` | `npm audit fix`, mise à jour d'eslint et vitest | S |
| A-46 | 7 | Admin : commandes et devis d'un nouveau client affichés au nom de « Client » ; fonctions recopiées 8 fois | `GestionCommandes.tsx:12-14`, `TraitementDevis.tsx:12-14` | Une seule fonction partagée | S |
| A-47 | 7 | Journal des actions des agents SAV jamais alimenté | `app/admin/agents-sav/historique/page.tsx:2`, `:16` | Écrire une entrée à chaque action | M |

### ⚪ Suggestion

| N° | Phase | Description | Correction proposée | Effort |
|---|---|---|---|---|
| A-32 | 5 | Zones tactiles de 20 à 43 px (liens en texte) | Marge intérieure verticale | S |
| A-36 | 6 | Pas de données structurées (Product, LocalBusiness, BreadcrumbList) | JSON-LD | S |
| A-37 | 6 | Anglais et espagnol invisibles pour Google (non requis, Q6-1) | URL `/en`, `/es` et `hreflang`, si un jour nécessaire | L |
| A-38 | 6 | Quelques images servies trop grandes (14 à 54 Kio) | Ajuster `sizes` | S |

### Clos par décision de la commanditaire

| N° | Décision |
|---|---|
| A-07 | Codes agents `WL-ATC-001` conservés (Q2-2) |
| A-08 | Textes « pas de livraison » et « pas de codes promo » acceptés (Q2-3) |
| A-09 | Police Stardom conservée pour l'instant (Q2-4) |
| A-27 | Contraste des boutons orange conservé (Q5-1), risque accepté |

## 4. Plan d'action

### Lot 1 — À corriger avant la démonstration (environ une journée, efforts S)

| Ordre | N° | Pourquoi maintenant |
|---|---|---|
| 1 | A-20 | La démonstration sur téléphone bloquerait au panier |
| 2 | A-42 | Mise à jour mineure de Next.js, sans risque, qui supprime 4 failles critiques |
| 3 | A-01 | Le client verra le saut de 10 % entre le panier et le paiement |
| 4 | A-11, A-12 | Accord donné (Q3-2) : badge « En stock » et notes internes |
| 5 | A-10, A-19 | Photo RE-01 portant le nom d'un client, photos d'anciens produits |
| 6 | A-02, A-03 | Droits de l'agent SAV, si l'admin est montré pendant la démo |
| 7 | A-13, A-15, A-16, A-18 | Incohérences de texte visibles pendant la démo |
| 8 | A-22, A-30, A-46 | Petits défauts visibles en manipulant le site |

### Lot 2 — À corriger avant la mise en ligne

| Bloc | N° | Contenu |
|---|---|---|
| Backend et sécurité | A-48, A-40, A-41, A-39, A-43 | Base de données, authentification, recalcul des prix côté serveur, actions protégées, données de comptes côté serveur |
| Données du client | A-14, A-17, A-04, A-05, A-06 | Vraies coordonnées, mentions légales, paliers B2B (avec correction du mécanisme) |
| Parcours | A-21, A-23, A-24, A-25, A-31 | Variantes dans le configurateur, chatbot, marques, affichage tablette et admin sur téléphone |
| Visibilité | A-33, A-34 | Titres, aperçus WhatsApp, sitemap, robots |
| Qualité et sécurité | A-44, A-45, A-28, A-29, A-35 | En-têtes HTTP, outils de développement, accessibilité, allègement du JavaScript (après une nouvelle mesure) |

### Lot 3 — Plus tard

| N° | Contenu |
|---|---|
| A-26 | Consultation des documents Entreprise, avec le stockage de fichiers du backend (Q4-2) |
| A-47 | Journal des actions des agents (table `agent_actions_log`) |
| A-32, A-36, A-38 | Zones tactiles, données structurées, images |
| A-37 | Versions anglaise et espagnole trouvables sur Google, seulement si cela devient un objectif |

## 5. Points non vérifiés

| Point | Pourquoi | Ce qu'il faudrait |
|---|---|---|
| A-20 sur de vrais téléphones | Seule l'émulation Chromium était disponible | Un test sur Safari iOS et Chrome Android |
| Performance réelle sur mobile | Machine d'audit saturée pendant les mesures (`benchmarkIndex` 114) | Lighthouse sur une machine libre, ou PageSpeed Insights une fois le site en ligne |
| Lecteur d'écran, zoom à 200 % | Analyse automatique et clavier seulement | Test NVDA ou VoiceOver |
| Orthographe et traductions EN/ES | Pas de correcteur dans l'environnement | Relecture humaine, idéalement par des locuteurs natifs |
| Droits d'utilisation des photos, exactitude technique des fiches | Relève du client | Confirmation écrite du client |
| Backend NestJS, base de données, API | Absents du dépôt (décision 1.7) | Nouvel audit quand le backend existera |
| E-mails, paiements réels | Démonstration sans envoi ni prestataire réel (décision n° 41) | Test en environnement de recette avec les vrais prestataires |
| `npm outdated` | Registre npm sans réponse dans le délai | Relancer la commande |
| Build relancé pendant l'audit | Il aurait écrasé le `.next` du serveur 3002 ; le build existant, à jour avec le code, est réussi | Relancer `npm run build` serveurs arrêtés |

## 6. Questions encore ouvertes

1. **La démonstration au client sera-t-elle faite en local, ou sur un site en ligne** (même privé) ? Si elle est en ligne, A-39 (actions de l'admin sans protection) passe dans le lot 1.
2. **Quand le client peut-il fournir ses données ?** Il s'agit des stocks, des paliers B2B, des prix manquants (26 produits et 7 packages), des vraies coordonnées (WhatsApp, adresse, banque, e-mail) et des mentions légales. Plusieurs points du lot 2 en dépendent (A-04, A-05, A-06, A-11, A-14, A-17).
3. **Qui relira les traductions anglaises et espagnoles** avant la mise en ligne ?

> **Réponses de la commanditaire (1er novembre 2026) :**
> 1. **La démonstration se fera en local.** A-39 reste donc dans le lot 2 (avant la mise en ligne) : sans accès public au serveur, personne ne peut appeler ses actions.
> 2. **Date de livraison des données du client : inconnue.** A-04, A-05, A-06, A-11 (stock), A-14 et A-17 restent en attente de ces données. Les corrections de mécanisme qui n'en dépendent pas (A-05, A-06, masquage du badge d'A-11) peuvent être faites sans attendre.
> 3. **Traductions : considérées comme résolues.** Le changement de langue fonctionne : c'est vérifié dans le navigateur, avec 0 texte français restant sur 10 pages en anglais et 10 en espagnol (phase 3). Une relecture de la *formulation* par un locuteur natif reste recommandée avant la mise en ligne, surtout pour les 41 fiches du catalogue, traduites par l'assistant. Elle n'est **pas bloquante**.

---

# Détail par phase

## Phase 1 : cartographie

*Cette phase décrit le projet, sans le juger.*

### 1.1 Pile technique constatée

| Élément | Constat |
|---|---|
| Frontend | Next.js **16.3.1** (App Router, bundler Turbopack), React 19.2.8, TypeScript 5.9.3, Tailwind CSS 4.3.3 |
| État côté client | Zustand 5.0.15. Dix stores sont **persistés dans le `localStorage` du navigateur** : `atc-session`, `atc-panier`, `atc-commandes`, `atc-devis`, `atc-facturation`, `atc-comptes`, `atc-avis`, `atc-installations`, `atc-parametres`, `atc-sav` |
| Animations, icônes | framer-motion 13.1.1, lucide-react 1.31.0 |
| Tests | Vitest 4.1.10 (9 fichiers de test) ; Playwright 1.62.1 installé en dépendance de développement, sans test Playwright dans le dépôt |
| **Backend NestJS** | **Absent du dépôt.** Il n'y a ni projet NestJS, ni route API (`app/api` n'existe pas), ni `middleware.ts` / `proxy.ts`. La seule logique serveur se trouve dans 5 fichiers de Server Actions (`lib/actions/*.ts`), qui modifient les tableaux mock **en mémoire**. Le commentaire `lib/actions/catalogue-admin.ts:5-11` précise que les rôles ne sont vérifiés que dans l'interface |
| Langues | Interface en français, anglais et espagnol. Langue choisie par cookie `atc-langue` ; l'administration reste toujours en français |
| Polices | Fichiers locaux `lib/fonts/` : ClashDisplay-Variable, GeneralSans-Variable et une troisième police, **Stardom-Regular** |
| Configuration | `next.config.ts` est vide (configuration par défaut) |

### 1.2 Arborescence utile

```
ATC/
├── site-web/                    ← application Next.js auditée
│   ├── app/                     ← 50 pages (29 publiques, 21 admin) + 2 layouts
│   ├── components/              ← 95 composants répartis en 15 dossiers
│   ├── lib/
│   │   ├── actions/             ← 5 Server Actions (catalogue, stock, contenu, agents SAV, langue)
│   │   ├── business-rules/      ← 10 règles métier isolées (taxe, barème B2B, alertes de stock, J+3…)
│   │   ├── constants/           ← contact (WhatsApp), magasin, banque
│   │   ├── fonts/               ← polices locales
│   │   ├── hooks/, i18n/        ← traduction (dictionnaires fr/en/es)
│   │   ├── mock-data/           ← données de démonstration (voir 1.5)
│   │   ├── services/            ← 18 services de lecture et de calcul
│   │   ├── store/               ← 12 stores Zustand
│   │   └── types/entities.ts    ← 48 types et interfaces (421 lignes)
│   ├── public/images/           ← 14 Mo d'images (bannières, produits, logo…)
│   └── tests/                   ← business-rules, catalogue, i18n, paiement
├── ATC-integration-site/ATC-integration/   ← catalogue client (non versionné dans git)
│   ├── catalogue-data.json, Catalogues-produits-ATC-par-categorie.pdf
│   └── photos-site/ (38 photos produits + bannières)
├── projet-ATC-complet/          ← cahiers du projet (documentation)
└── AUDIT-REPORT.md, PLAN.md     ← documents d'un audit et d'un plan antérieurs
```

### 1.3 Pages et routes

**Site public (29 pages)**

| Zone | Routes |
|---|---|
| Accueil et contenu | `/`, `/a-propos`, `/contact`, `/faq`, `/cgv`, `/confidentialite`, `/mentions-legales` |
| Catalogue | `/categorie/[slug]`, `/produit/[slug]`, `/recherche` |
| Packages | `/packages`, `/packages/[slug]`, `/packages/configurateur` |
| Achat | `/panier`, `/paiement/commande/[commandeId]`, `/paiement/devis/[devisId]`, `/commandes`, `/commande/[commandeId]`, `/commande/[commandeId]/recu`, `/facture/[factureId]`, `/devis` |
| Compte | `/compte/connexion`, `/compte/inscription`, `/compte/inscription-entreprise`, `/compte/mot-de-passe-oublie`, `/compte/tableau-de-bord`, `/compte/favoris` |
| Support | `/sav` |

**Administration (21 pages sous `/admin`)**

`/admin` (tableau de bord), `catalogue`, `catalogue/nouveau`, `stock`, `packages`, `packages/nouveau`, `devis`, `commandes`, `transactions`, `virements`, `clients`, `avis`, `sav`, `installations`, `contenu`, `statistiques`, `rapports`, `parametres`, `comptes`, `agents-sav`, `agents-sav/nouveau`, `agents-sav/historique`.

Aucune page 404 personnalisée (`app/not-found.tsx` absent), aucun `sitemap` ni `robots` dans `app/` : ce sera examiné en phases 5 et 6.

### 1.4 Composants principaux

| Dossier | Nb | Rôle |
|---|---|---|
| `admin/` | 29 | Back-office : catalogue, stock, commandes, paiements, virements, SAV, agents, statistiques, rapports |
| `product/` | 12 | Fiche produit, carte, variantes et achat (`AchatProduit`), « Demander un prix » (`BoutonDemanderPrix`), favoris, avis, stock |
| `layout/` | 8 | En-tête et navigation, pied de page, recherche, chatbot, sélecteur de langue |
| `compte/` | 8 | Garde de connexion, inscription Entreprise (stepper), adresses, moyens de paiement |
| `home/` | 6 | Blocs de la page d'accueil |
| `paiement/` | 5 | Écran de paiement, formulaires MonCash / carte / PayPal / virement |
| `commande/` | 5 | Confirmation, reçu, statut, planification d'installation |
| `ui/` | 7 | Modale, toast, bannière, image de catalogue, logo |
| autres | 15 | `a-propos` (4), `devis` (2), `packages` (2), `sav` (2), `contact`, `faq`, `facture`, `panier`, `i18n` (1 chacun) |

### 1.5 Données mock et types

| Fichier (`lib/mock-data/`) | Contenu |
|---|---|
| `catalogue-atc.json` (650 l.) | Catalogue client, converti au chargement par `produits.ts` (206 l.) |
| `catalogue-atc-traductions.json` | Traductions EN/ES des fiches du catalogue |
| `categories.ts` | 3 catégories racines (Énergie solaire, Sécurité, Climatisation) et 10 sous-catégories |
| `packages-preconfigures.ts` | Packages PK-01 à PK-07 |
| `stock.ts`, `mouvements-stock.ts` | Stock et historique des mouvements |
| `paliers-prix-b2b.ts` | Paliers de prix B2B |
| `utilisateurs.ts`, `administrateurs.ts`, `agents-sav.ts`, `journal-agents-sav.ts` | Comptes de démonstration et journal des agents |
| `faq.ts`, `contenu-legal.ts`, `temoignages.ts`, `garanties.ts`, `marques.ts`, `parametres-generaux.ts` | Contenus et paramètres |

Les types sont centralisés dans `lib/types/entities.ts` (48 types : `Produit`, `VarianteProduit`, `Categorie`, `Stock`, `PalierPrixB2B`, `Devis`, `Commande`, `Paiement`, `FactureProForma`, `CompteAgentSav`, `JournalActionAgentSav`, etc.).

Les données créées pendant l'utilisation (session, panier, commandes, devis, paiements, comptes) **ne sont pas dans les fichiers mock** : elles vivent dans le `localStorage` de chaque navigateur (stores Zustand persistés).

### 1.6 Installation, build, lint et tests

| Contrôle | Commande | Résultat |
|---|---|---|
| Dépendances | `npm ls --depth=0` | ✅ Arbre cohérent, aucune dépendance manquante ou invalide. 93 paquets du lockfile sont absents, tous **optionnels** et propres à d'autres plateformes (macOS, Linux, Windows ARM64/32 bits) : c'est normal. `npm install` n'a pas été relancé, pour ne pas modifier `package-lock.json` (audit en lecture seule) |
| TypeScript | `npx tsc --noEmit` | ✅ 0 erreur, 0 avertissement |
| Lint | `npx eslint .` | ✅ 0 erreur, 0 avertissement |
| Tests | `npx vitest run` | ✅ 9 fichiers, 44 tests réussis. Seul message : un avertissement de Vite sur la syntaxe ESM de `vitest.config.ts`, sans effet |
| Build de production | `next build` | ✅ **Réussi, constaté sur le build existant**, pas relancé : voir ci-dessous |

**Build : comment il a été vérifié.**
- Le build de production présent dans `site-web/.next` date du 1er novembre à 16:38. Aucun fichier source (`app`, `components`, `lib`, `tests`, `public`, `next.config.ts`, `package.json`) n'a été modifié depuis.
- Son journal indique « Compiled successfully » et 45 pages générées (dont 44 statiques), sans erreur ni avertissement.
- Je ne l'ai pas relancé : il aurait écrasé le dossier `.next`, utilisé par le serveur qui tourne sur le port 3002.
- J'ai tenté un build dans une copie isolée du projet. Turbopack refuse un `node_modules` relié par jonction (« Symlink … points out of the filesystem root »). C'est une limite de l'environnement d'audit, pas un défaut du site.

**Serveur local.** Le site répond sur `http://localhost:3002` (HTTP 200). C'est un `next start` du build de 16:38, donc à jour avec le code. Les phases 4 à 6 seront testées sur ce serveur.

### 1.7 Points tranchés avant la phase 2

> **Décisions de la commanditaire (1er novembre 2026) :**
> 1. Le virement bancaire est **autorisé** : la règle a changé.
> 2. L'absence de backend est assumée : la sécurité côté serveur sera notée « absente », pas « défaillante ».
> 3. Le libellé « Packages solaires » du site est retenu.

Trois écarts entre les règles de l'audit et l'état réel du projet changeaient la façon de juger certains points :

1. **Virement bancaire.**
   - Ce que disent les règles : le virement fait partie des fonctions « retirées, qui ne doivent apparaître nulle part ».
   - Ce que montre le code : il a été **ajouté le 1er novembre à la demande du client**. Il comprend un moyen de paiement, l'envoi de la preuve, la page `/admin/virements`, et la mise à jour de la FAQ et des CGV. La décision n° 23 des cahiers a été levée oralement.
   - À trancher : doit-il être jugé non conforme (critique), ou faut-il considérer que la règle a changé ?
2. **Backend NestJS.** Il n'existe pas dans le dépôt. Les points de la phase 7 qui supposent un backend (protection des routes API, prix recalculé côté serveur, rôles vérifiés côté backend) seront constatés **absents**, et non « défaillants ».
3. **Libellé de navigation.** La règle dit « Package solaires » ; le site affiche « Packages solaires » (`lib/i18n/dictionnaires/fr.json:6`). Je considérerai la forme du site comme correcte, sauf avis contraire.

### 1.8 Pages à auditer (à valider)

| # | Page | Ordinateur 1440 px | Téléphone 375 px | Tablette 768 px (phase 5) |
|---|---|---|---|---|
| 1 | Accueil `/` | ✓ | ✓ | ✓ |
| 2 | Catégorie `/categorie/energie-solaire` (+ filtres, sous-catégories) | ✓ | ✓ | ✓ |
| 3 | Catégories `/categorie/climatisation` et `/categorie/securite` | ✓ | ✓ | |
| 4 | Fiche avec variantes et prix : ES-01 (panneau Trina), ES-04 (Solis) | ✓ | ✓ | ✓ |
| 5 | Fiche sans prix : ES-03 (SMA Sunny Boy), CL-01 | ✓ | ✓ | |
| 6 | Recherche `/recherche` (avec et sans résultat) | ✓ | ✓ | |
| 7 | Packages `/packages`, `/packages/[slug]`, configurateur | ✓ | ✓ | |
| 8 | Panier, paiement (MonCash, carte, PayPal, virement), confirmation, reçu | ✓ | ✓ | |
| 9 | Facture pro forma (B2B), devis `/devis` | ✓ | ✓ | |
| 10 | Compte : connexion, inscription, inscription Entreprise (4 étapes), mot de passe oublié, tableau de bord, favoris | ✓ | ✓ | |
| 11 | Commandes `/commandes`, SAV `/sav`, contact, FAQ, chatbot, WhatsApp | ✓ | ✓ | |
| 12 | Pages légales (CGV, confidentialité, mentions) et À propos | ✓ | ✓ | |
| 13 | URL inexistante (page 404) et accès direct à une catégorie « électronique » | ✓ | | |
| 14 | Admin général : les 21 pages `/admin` | ✓ | contrôle rapide | |
| 15 | Agent SAV : accès autorisés et accès interdits (par menu et par URL directe) | ✓ | | |

Les parcours de la phase 4 se font en français. Une vérification ponctuelle en anglais et en espagnol est prévue en phase 3, pour repérer les textes non traduits.

---

## Phase 2 : conformité aux règles métier

**Comment ça a été vérifié.**
- **Code :** lecture et recherche dans tout le code.
- **Navigateur :** Playwright, visiteur non connecté, écran de 1440 px.
- **Serveur :** instance propre `next start -p 3005`, construite sur le même build que celui du port 3002.

> **Note d'environnement (pas un défaut du site).** Le serveur du port 3002 a été lancé plus tôt par l'assistant ; quand sa tâche a été arrêtée, le processus est resté actif sans journal. Dans le navigateur, une fois l'accueil chargé, les navigations suivantes restaient bloquées (15 requêtes d'images jamais terminées). Une instance propre sur le port 3005, avec le même build, ne présente aucun blocage : 300 à 700 ms par page. **Il est conseillé de relancer le serveur 3002.**

### 2.1 Tableau de conformité

| # | Règle | Verdict | Preuve |
|---|---|---|---|
| R1 | Navigation : Énergies solaires, Packages solaires, Climatisation, Sécurité | ✅ | Navigateur : la barre affiche exactement `["Énergies solaires","Packages solaires","Climatisation","Sécurité"]`. Code : `components/layout/Header.tsx:152-187` |
| R1b | Traitement de la catégorie Électronique | ✅ Retirée | Absente des catégories (`lib/mock-data/categories.ts:12-53`). Seule trace dans l'interface : un commentaire (`Header.tsx:22`). `/categorie/electronique` et `/categorie/electronique-securite` renvoient **404**. Aucune image « electron* » dans `public/` |
| R2 | Prix en USD uniquement ; HTG seulement au paiement | ✅ | Navigateur : aucune mention de HTG, EUR, € ou « gourdes » sur `/`, une catégorie, une fiche, `/packages` ni `/recherche`. Côté client, le HTG n'apparaît que sur l'écran de paiement (MonCash : `EcranPaiement.tsx:378` ; virement en gourdes : `FormulaireVirement.tsx:133`, autorisé depuis la décision 1.7). Côté admin, il apparaît dans l'historique des paiements et le réglage du taux (`GestionTransactions.tsx:108`, `GestionVirements.tsx:90-95`, `GestionParametres.tsx:95`), ce qui relève du back-office. Le catalogue refuse toute devise autre que l'USD au chargement (`lib/mock-data/produits.ts:46-47`) |
| R3 | Variantes : le sélecteur met à jour le prix | ✅ | Navigateur, ES-01 : 645 W → $157.00 ; 650 W → $160.00 ; 630 W → $151.00. Les produits à variantes n'ont pas d'ajout rapide depuis une carte, ce qui oblige à choisir une variante (`ProductCard.tsx:89-91`, `ProductListItem.tsx:80-82`) |
| R4 | Produit sans prix : « Prix sur demande », bouton WhatsApp prérempli, pas d'ajout au panier | ✅ | Navigateur, ES-03 : « Prix sur demande », aucun bouton « Ajouter au panier », lien `https://wa.me/50922220000` avec le message « Bonjour ATC, je souhaite connaître le prix du produit ES-03 — Onduleur photovoltaïque SMA Sunny Boy. ». Double garde dans le code : `AchatProduit.tsx:95` et `cart-store.ts:42-43`. Le numéro est un numéro de démonstration (examiné en phase 3) |
| R5 | Visiteur : ni panier ni favoris | ✅ | Navigateur : clic sur « Ajouter au panier » → message « Connectez-vous pour ajouter ce produit à votre panier. », 0 ligne dans le panier. Clic sur le favori → « Connectez-vous pour ajouter ce produit à vos favoris. ». Les 5 points d'entrée passent tous par `executerSiConnecte` (`AchatProduit.tsx:96`, `ProductCard.tsx:100`, `ProductListItem.tsx:91`, `BoutonFavori.tsx:31`, `AjouterPackageBouton.tsx:26`) |
| R6a | B2B : paliers de prix par quantité | ⚠️ Partiel | Le mécanisme existe (fiche, panier, admin), mais **aucun produit n'a de palier** : `produits.ts:97` fixe `eligible_b2b: false` pour les 41 entrées, car le client n'a fourni aucun palier. Un client B2B voit donc le prix public. Trois défauts dans le mécanisme lui-même : A-04, A-05, A-06 |
| R6b | B2B : validation du compte Entreprise en 4 étapes | ✅ (code) | `components/compte/InscriptionEntreprise.tsx:13` : Inscription → Documents → Vérification → Activation, conforme à RG-08-001 (cahier 4, l. 179-185). Approuver, rejeter ou demander un complément : `GestionClients.tsx:203-313`. Parcours complet testé en phase 4 |
| R7 | Packages pré-composés + « Créer son propre package » → devis J+3 | ✅ | `/packages` : 7 packages en « Prix sur demande », lien « Créer son propre package » présent. Le configurateur crée un devis (`ConfigurateurPackage.tsx:97-101`) et n'accepte que des produits avec prix (`:144`). Expiration à 3 jours (`lib/business-rules/devis-expiration.ts:7`), comptée **à partir de la réponse d'ATC** (`devis-store.ts:112-113`), comme le prévoient RG-04-005 et le cycle « Répondu → Expiré » (cahier 4, l. 106). Parcours testé en phase 4 |
| R8 | Stock : référence 100, alerte orange ≤ 40 %, rouge ≤ 15 % | ✅ (code) | `lib/mock-data/stock.ts:10` (`STOCK_REFERENCE_PAR_DEFAUT = 100`) ; `lib/business-rules/stock-alerte.ts` (`<= 15` rouge, `<= 40` orange, limites incluses). Tous les produits ont un stock « non suivi » (`stock_actuel: null`, `stock.ts:14`), faute de données client : aucune alerte ne peut se déclencher tant que l'admin n'a pas saisi de stock. Testé en phase 4 |
| R9 | Taxe de 10 % sur les factures | ✅ avec réserve | `lib/business-rules/taxe.ts:4` (`TAUX_TAXE_DEFAUT = 0.10`), appliquée au paiement (`EcranPaiement.tsx:161`) et aux factures. Réserve : le panier annonce un montant hors taxe comme montant à payer (A-01) |
| R10 | Paiements : MonCash, PayPal, carte (+ virement, autorisé) | ✅ | `lib/types/entities.ts:196` ; `EcranPaiement.tsx` (liste `MOYENS`) |
| R11a | Rôles Administrateur général et Agent SAV | ⚠️ Partiel | Deux rôles exactement (`entities.ts:242`). Les pages réservées à l'admin général ont une garde, sauf `/admin/transactions` (A-02). L'agent SAV a accès à des modules hors de son périmètre défini (A-03) |
| R11b | Codes agents SAV-XXXX générés automatiquement | ❌ Format différent | Génération automatique : oui. Format : **`{INITIALES}-ATC-{numéro}`** (ex. `WL-ATC-001`, `lib/services/agents-sav.ts:24-37`, `lib/mock-data/agents-sav.ts:11`). Le code cite une « décision actée n°48 », introuvable dans les cahiers du projet. Voir A-07 et la question Q2-2 |
| R12 | Fonctions retirées absentes | ⚠️ | Aucun code, bouton ni route pour la livraison, les codes promo, la fidélité, le multi-devises ou un « Espace Entreprise » (le seul « Espace Entreprise » est un commentaire, `Header.tsx:30`). Restent des **textes** qui disent que ces services ne sont pas proposés (A-08) |
| R13 | Identité visuelle | ⚠️ | Couleurs exactes : `app/globals.css:5-7` (`#014dab`, `#018dde`, `#fe4028`). Polices : `--font-titres` Clash Display et `--font-corps` General Sans (`globals.css:38-39`). Une **3ᵉ police**, Stardom, est utilisée pour le titre de la bannière d'accueil (A-09) |
| R14 | Catalogue réel : 41 entrées, 8 prix, pas de sèche-linge LG, pas de nom RE-01 | ⚠️ | 41 entrées ; prix sur ES-01, ES-02, ES-04, ES-11, ES-13, ES-14, ES-15 et ES-18, exactement. Le sèche-linge LG (HC-01) n'est ni dans les données ni dans les pages. **Mais** les photos RE-01 (qui affiche « RADIO TELEVISION CARAÏBES ») et HC-01 (sèche-linge LG) sont dans `public/` et s'ouvrent par leur adresse (A-10) |

**Recherche des mots-clés des fonctions retirées** (`app/`, `components/`, `lib/`) :

| Mot-clé | Occurrences | Nature |
|---|---|---|
| livraison / delivery / expédi | 16 | 5 commentaires de code ; textes « aucun service de livraison » (reçu, facture, CGV) ; une question de FAQ sur la livraison (A-08) |
| promo | 5 | « Les codes promotionnels ne sont pas proposés » (FAQ et CGV, 3 langues) |
| shipping, coupon, fidélité, loyalty, multi-devise, € | 0 | — |
| currency / devise | 26 | « Currency: USD » / « Devise : USD » sur la facture pro forma ; contrôle USD du catalogue |
| virement / bank transfer | — | Autorisé (décision 1.7) |

### 2.2 Problèmes relevés en phase 2

#### A-01 🟠 Majeur — Le panier annonce un montant à payer sans la taxe de 10 %
- **Constat.** Le récapitulatif du panier et le bouton mobile « Procéder au paiement — {montant} » affichent le total **hors taxe**, présenté comme le montant à payer. L'écran de paiement demande ensuite ce montant **plus 10 %**, sans transition ni mention « HT » dans le panier.
- **Preuve.**
  - `components/panier/PanierContenu.tsx:197` (total) et `:215` (bouton mobile « Procéder au paiement — $… ») ;
  - `components/paiement/EcranPaiement.tsx:161` (`montant = detailTaxe.montant_ttc`) ;
  - constaté dans le navigateur lors du test du virement : panier à $151.00, écran de paiement « Montant à régler $166.10, dont taxe (10 %) : $15.10 ».
- **Impact pour ATC.** Le client découvre une hausse de 10 % à l'étape du paiement : perte de confiance et risque d'abandon de panier.
- **Correction proposée.** Afficher « Sous-total HT / Taxe 10 % / Total TTC » dans le panier, et le TTC sur le bouton.
- **Effort.** S

#### A-02 🟠 Majeur — L'agent SAV peut ouvrir la page « Paiements » par son adresse
- **Constat.** Le menu réserve « Paiements » à l'administrateur général, mais la page n'a pas de garde de rôle : un agent SAV qui tape l'adresse voit toutes les transactions, les montants en HTG et les liens vers les factures. Un commentaire du composant affirme au contraire que la page est « accessible aux deux rôles ». La règle n'est donc appliquée nulle part de façon cohérente.
- **Preuve.**
  - `components/admin/AdminSidebar.tsx:125-127` (`rolesAutorises: ["general"]`) ;
  - `app/admin/transactions/page.tsx:8-17` : aucun `GardeRoleAdmin`, alors que les 13 autres pages réservées en ont une ;
  - `components/admin/GestionTransactions.tsx:3-5` (le commentaire contradictoire) ;
  - accès réel par un agent SAV : vérifié dans le code, test dans le navigateur prévu en phase 4.
- **Impact pour ATC.** Exposition des données financières à un rôle de support.
- **Correction proposée.** Ajouter `<GardeRoleAdmin rolesAutorises={["general"]}>` à la page, et corriger le commentaire.
- **Effort.** S

#### A-03 🟠 Majeur — L'agent SAV accède aux modules « Avis clients » et « Contenu », hors de son périmètre
- **Constat.** Le cahier 4 limite l'agent SAV aux onglets Devis, Commandes, Clients et Assistance/SAV. Le site lui ouvre aussi « Avis clients » (modération) et « Contenu », ce qui lui permet de modifier la FAQ, les **CGV**, la politique de confidentialité et les mentions légales.
- **Preuve.**
  - `components/admin/AdminSidebar.tsx:154-156` et `:193-195` (`rolesAutorises: ["general", "agent_sav"]`) ;
  - `app/admin/avis/page.tsx` et `app/admin/contenu/page.tsx` : pas de garde ;
  - `projet-ATC-complet/Documentation-Projet/04-Cahier-des-Regles-Metiers.md:216`.
- **Impact pour ATC.** Un agent de support peut modifier les conditions générales de vente, qui ont une portée juridique.
- **Correction proposée.** Réserver « Contenu », et « Avis clients » si confirmé, à l'administrateur général : menu et garde de page. Voir la question Q2-1.
- **Effort.** S

#### A-04 🟠 Majeur (latent) — Les produits à variantes ne peuvent pas avoir de prix B2B par palier
- **Constat.** Dès qu'une variante est sélectionnée, son prix fixe remplace tout palier B2B, sur la fiche comme dans le panier. 4 des 8 produits qui ont un prix ont des variantes (ES-01, ES-04, ES-14, ES-18) : la règle des paliers ne pourra pas s'appliquer à la moitié du catalogue chiffré.
- **Preuve.**
  - `components/product/AchatProduit.tsx:81-83` (`!varianteActive` exclut le palier) ;
  - `lib/services/prix.ts:21-23` (`if (variante) return variante.prix;`).
- **Impact pour ATC.** Aucun aujourd'hui, puisqu'il n'existe aucun palier. Dès que le client fournira ses paliers, les clients B2B paieront le prix public sur ces 4 produits.
- **Correction proposée.** Paliers par variante (le type `PalierPrixB2B` porterait un `variante_id`), ou paliers exprimés en pourcentage du prix de la variante, selon ce que le client fournira.
- **Effort.** M

#### A-05 🟠 Majeur (latent) — Un client B2B qui ajoute un produit en plusieurs fois ne bénéficie pas du palier sur le total
- **Constat.** La fiche produit transmet au panier le prix unitaire calculé pour **la quantité ajoutée**, sous forme de prix fixe. Ce paramètre de prix fixe est prévu pour les composants de package (`cart-store.ts:23-24`). Exemple : un client B2B ajoute 5 unités, puis encore 5 ; la ligne passe à 10 unités, mais garde le prix du palier « 1 à 9 » au lieu de celui du palier « 10 à 49 ». Le prix ne se corrige que si le client modifie ensuite la quantité dans le panier (`cart-store.ts:73-91`).
- **Preuve.** `components/product/AchatProduit.tsx:97` (`ajouterLigne(…, quantite, prixUnitaire)`) et `lib/store/cart-store.ts:57-63` (`prixFixe ?? resoudrePrixUnitaire(…, quantiteTotale, …)`). Non reproductible dans le navigateur aujourd'hui, faute de palier : constat fait dans le code.
- **Impact pour ATC.** Le client B2B paie trop cher, sans le voir.
- **Correction proposée.** Ne pas passer de prix fixe depuis la fiche produit : laisser le panier recalculer sur la quantité totale.
- **Effort.** S

#### A-06 🟡 Mineur — Paliers B2B par défaut inventés (-8 % / -15 %) quand l'admin coche « éligible B2B »
- **Constat.** Cocher « éligible B2B » sur un produit génère automatiquement 3 paliers : 1-9 au prix public, 10-49 à -8 %, 50 et plus à -15 %. Ces pourcentages ne figurent ni dans les cahiers (RG-03-004 prévoit des paliers « définis par l'administrateur ») ni dans les données du client.
- **Preuve.**
  - `lib/mock-data/paliers-prix-b2b.ts:2` et `:7-13` ;
  - `lib/actions/catalogue-admin.ts:105-111` et `:134-135` ;
  - `projet-ATC-complet/Documentation-Projet/04-Cahier-des-Regles-Metiers.md:93`.
- **Impact pour ATC.** Des remises non validées risquent d'être publiées si l'admin ne corrige pas les valeurs proposées.
- **Correction proposée.** Laisser le barème vide et obliger l'admin à saisir les paliers.
- **Effort.** S

#### A-07 🟡 Mineur (à confirmer) — Format des codes agents : `WL-ATC-001` au lieu de `SAV-XXXX`
- **Constat.** Les codes sont bien générés automatiquement, mais au format « initiales + ATC + numéro ». La « décision actée n°48 » citée en commentaire n'existe dans aucun cahier : elle vient d'un ajustement de design (commit `ee67ab3`).
- **Preuve.** `lib/services/agents-sav.ts:24-37` ; `lib/mock-data/agents-sav.ts:11` ; aucune occurrence de « n°48 » dans `projet-ATC-complet/Documentation-Projet/`.
- **Impact pour ATC.** Écart avec la règle d'audit ; à trancher (question Q2-2).
- **Correction proposée.** Revenir à `SAV-XXXX`, ou mettre à jour la règle et les cahiers.
- **Effort.** S

#### A-08 🟡 Mineur (à confirmer) — Des textes mentionnent encore la livraison et les codes promo, pour dire qu'ils n'existent pas
- **Constat.** La règle demande que ces fonctions n'apparaissent « nulle part, ni texte ». Plusieurs textes les nomment, pour préciser qu'elles ne sont pas proposées.
- **Preuve.**
  - FAQ « Proposez-vous la livraison à domicile ? » : `lib/mock-data/faq.ts:14`, `lib/i18n/dictionnaires/fr.json:565` (et EN/ES) ;
  - mention « Retrait en magasin uniquement, aucun service de livraison » sur le reçu et la facture pro forma : `fr.json:480`, `:492-493` ;
  - CGV : « ATC ne propose aucun service de livraison » (`lib/mock-data/contenu-legal.ts:53`) et « Les codes promotionnels ne sont pas proposés » (`:47`, et `faq.ts:22`).
- **Impact pour ATC.** Aucun risque fonctionnel. Ces textes informent le client ; ils contredisent seulement la lettre de la règle.
- **Correction proposée.** Les reformuler sans le mot (par exemple « Retrait en magasin uniquement »), ou les garder si la règle vise seulement les fonctions. Question Q2-3.
- **Effort.** S

#### A-09 🟡 Mineur (à confirmer) — Une 3ᵉ police (Stardom) sur la bannière d'accueil
- **Constat.** Le titre de la bannière solaire de l'accueil utilise la police Stardom, absente de l'identité visuelle (Clash Display et General Sans).
- **Preuve.** `components/home/BanniereSolaire.tsx:8` et `:31` ; `lib/fonts/stardom.ts`.
- **Impact pour ATC.** Écart avec la charte, et une police de plus à télécharger.
- **Correction proposée.** Remplacer par Clash Display, ou faire valider Stardom par le client (question Q2-4).
- **Effort.** S

#### A-10 🟠 Majeur — Photo RE-01 portant le nom « Radio Télévision Caraïbes » et photo du sèche-linge LG accessibles publiquement
- **Constat.** Aucune page n'affiche ces images, mais elles sont dans `public/` et s'ouvrent par leur adresse :
  - `/images/produits/RE-01.webp` (HTTP 200) affiche en gros titre « BACK UP 1 RADIO TELEVISION CARAÏBES — CHAVANNES PORT AU PRINCE » ;
  - `/images/produits/HC-01.webp` (HTTP 200) est la photo du sèche-linge LG ;
  - `/images/bannieres/HC-02.webp`, d'un produit « hors catégorie », est aussi publiée sans être utilisée.
- **Preuve.** `site-web/public/images/produits/RE-01.webp`, `HC-01.webp`, `public/images/bannieres/HC-02.webp` ; aucune référence dans `app/`, `components/` ni `lib/` ; requêtes HTTP 200 sur le serveur local.
- **Impact pour ATC.** Le nom d'un client est publié sans son accord (non encore obtenu). Les fichiers seront indexables une fois le site en ligne.
- **Correction proposée.** Retirer de `public/` les images non utilisées (RE-01, HC-01, HC-02), et les garder dans `ATC-integration-site/` jusqu'à décision.
- **Effort.** S

### 2.3 Questions de la phase 2

- **Q2-1.** L'agent SAV doit-il pouvoir modérer les avis clients ? Doit-il pouvoir modifier le contenu (FAQ, CGV, pages légales) ? Le cahier 4 dit non pour les deux.
- **Q2-2.** Pour les codes agents, faut-il revenir à `SAV-XXXX`, ou garder `WL-ATC-001` et mettre la règle à jour ?
- **Q2-3.** Les textes qui disent « pas de livraison » ou « pas de codes promo » sont-ils acceptés, ou faut-il les retirer ?
- **Q2-4.** La police Stardom a-t-elle été fournie ou validée par le client ?

> **Réponses de la commanditaire (1er novembre 2026) :**
> - **Q2-1 : Non.** L'agent SAV ne doit ni modérer les avis ni modifier le contenu. **A-03 est confirmé.**
> - **Q2-2 :** on garde `WL-ATC-001`. **A-07 est clos** : la règle devient « codes `{INITIALES}-ATC-{numéro}` générés automatiquement », et R11b passe à ✅.
> - **Q2-3 :** les textes « pas de livraison » et « pas de codes promo » sont acceptés : ATC ne fait ni livraison ni codes promo. **A-08 est clos**, et R12 passe à ✅.
> - **Q2-4 :** Stardom est conservée pour l'instant. **A-09 est clos** (choix assumé, à revoir avec le client), et R13 passe à ✅ avec réserve.

### 2.4 Bilan de la phase 2 (après réponses)

| Gravité | Nombre | Problèmes |
|---|---|---|
| 🔴 Critique | 0 | — |
| 🟠 Majeur | 6 | A-01, A-02, A-03, A-04 (latent), A-05 (latent), A-10 |
| 🟡 Mineur | 1 | A-06 |
| ⚪ Suggestion | 0 | — |
| Clos par décision | 3 | A-07, A-08, A-09 |

---

## Phase 3 : catalogue et contenu

**Comment ça a été vérifié.**
- Comparaison champ par champ du fichier du site avec le fichier du client.
- Ouverture des **41 fiches** (34 produits, 7 packages) dans le navigateur.
- Pagination complète des 3 catégories et de 3 sous-catégories.
- Exploration de 24 pages : 18 publiques, puis 6 avec le compte client de démonstration.
- Test des 58 liens internes trouvés.
- Contrôle de 10 pages en anglais et 10 en espagnol.
- Serveur : instance propre sur le port 3005.

### 3.1 Ce qui est conforme

| Contrôle | Résultat |
|---|---|
| Fichier catalogue du site / fichier client | ✅ **0 différence** de contenu sur les 41 entrées (champs `ref`, `categorie`, `sousCategorie`, `nom`, `description`, `caracteristiques`, `prixUSD`, `variantes`, `image`, `imageBanniere`). Seule la mise en forme JSON diffère |
| Classement | ✅ Les 10 sous-catégories du client correspondent une à une à celles du site (`lib/mock-data/produits.ts:52-63`). Le chargement s'arrête en erreur si une sous-catégorie est inconnue (`:75`) |
| Fiches (41) | ✅ Pour chaque fiche : nom, référence, sous-catégorie dans le fil d'Ariane, prix (ou « Prix sur demande »), chaque valeur de variante et chaque élément de caractéristique du fichier client sont affichés. Aucune garantie ni quantité de stock affichée sur les fiches |
| Catégories | ✅ Pagination de 6 produits par page, voulue (`CatalogueBrowser.tsx:19`). En parcourant toutes les pages, on retrouve les 24 produits Énergie solaire, les 9 Climatisation, les 8 Batteries lithium, les 9 Onduleurs et la caméra, sans intrus dans les sous-catégories |
| Images des fiches | ✅ L'image du fichier client est affichée sur chaque fiche ; aucune image cassée ; tous les `alt` présents. Photos carrées en `object-fit: contain` sur fond blanc `rgb(255,255,255)` (594×594) ; bannières 2:1 en `cover` (596×298). ES-24, sans image fournie, affiche un visuel neutre avec son nom |
| Pages (24) | ✅ Aucune image cassée, aucun `alt` manquant, aucun « lorem ipsum » ni TODO, aucun mot anglais sur les pages françaises, 0 erreur dans la console |
| Liens internes | ✅ 58 liens distincts, **0 lien mort** |
| Traductions | ✅ 0 ligne en français sur les 10 pages contrôlées en anglais et les 10 en espagnol. Les contenus marqués `lang="fr"` (pages légales, à dessein) sont exclus |
| RE-02, RE-03, RE-04 | ✅ Aucun nom de client visible sur ces photos (contrôle visuel) |

### 3.2 Problèmes relevés en phase 3

#### A-11 🟠 Majeur — « En stock » affiché alors que le client n'a fourni aucun stock
- **Constat.** Les 8 produits qui ont un prix affichent le badge vert « En stock ». Or leur stock est inconnu (`stock_actuel: null` : le client n'a communiqué aucune quantité). La règle de calcul transforme « inconnu » en « en stock ».
- **Preuve.**
  - `lib/business-rules/stock-alerte.ts:9` et `:14` (`if (stockActuel === null) return "en_stock";`) ;
  - `lib/mock-data/stock.ts:14` ;
  - `components/product/StockBadge.tsx:8` ;
  - navigateur : badge « En stock » sur ES-01, ES-02, ES-04, ES-11, ES-13, ES-14, ES-15 et ES-18.
- **Impact pour ATC.** Le site affirme une disponibilité non confirmée. Un client peut payer un produit qui n'est pas en magasin. C'est contraire à la consigne « aucun stock inventé ».
- **Correction proposée.** Quand le stock n'est pas suivi : pas de badge, ou un badge neutre « Disponibilité à confirmer », jusqu'à ce que l'admin saisisse un stock.
- **Effort.** S

#### A-12 🟠 Majeur — Des notes internes du fichier client sont visibles sur les fiches
- **Constat.** Des textes destinés à l'équipe, et non aux acheteurs, sont publiés tels quels :

  | Réf. | Champ | Texte affiché |
  |---|---|---|
  | ES-24 | description | « Prévus dans le cahier des charges du site, mais absents des documents du client. » |
  | CL-S | description | « … comme l'assistance à l'installation prévue au cahier des charges. » |
  | ES-09 | caractéristiques | « 6,8 kW (seule donnée fournie) » |
  | ES-13 | caractéristiques | « (soit environ 100 Ah, déduit de 5,12 kWh à 51,2 V) » |
  | ES-22 | caractéristiques | « Rendu 3D uniquement » |
  | PK-05 | caractéristiques | « (schéma de la fiche SMA et photo) » et « Cible : Particuliers aisés, entreprises » |
  | PK-01 à PK-07 | caractéristiques | « Cible : … » (segmentation commerciale) |

- **Preuve.** `ATC-integration-site/ATC-integration/catalogue-data.json`, identique à `site-web/lib/mock-data/catalogue-atc.json` ; textes constatés sur les fiches dans le navigateur.
- **Impact pour ATC.** Image peu professionnelle devant le client. « Particuliers aisés » peut aussi être mal perçu par les visiteurs.
- **Correction proposée.** Faire réécrire ou supprimer ces passages par le client. En attendant, les masquer à l'affichage. *Décision antérieure de la commanditaire : textes laissés tels quels en attendant la réponse du client.*
- **Effort.** S

#### A-13 🟡 Mineur — Les caractéristiques d'ES-18 sont découpées au milieu d'une liste de chiffres
- **Constat.** « Capacités annoncées : 200, 230, 280, 314 Ah » est coupé à chaque virgule. La fiche affiche 4 lignes : « …Capacités annoncées : 200 », « 230 », « 280 », « 314 Ah ».
- **Preuve.**
  - `lib/services/caracteristiques.ts:23-24` (séparateur « virgule suivie d'un espace ») ;
  - liste rendue dans le navigateur : `["25,6 V. Pile de 4 modules : 400 × 659 × 1040 mm. Capacités annoncées : 200","230","280","314 Ah"]`.
- **Impact pour ATC.** Fiche illisible sur ce point.
- **Correction proposée.** Ne pas couper entre deux nombres, ou demander au client des caractéristiques séparées autrement.
- **Effort.** S

#### A-14 🟠 Majeur (🔴 avant la mise en ligne) — Toutes les coordonnées affichées sont des valeurs de démonstration
- **Constat.**
  - **WhatsApp :** le numéro `+509 2222 0000` est utilisé par le bouton « Demander un prix » (33 produits et 7 packages), par le support et par la page Contact.
  - **Magasin :** l'adresse de retrait « Route de Delmas 32, Port-au-Prince » est une valeur plausible mais inventée.
  - **Banque :** les coordonnées du virement sont fictives, mais le site le signale par un bandeau.
  - **E-mail :** aucune adresse e-mail d'ATC n'apparaît nulle part.
- **Preuve.**
  - `lib/constants/contact.ts:1-5` (le commentaire dit « à remplacer par le vrai numéro ») ;
  - `lib/constants/magasin.ts:1-3` ;
  - `lib/constants/banque.ts` ;
  - exploration : seuls contacts trouvés, `https://wa.me/50922220000` et `+509 2222 0000`.
- **Impact pour ATC.** Pour une démonstration, c'est acceptable. Une fois le site en ligne, chaque demande de prix et chaque demande de support part vers un numéro qui n'est pas celui d'ATC.
- **Correction proposée.** Remplacer les 3 constantes par les vraies valeurs, et ajouter un e-mail de contact. Rien d'autre à modifier : ces valeurs sont centralisées.
- **Effort.** S (dès réception des données)

#### A-15 🟡 Mineur — Données de démonstration restantes ou incohérentes avec le catalogue
- **Constat.**
  - **Accueil, avis clients :** « La climatisation **Carrier** fonctionne parfaitement… ». Aucun produit Carrier n'est au catalogue.
  - **FAQ caméras :** elle parle de « caméras PTZ et **sonnettes connectées** ». Les sonnettes ne sont plus vendues.
  - **SAV du client démo :** un ticket « le **panneau 405W** ne semble plus alimenter le **régulateur** » cite d'anciens produits de démonstration.
  - **Tableau de bord du client démo :** un moyen de paiement enregistré `j***@exemple.com`.
  - **Page de connexion :** un encadré « Comptes de démonstration » avec les identifiants. Utile pour la démonstration, mais à retirer avant la mise en ligne.
- **Preuve.**
  - `lib/mock-data/temoignages.ts:39` ;
  - `lib/mock-data/faq.ts:53` ;
  - `lib/store/sav-store.ts:67` ;
  - `lib/store/comptes-store.ts:133` ;
  - pages `/`, `/faq`, `/sav`, `/compte/tableau-de-bord`, `/compte/connexion` constatées dans le navigateur.
- **Impact pour ATC.** Incohérences visibles pendant la démonstration.
- **Correction proposée.** Réaligner ces données sur le vrai catalogue. Masquer l'encadré de démonstration en production.
- **Effort.** S

#### A-16 🟡 Mineur — Les CGV et la FAQ promettent une garantie « indiquée sur chaque fiche produit »
- **Constat.** L'article 6 des CGV et la FAQ annoncent 24 mois (solaire) et 12 mois (sécurité, climatisation), « le détail est indiqué sur chaque fiche produit ».
  - Les durées sont des valeurs de travail validées par ATC (décision n° 19, `lib/mock-data/garanties.ts:1`).
  - Mais **aucune fiche n'affiche de garantie** : aucune garantie n'existe pour les sous-catégories du catalogue réel, `garanties.ts:2-5`.
  - Les CGV citent aussi des « régulateurs », absents du catalogue.
- **Preuve.** `lib/mock-data/contenu-legal.ts:59` ; `lib/mock-data/faq.ts:34` ; contrôle des 41 fiches.
- **Impact pour ATC.** Une promesse inexacte dans un document contractuel.
- **Correction proposée.** Retirer « indiqué sur chaque fiche », ou afficher la garantie de la catégorie sur les fiches. Retirer « régulateurs ».
- **Effort.** S

#### A-17 🟡 Mineur (avant la mise en ligne) — Les mentions légales ne donnent pas les informations obligatoires
- **Constat.**
  - **Éditeur :** aucune raison sociale complète, adresse du siège, NIF ou téléphone, seulement « Coordonnées complètes disponibles auprès de notre support ».
  - **Hébergeur :** « Coordonnées de l'hébergeur communiquées sur demande ».
- **Preuve.** `lib/mock-data/contenu-legal.ts:119` et `:129`.
- **Impact pour ATC.** Non bloquant pour la démonstration. À compléter avant la mise en ligne : des clients de la diaspora, aux États-Unis, au Canada ou dans l'UE, sont visés par la politique de confidentialité.
- **Correction proposée.** Obtenir du client les informations légales et le nom de l'hébergeur (question Q3-1).
- **Effort.** S

#### A-18 🟡 Mineur — « Énergie solaire » au singulier et « Énergies solaires » au pluriel
- **Constat.** Le menu dit « Énergies solaires ». La page de la catégorie (titre « 24 produits dans Énergie solaire ») et le fil d'Ariane disent « Énergie solaire ».
- **Preuve.** `lib/mock-data/categories.ts:14` (`nom: "Énergie solaire"`) et `lib/i18n/dictionnaires/fr.json:3` (`"Énergies solaires"`). Sur `/categorie/energie-solaire` : 3 « Énergie solaire » pour 1 « Énergies solaires ».
- **Correction proposée.** Utiliser un seul libellé (celui du menu).
- **Effort.** S

#### A-19 🟡 Mineur — 80 images inutilisées (environ 7 Mo) restent publiques
- **Constat.** En plus de RE-01, HC-01 et HC-02 (A-10), 77 fichiers de `public/images` ne sont référencés nulle part, mais restent servis à leur adresse :
  - anciennes photos de démonstration : 33 photos de caméras PTZ et de sonnettes vidéo, 17 « energie-* », 10 « climatisation-* » ;
  - RE-02 à RE-04 ;
  - variantes de logo, dont deux PNG de 1,2 Mo.
- **Preuve.** Liste complète obtenue en recherchant chaque chemin dans `app/`, `components/` et `lib/`. Exemples : `public/images/securite/sonnette-video-*.webp`, `public/images/logo/logo-03-carte-bleue.png`.
- **Impact pour ATC.** Des images de produits qu'ATC ne vend pas restent publiées et indexables ; le dépôt est alourdi.
- **Correction proposée.** Supprimer de `public/` les images inutilisées, et les archiver hors du site.
- **Effort.** S

### 3.3 Non vérifié en phase 3

- **Orthographe et grammaire, de façon systématique :** aucun correcteur n'est disponible dans l'environnement d'audit. Le contrôle s'est limité aux mots-clés suspects. Une relecture humaine est recommandée, en français et surtout pour les traductions anglaises et espagnoles.
- **Droits d'utilisation des photos :** il faut la confirmation du client, notamment pour les visuels de fabricants.
- **Exactitude technique des descriptions :** il faut la validation du client. L'audit vérifie seulement qu'elles sont identiques à son fichier.

### 3.4 Questions de la phase 3

- **Q3-1.** Le client peut-il fournir les informations légales : raison sociale, adresse du siège, NIF, responsable de la publication, hébergeur, e-mail de contact ?
- **Q3-2.** Doit-on masquer dès maintenant les notes internes (A-12) et les badges « En stock » (A-11), sans attendre le client ?

> **Réponses de la commanditaire (1er novembre 2026) :**
> - **Q3-1 : Oui**, le client peut fournir les informations légales. A-17 est à traiter dès leur réception.
> - **Q3-2 : Oui**, on peut masquer dès maintenant les notes internes (A-12) et le badge « En stock » sans stock connu (A-11). Ces deux points passent dans le lot « avant la démo » du plan d'action (aucune correction pendant l'audit).

### 3.5 Bilan de la phase 3

| Gravité | Nombre | Problèmes |
|---|---|---|
| 🔴 Critique | 0 | — (A-14 deviendrait critique au moment de la mise en ligne) |
| 🟠 Majeur | 3 | A-11, A-12, A-14 |
| 🟡 Mineur | 6 | A-13, A-15, A-16, A-17, A-18, A-19 |
| ⚪ Suggestion | 0 | — |

---

## Phase 4 : parcours utilisateurs (testés dans le navigateur)

**Comment ça a été testé.**
- **Outil :** Playwright (Chromium), sur le serveur d'audit `next start -p 3005`.
- **Écrans :**
  - ordinateur : fenêtre de 1440 × 900 ;
  - téléphone : **émulation mobile** de 375 × 812 (`isMobile`, écran tactile), complétée par 390 × 844 et par une simple fenêtre étroite de 375 px pour les cas litigieux.
- **Comptes :** comptes de démonstration et comptes créés pendant le test.
- **Données :** les actions de l'admin (stock, barème, agent) modifient seulement la mémoire du serveur d'audit, qui a été redémarré ensuite. Aucun fichier n'a été modifié.

### 4.1 Résultats par parcours

| # | Parcours | Ordinateur | Téléphone | Détail |
|---|---|---|---|---|
| 1 | **Visiteur** : accueil, menu, catégorie, filtre, tri, fiche, variante, panier et favori refusés | ✅ | ✅ | Accueil et catégorie sans débordement. Menu mobile → Climatisation. Filtre « En stock uniquement » : 24 → 24 produits (tout le catalogue est « en stock », A-11). Tri par prix croissant correct. ES-01 en 650 W → $160.00. Messages « Connectez-vous pour ajouter ce produit à votre panier / à vos favoris » |
| 2 | **Client B2C** : inscription, reconnexion, mot de passe oublié | ✅ | ✅ | Compte créé puis reconnecté. Mot de passe oublié : « Si un compte existe avec cette adresse email, un lien de réinitialisation vient de lui être envoyé. » (aucun e-mail n'est réellement envoyé : démo) |
| 2 | **Client B2C** : ajout au panier, quantités, retrait et annulation | ✅ | ❌ | Ordinateur : ES-13 ×2 + ES-01 650 W = $2460.00 HT ; +1 / −1 corrects ; retrait puis annulation OK. **Téléphone : page du panier plus large que l'écran, bouton de paiement inaccessible (A-20)**. Retirer le dernier article n'offre pas d'annulation (A-22) |
| 2 | **Client B2C** : paiement carte ou MonCash, confirmation, reçu, historique | ✅ | ✅* | Carte (formulaire complet) : $2706.00 = 2460 + 10 %. Confirmation : sous-total, taxe (10 %), total $2706.00. Reçu avec taxe de 10 %. Commande visible dans « Mes commandes ». *Téléphone : testé en déclenchant le bouton par programme (voir A-20) ; MonCash, confirmation et reçu fonctionnent, et toutes ces pages font 375 px |
| 2 bis | **Virement bancaire** (testé le même jour, après son ajout) | ✅ | — | 27 contrôles réussis : coordonnées, preuve obligatoire, file d'attente admin, validation et refus avec motif, commande validée puis visible chez le client, version anglaise |
| 3 | **Produit sans prix** (ES-03) | ✅ | ✅ | « Prix sur demande », aucun bouton panier, « Demander un prix » ouvre WhatsApp dans un nouvel onglet avec un message prérempli (référence et nom) |
| 4 | **B2B** : demande de compte en 4 étapes | ✅ | ✅ (largeur) | Indicateur d'étapes : Inscription → Documents → Vérification → Activation. Bouton « Continuer » inactif tant que les champs obligatoires sont vides. Fichier `.exe` refusé (« Format non supporté… »). Avant validation, aucun tarif B2B affiché. L'admin approuve et le statut passe à « B2B vérifié ». **Mais l'admin ne peut pas consulter les documents (A-26)** |
| 4 | **B2B** : paliers et total selon la quantité | ✅ | — | ES-13 rendu éligible au barème dans l'admin, pour le test. Tableau 1–9 $1150 / 10–49 $1058 / 50+ $977.50 ; à 10 unités → $1058.00, total $10580.00. Valeurs par défaut −8 % / −15 % confirmées (A-06). **A-05 reproduit** : 5 puis 5 unités → panier à $1150/unité au lieu de $1058 (**$920 de trop**) |
| 4 | **B2B** : facture pro forma | ✅ | — | FP-2026-0001 : sous-total HT $11500.00, taxe (10 %) $1150.00 |
| 5 | **Créer son propre package** → devis J+3 | ✅ | ✅ (largeur) | Les produits sans prix sont désactivés. Récapitulatif « 4 élément(s) $4601.00, estimation indicative ». Devis `en_attente` créé. L'admin répond (installation $500). Côté client : « Expire dans 3 jours », 72 h exactement entre la réponse et l'expiration, prix $5101. **Les produits à variantes sont ajoutés sans choix de variante (A-21)** |
| 6 | **Admin général** : connexion, agents, stock, catalogue | ✅ | ✅ (largeur, sauf tableau de bord : A-25) | Agent « Marie Claire Joseph » → code **MCJ-ATC-001** généré automatiquement, non modifiable. Stock ES-11 : entrée de 40 → « Stock faible » (orange, 40 %) ; sortie de 25 → « Stock critique » (rouge, 15 %) ; sortie de 15 → « Rupture de stock », bouton panier retiré. Les marques proposées dans le formulaire produit sont fictives (A-24) |
| 6 | **Agent SAV** : droits | ⚠️ | — | Menu : Tableau de bord, Devis, Commandes, Clients, **Avis clients**, Assistance/SAV, **Contenu**. Pages bloquées par URL : catalogue, stock, packages, virements, statistiques, rapports, paramètres, comptes, agents SAV. **Ouvertes par URL alors qu'elles ne devraient pas l'être : `/admin/transactions` (A-02), `/admin/avis` et `/admin/contenu` (A-03)**. Les deux constats de la phase 2 sont confirmés dans le navigateur |
| 7 | **Chatbot et WhatsApp** | ⚠️ | — | « Quels moyens de paiement acceptez-vous ? » → bonne réponse. « Avez-vous des pompes à eau solaires ? » → réponse de la FAQ installation au lieu du message de repli (A-23). Le lien WhatsApp de la page Contact pointe vers le numéro de démonstration (A-14) |
| — | Erreurs JavaScript (console) | ✅ | ✅ | **0 erreur** sur l'ensemble des parcours |

### 4.2 Problèmes relevés en phase 4

#### A-20 🔴 Critique — Sur téléphone, le panier est plus large que l'écran et le bouton de paiement devient inaccessible
- **Constat.** Sur la page Panier, et seulement sur cette page, le nom du produit, forcé sur une seule ligne, élargit la grille au lieu d'être coupé avec des points de suspension. Sur un écran de 375 px, la page mesure **409 px** (ES-13, nom court), **467 px** (ES-11) et jusqu'à **755 px** (ES-01 ou ES-04, noms longs). Conséquences :
  - le prix et la corbeille de chaque ligne sortent de l'écran ;
  - en émulation mobile, la barre « Procéder au paiement — $… », qui devrait rester en bas de l'écran, est repoussée hors de la zone visible (y = 1575 px pour un écran de 812 px) ;
  - **elle ne peut pas être touchée, pour aucun des 3 produits testés, sur 375 px comme sur 390 px.**

  C'est le seul bouton de paiement sur téléphone : celui de l'ordinateur est masqué (`lg:flex`).
- **Preuve.**
  - `components/panier/PanierContenu.tsx:109` (`grid gap-8 … lg:grid-cols-[1fr_320px]` : aucune colonne `minmax(0,1fr)` ni `min-w-0` sur téléphone) ;
  - `:143` (lien du nom en `truncate`) ;
  - `:209-217` (barre fixe sur téléphone) ;
  - mesures dans le navigateur : `innerWidth` passe de 375 à 409 / 467 / 685 / 755 sur `/panier` uniquement ; toutes les autres pages publiques restent à 375 ;
  - repère de comparaison : dans une simple fenêtre de 375 px sans émulation, la page défile horizontalement de 33 px mais le bouton reste cliquable.
- **Impact pour ATC.** Un client sur téléphone (la majorité du trafic attendu en Haïti) risque de ne pas pouvoir payer son panier : c'est un achat bloqué.
- **Correction proposée.** Ajouter `min-w-0` (ou `grid-cols-[minmax(0,1fr)]`) à la colonne des articles, et `block` sur le lien du nom pour que `truncate` coupe le texte.
- **Effort.** S
- **À confirmer** sur un vrai téléphone (Safari iOS, Chrome Android) : voir 4.3.

#### A-21 🟠 Majeur — Le configurateur ajoute les produits à variantes sans demander laquelle
- **Constat.** Dans « Créer son propre package », le panneau Trina (630 / 645 / 650 W), les onduleurs Solis (6 à 16 kW), les batteries Unity+ (16 / 17 kWh) et les batteries 25,6 V (noire / jaune) s'ajoutent sans choix de variante. Le devis enregistre le produit générique au prix de sa variante la moins chère. Exemple de devis créé : `ES-04×1, ES-13×2, ES-01×1`, estimé à $4601.00 = 2150 (Solis 6 kW) + 2 × 1150 + 151 (Trina 630 W).
- **Preuve.**
  - `components/packages/ConfigurateurPackage.tsx:40` (`produit.prix_public`) ;
  - lignes du devis lues dans le stockage du navigateur pendant le test ;
  - récapitulatif affiché « 4 élément(s) sélectionné(s) $4601.00 ».
- **Impact pour ATC.** Le devis ne dit pas quelle puissance le client veut, alors qu'un onduleur de 6 kW et un de 16 kW n'ont rien à voir ($2150 contre $3500). L'estimation affichée au client est fausse s'il pense à une autre version.
- **Correction proposée.** Proposer un sélecteur de variante dans le configurateur, et enregistrer l'identifiant de variante dans la ligne du devis.
- **Effort.** M

#### A-22 🟡 Mineur — Retirer le dernier article du panier ne permet pas d'annuler
- **Constat.** Retirer un article affiche normalement « Produit retiré du panier — Annuler ». Quand c'est le **dernier** article, la page passe directement à « Votre panier est vide » et le message n'apparaît pas.
- **Preuve.** `components/panier/PanierContenu.tsx:96-106` (retour anticipé sur le panier vide) avant le `<Toast>` de la ligne `:219`. Constaté sur téléphone avec un panier d'un seul article.
- **Correction proposée.** Afficher le message aussi dans l'état « panier vide ».
- **Effort.** S

#### A-23 🟡 Mineur — Le chatbot répond à côté au lieu d'orienter vers le support
- **Constat.** À la question « Avez-vous des pompes à eau solaires ? », le chatbot répond par la FAQ sur l'installation (« Notre équipe interne assure l'assistance à l'installation… »). Il aurait dû donner son message de repli, qui oriente vers un conseiller.
- **Preuve.** Constaté dans le navigateur sur l'accueil (chatbot ouvert, question saisie). La correspondance se fait sur des mots comme « solaires » (`components/layout/Chatbot.tsx`, recherche par mots-clés).
- **Impact pour ATC.** Une réponse hors sujet donne une image peu fiable du support.
- **Correction proposée.** Exiger un score de correspondance minimal plus élevé, ou plusieurs mots significatifs en commun, avant de répondre par une FAQ.
- **Effort.** S

#### A-24 🟡 Mineur — Le formulaire produit de l'admin ne propose que des marques fictives
- **Constat.** La liste « Marque » contient « SolarMax », « EcoTech Energy », « SecurVisio »…, et non les marques réelles du catalogue (Trina Solar, SMA, Solis, Deye, Schneider, ATESS, PYTES, Unity+, WAVER, Mitsubishi Electric…).
- **Preuve.** Fenêtre de modification d'ES-13 dans `/admin/catalogue` ; `lib/mock-data/marques.ts`.
- **Correction proposée.** Remplacer la liste par les marques réelles.
- **Effort.** S

#### A-25 🟡 Mineur — Le tableau de bord de l'admin déborde légèrement sur téléphone
- **Constat.** `/admin` mesure 388 px sur un écran de 375 px. Les 13 autres pages admin contrôlées tiennent dans 375 px.
- **Preuve.** Mesure de `innerWidth` dans le navigateur (émulation mobile, 375 px). Détail en phase 5.
- **Effort.** S

#### A-26 🟠 Majeur — L'admin valide un compte Entreprise sans pouvoir consulter ses documents
- **Constat.** À l'étape 2, le client « téléverse » sa patente, son NIF et sa pièce d'identité. Mais seuls le **nom et la taille** des fichiers sont enregistrés, et la fiche client de l'admin n'affiche aucun document. L'étape 3, « l'administrateur examine… les documents » (RG-08-001), ne peut donc pas être faite : l'approbation se fait à l'aveugle.
- **Preuve.**
  - `lib/store/comptes-store.ts:36-40` (`DocumentTeleverse` = type, nom, taille) ;
  - `components/admin/GestionClients.tsx` : aucune référence à `nom_fichier` ni à un lien de document ;
  - en comparaison, les preuves de virement sont bien conservées (aperçu en data URL) et consultables par l'admin.
- **Impact pour ATC.** Le tarif professionnel peut être accordé sans vérification réelle : risque de fraude au tarif B2B.
- **Correction proposée.** En démo : conserver une version du fichier, comme pour les preuves de virement, et l'afficher dans la fiche client. Avec le vrai backend : stockage de fichiers et lien sécurisé.
- **Effort.** M

#### Mises à jour de problèmes déjà ouverts
- **A-02** et **A-03** : confirmés dans le navigateur. Un agent SAV ouvre `/admin/transactions`, `/admin/avis` et `/admin/contenu`, et les deux derniers figurent même dans son menu.
- **A-05** : reproduit dans le navigateur. Client B2B, ES-13 avec paliers : 5 + 5 unités → `prix_unitaire_applique: 1150` au lieu de 1058, soit **$920 facturés en trop** pour 10 batteries. Reste latent tant qu'aucun palier réel n'est saisi.
- **A-11** : le filtre « En stock uniquement » ne retire aucun produit (24 → 24), car tous sont considérés « en stock ».

### 4.3 Non vérifié en phase 4

- **Vrais téléphones** (Safari iOS, Chrome Android) : seule l'émulation Chromium était disponible. Le comportement d'A-20 doit être confirmé sur un appareil réel. Chrome Android peut dézoomer une page trop large, ce qui rendrait le bouton visible mais minuscule.
- **Envoi réel d'e-mails** (mot de passe oublié, notifications) : non implémenté dans la démo (pas de backend).
- **Paiements réels** (MonCash, PayPal, carte) : sandbox de démonstration, la transaction réussit toujours (décision n°41).
- **Parcours B2B, configurateur et admin sur téléphone :** seule la largeur des pages a été mesurée ; ils ont été déroulés en entier sur ordinateur.

### 4.4 Questions de la phase 4

- **Q4-1.** Dans « Créer son propre package », le client doit-il choisir la variante (puissance, capacité), ou l'équipe ATC la choisit-elle lors de sa réponse au devis ?
- **Q4-2.** Pour la démonstration, faut-il que l'admin puisse ouvrir les documents d'un dossier Entreprise (A-26), ou est-ce reporté au vrai backend ?

> **Réponses de la commanditaire (1er novembre 2026) :**
> - **Q4-1 :** le client **doit pouvoir choisir la variante** (puissance, capacité) dans le configurateur. **A-21 est confirmé.**
> - **Q4-2 :** la consultation des documents Entreprise est **reportée au vrai backend**. A-26 garde sa gravité, mais passe dans le lot « plus tard » du plan d'action.

### 4.5 Bilan de la phase 4

| Gravité | Nombre | Problèmes |
|---|---|---|
| 🔴 Critique | 1 | A-20 |
| 🟠 Majeur | 2 | A-21, A-26 (+ A-02, A-03, A-05 confirmés) |
| 🟡 Mineur | 4 | A-22, A-23, A-24, A-25 |
| ⚪ Suggestion | 0 | — |

---

## Phase 5 : interface, téléphone et accessibilité

**Comment ça a été vérifié.**
- **Pages :** 23 pages (15 publiques dont une 404, 5 du client connecté, 3 de l'admin), plus la page de paiement.
- **Largeurs :** 375 et 768 px en émulation mobile ; 1440 px.
- **Accessibilité automatique :** **axe-core 4.10**, injecté dans la page depuis le CDN (rien installé dans le projet), règles WCAG 2.0, 2.1 et 2.2 de niveaux A et AA.
- **Clavier :** 25 tabulations sur l'accueil.
- **Polices et couleurs :** valeurs calculées par le navigateur.
- **États particuliers :** pages vides, d'erreur et 404.

### 5.1 Ce qui est conforme

| Contrôle | Résultat |
|---|---|
| Largeur 768 px (tablette) | ✅ Aucune des 23 pages ne déborde |
| Largeur 1440 px | ✅ Aucune page ne déborde |
| Largeur 375 px | ✅ 21 pages sur 23 tiennent dans l'écran ; seuls `/panier` (409 px, A-20) et `/admin` (388 px, A-25) débordent |
| Menu mobile | ✅ Bouton « Ouvrir le menu » avec `aria-expanded`, les 4 catégories, bouton « Fermer » |
| Langue | ✅ `<html lang="fr">` sur toutes les pages françaises |
| Titres | ✅ Un seul `h1` par page sur les 24 pages. Un niveau sauté sur `/categorie/…` et `/recherche` (voir A-28) |
| Images | ✅ axe ne relève aucune image sans texte alternatif |
| Focus clavier | ✅ **25 éléments sur 25** ont un indicateur de focus visible. L'ordre de tabulation est logique : logo → langue → compte → recherche → panier → catégories → contenu |
| Polices | ✅ Titres en Clash Display, texte en General Sans (Stardom sur le titre de la bannière d'accueil, accepté en phase 2) |
| Couleurs de marque | ✅ Boutons principaux en `#FE4028`, boutons secondaires en `#014DAB`, accents en `#018DDE` |
| États vides | ✅ Panier vide : « Votre panier est vide — Retour au catalogue ». Recherche sans résultat : « 0 résultats pour « zzzz » — Aucun résultat — Essayez un autre terme ou parcourez nos catégories depuis le menu. » |
| Messages d'erreur | ✅ Clairs, en français : « Aucun compte ne correspond à cet email. », « Format non supporté pour "virus.exe" — formats acceptés : PDF, JPG, PNG. », « Commande introuvable. » |

### 5.2 Problèmes relevés en phase 5

#### A-27 🟠 Majeur — Contraste insuffisant sur les boutons principaux et plusieurs textes de couleur
- **Constat.** axe relève **91 éléments en contraste insuffisant, sur 24 pages**. Les principaux cas :

  | Couleurs | Ratio (requis 4,5:1) | Exemples |
  |---|---|---|
  | Texte blanc sur orange `#FE4028` (14 px, semi-gras) | **3,51** | « Ajouter au panier », « Payer maintenant », « Composer mon système solaire » |
  | Bleu clair `#018DDE` sur `#F7F8FA` (16 px) | **3,36** | Lien « Packages solaires » du menu |
  | Orange `#FE4028` sur `#F7F8FA` (14 px) | **3,30** | Sur-titre « ÉNERGIE SOLAIRE · INSTALLATION INCLUSE » |
  | Badges de statut, texte de 12 px (vert, rouge, gris sur fond teinté) | **4,19 à 4,48** | « En stock », « Accepté », « Expiré », « En attente », « Modifier » |

- **Preuve.** Analyse axe-core (règle `color-contrast`) ; couleurs calculées du bouton « Ajouter au panier » : `rgb(255,255,255)` sur `rgb(254,64,40)`, 14 px, graisse 600 ; couleurs définies dans `app/globals.css:5-11`.
- **Impact pour ATC.** Les boutons d'achat sont moins lisibles pour les personnes malvoyantes, et en plein soleil sur téléphone, un usage courant en Haïti. C'est une non-conformité WCAG AA sur l'élément le plus important du site.
- **Correction proposée, sans changer la charte :**
  - texte des boutons orange en **18,66 px gras** au minimum (le seuil passe alors à 3:1, que 3,51 respecte), ou une nuance d'orange plus foncée réservée aux boutons avec texte ;
  - texte d'accent en `#014DAB` plutôt qu'en `#018DDE` ;
  - textes des badges légèrement plus foncés.
- **Effort.** S à M. Voir la question Q5-1.

#### A-28 🟡 Mineur — Quelques défauts de formulaire et d'ARIA
- **Constat.**
  - Le curseur « Prix maximum » des filtres n'a pas de libellé associé. axe le classe **critique**, car un lecteur d'écran l'annonce sans nom.
  - Les étoiles des avis portent un `aria-label` sur une `div` sans rôle : 6 éléments sur l'accueil. Le texte n'est pas lu.
  - Les messages d'erreur (connexion, formulaires) n'ont ni `role="alert"` ni zone `aria-live` : un lecteur d'écran ne les annonce pas.
  - Sur `/categorie/…` et `/recherche`, un niveau de titre est sauté entre le `h1` de la page et les titres des cartes produit.
- **Preuve.** `components/product/CatalogueBrowser.tsx:224` (`type="range"`) ; `components/product/Etoiles.tsx:6` ; page de connexion : 0 élément `role=alert` ou `aria-live` après l'erreur ; analyse axe (`label`, `aria-prohibited-attr`).
- **Correction proposée.** Ajouter un `aria-label` au curseur, `role="img"` sur le conteneur des étoiles et `role="alert"` sur les messages d'erreur ; corriger le niveau de titre des cartes.
- **Effort.** S

#### A-29 🟡 Mineur — Navigation au clavier incomplète : pas de lien d'évitement, Échap sans effet
- **Constat.**
  - Il n'y a pas de lien « Aller au contenu » en début de page : il faut 9 tabulations pour sortir de l'en-tête.
  - Le menu mobile et le chatbot ne se ferment pas avec la touche Échap.
  - À l'ouverture du chatbot au clavier, le focus reste sur le bouton au lieu d'aller dans le champ de saisie.
- **Preuve.** Test clavier ; aucun gestionnaire `Escape` dans `components/layout/Header.tsx` ni dans `components/layout/Chatbot.tsx` (la modale `components/ui/Modal.tsx` en a un). Mesures : après Échap, le menu mobile reste visible et le chatbot garde `aria-expanded="true"`.
- **Correction proposée.** Ajouter un lien d'évitement, gérer Échap et déplacer le focus à l'ouverture.
- **Effort.** S

#### A-30 🟡 Mineur — Page 404 par défaut de Next.js, en anglais ; pages introuvables renvoyées en HTTP 200
- **Constat.**
  - Une adresse inexistante affiche « **404 — This page could not be found.** », en anglais, sans lien de retour ni recherche. Exemples : `/page-inexistante`, `/produit/inexistant`, `/categorie/inexistante`, `/facture/inexistante`.
  - À l'inverse, `/commande/inexistante`, `/commande/inexistante/recu` et `/paiement/commande/inexistante` affichent « introuvable » mais avec un code **HTTP 200**, ce qu'on appelle une « soft 404 ».
  - Il n'y a pas non plus d'écran de chargement ni d'écran d'erreur propres au site : en cas d'erreur JavaScript, c'est l'écran générique de Next.js, en anglais.
- **Preuve.** `app/not-found.tsx`, `app/error.tsx` et `app/loading.tsx` sont absents (aucun résultat dans `app/`) ; captures et codes HTTP relevés dans le navigateur.
- **Correction proposée.** Créer une page `not-found.tsx` traduite, avec liens vers l'accueil et les catégories, une page `error.tsx` traduite, et appeler `notFound()` pour les commandes et paiements introuvables.
- **Effort.** S

#### A-31 🟡 Mineur — Sur tablette (768 px), le bouton du chatbot masque du contenu et la bannière d'accueil laisse un vide
- **Constat.**
  - Le bouton flottant du chatbot recouvre le nom d'une carte produit (« Onduleur photovoltaïq… ») sur la page catégorie.
  - Sur l'accueil, à 768 px, les deux cartes produit qui « flottent » sous la bannière sont espacées d'un grand vide, car elles sont positionnées pour un grand écran.
- **Preuve.** Captures à 768 × 1024 de `/` et `/categorie/energie-solaire`. `components/home/BanniereSolaire.tsx:52` (`md:hidden`) et `:70` (`hidden md:block`) : la disposition pour grand écran s'applique dès 768 px.
- **Correction proposée.** Faire basculer la disposition de la bannière au point de rupture `lg` ; réserver une marge en bas des listes, ou réduire le bouton du chatbot sur tablette.
- **Effort.** S

#### A-32 ⚪ Suggestion — Agrandir certaines zones tactiles
- **Constat.** À 375 px, plusieurs liens en texte font 20 px de haut : fil d'Ariane, liens du pied de page, « Mot de passe oublié ? », « Créer un compte », « Comptes de démonstration ». C'est en dessous de 24 px, mais WCAG 2.5.8 tolère ce cas grâce à l'espacement entre les liens. La recommandation pour le tactile reste 44 px. Sur l'accueil, 31 éléments sur 49 mesurent entre 24 et 43 px.
- **Preuve.** Mesure des zones des éléments interactifs visibles, sur 5 pages à 375 px.
- **Correction proposée.** Ajouter de la marge intérieure verticale aux liens du pied de page et des formulaires.
- **Effort.** S

#### Mises à jour de problèmes déjà ouverts
- **A-20** : confirmé, `/panier` est la seule page publique qui déborde à 375 px. Elle ne déborde pas à 768 px.
- **A-25** : confirmé, `/admin` mesure 388 px pour 375 px.

### 5.3 Non vérifié en phase 5

- **Lecteur d'écran réel** (NVDA, VoiceOver) : seules des analyses automatiques et des tests au clavier ont été faits.
- **Messages de validation natifs du navigateur** : ils s'affichent dans la langue du navigateur. Avec le navigateur d'audit, réglé en anglais, on lit « Please fill out this field. ». Chez un visiteur francophone, ce message sera en français : ce n'est pas un défaut du site.
- **Zoom à 200 % et mode « texte agrandi »** : non testés.

### 5.4 Question de la phase 5

- **Q5-1.** Pour corriger le contraste des boutons orange (A-27), préfères-tu agrandir et épaissir leur texte, ou utiliser une nuance d'orange plus foncée pour les boutons, à faire valider par le client ?

> **Réponse de la commanditaire (1er novembre 2026) :**
> - **Q5-1 : on laisse tel quel.** Les couleurs et la taille du texte des boutons sont conservées. **A-27 est clos par décision**, avec un risque accepté : non-conformité WCAG AA sur le contraste. À réévaluer si le site doit un jour respecter une obligation d'accessibilité.

### 5.5 Bilan de la phase 5 (après réponse)

| Gravité | Nombre | Problèmes |
|---|---|---|
| 🔴 Critique | 0 | — (A-20 confirmé) |
| 🟠 Majeur | 0 | — |
| Clos par décision | 1 | A-27 (contraste conservé) |

---

## Phase 6 : performance et référencement

**Comment ça a été mesuré.**
- **Outil :** Lighthouse 12.8.2, installé **dans le dossier temporaire de l'audit** (hors projet, `package.json` inchangé). Il utilise le Chromium de Playwright.
- **Profils :** profil mobile par défaut (CPU ralenti ×4, réseau 4G lente) et profil ordinateur.
- **Serveur :** serveur d'audit `next start -p 3005`.
- **Compléments :** en-têtes HTML lus page par page ; analyse des fichiers JavaScript du build.

### 6.1 Scores Lighthouse

| Page | Profil | Performance | Accessibilité | Bonnes pratiques | SEO | FCP | LCP | TBT | CLS | Poids |
|---|---|---|---|---|---|---|---|---|---|---|
| Accueil | mobile | **35** | 92 | 100 | 100 | 3,1 s | 5,9 s | 4,0 s | 0 | 575 Kio |
| Accueil | ordinateur | 57 | 92 | 100 | 100 | 1,1 s | 1,6 s | 2,8 s | 0 | 673 Kio |
| Catégorie (Énergie solaire) | mobile | **42** | 95 | 100 | 100 | 2,7 s | 5,2 s | 5,7 s | 0 | 450 Kio |
| Catégorie (Énergie solaire) | ordinateur | 55 | 91 | 100 | 100 | 1,0 s | 1,7 s | 1,4 s | 0,002 | 454 Kio |
| Fiche ES-01 | mobile | **48** | 96 | 100 | 100 | 2,4 s | 4,4 s | 3,5 s | 0 | 406 Kio |
| Fiche ES-01 | ordinateur | 74 | 96 | 100 | 100 | 0,9 s | 1,4 s | 0,4 s | 0 | 404 Kio |

> ⚠️ **Fiabilité des mesures mobiles.** Lighthouse a relevé un indice de puissance machine (`benchmarkIndex`) de **114** pendant les mesures mobiles, contre **656** pendant les mesures ordinateur. Un PC ordinaire est entre 1 000 et 2 000. La machine d'audit était donc très chargée : les scores mobiles sont **nettement plus mauvais que la réalité**. Leur tendance reste cohérente avec les mesures ordinateur. Il faudra refaire la mesure sur une machine dédiée, ou avec PageSpeed Insights une fois le site en ligne.

### 6.2 Ce qui est conforme

| Contrôle | Résultat |
|---|---|
| Images | ✅ Toutes les images du catalogue passent par `next/image` (10 fichiers l'utilisent), en formats modernes (audit `modern-image-formats` réussi). Les images hors écran sont différées, l'image principale (LCP) est prioritaire et chargée sans différé. Les 4 balises `<img>` restantes affichent des aperçus de fichiers en data URL, ce qui est justifié |
| Polices | ✅ `next/font/local` avec `display: swap` (`lib/fonts/clash-display.ts`). 3 fichiers WOFF2, 87 Kio au total (Clash Display 29, General Sans 38, Stardom 20) |
| Poids des pages | ✅ De 404 à 673 Kio. Accueil sur ordinateur : scripts 252 Kio, images 256 Kio, polices 87 Kio, CSS 9 Kio |
| Stabilité de la mise en page (CLS) | ✅ 0 à 0,002 sur toutes les pages |
| Compression et minification | ✅ Audits `uses-text-compression` et `unminified-javascript` réussis |
| Bonnes pratiques | ✅ 100 sur les 6 mesures |
| URL lisibles | ✅ `/categorie/energie-solaire`, `/produit/panneau-solaire-haute-performance-trina-solar-vertex-n-630-a-650-w`, `/packages/kit-residentiel-solis-pytes-v16` |
| Langue | ✅ `<html lang="fr">` |
| SEO technique de base (Lighthouse) | ✅ 100. Attention : ce score ne vérifie ni l'unicité des titres, ni le sitemap, ni Open Graph (voir A-33 et A-34) |

### 6.3 Problèmes relevés en phase 6

#### A-33 🟠 Majeur — Toutes les pages ont le même titre et la même description, sans aperçu de partage
- **Constat.**
  - Les 10 pages contrôlées (accueil, catégorie, fiche produit, packages, fiche package, FAQ, contact, à propos, CGV, recherche) ont toutes le titre « **ATC — Alpha Tech Center** » et la même description.
  - Il n'y a **aucune balise Open Graph** (`og:title`, `og:image`…).
  - Il n'y a pas d'URL canonique.
- **Preuve.** `app/layout.tsx:19-22` : un seul `generateMetadata`, au titre fixe ; aucune page de `app/` n'exporte de `metadata` ni de `generateMetadata`. En-têtes HTML relevés sur les 10 pages.
- **Impact pour ATC.**
  - Google ne peut pas distinguer les fiches produit dans ses résultats.
  - Surtout, **un lien de produit partagé sur WhatsApp ou Facebook n'affiche ni le nom, ni la photo, ni le prix**. Or WhatsApp est le canal de vente principal d'ATC (« Demander un prix », support).
- **Correction proposée.** Ajouter un `generateMetadata` par page dynamique (produit, package, catégorie) : titre « Nom du produit — ATC », description, `openGraph.images` avec la photo du produit, URL canonique. Ajouter des titres statiques pour les autres pages.
- **Effort.** M

#### A-34 🟡 Mineur — Ni `sitemap.xml` ni `robots.txt`, et les pages privées sont indexables
- **Constat.**
  - `/sitemap.xml` et `/robots.txt` renvoient 404.
  - Aucune page n'a de balise `robots` : `/admin`, `/panier`, `/compte/connexion`, `/recherche`, `/paiement/…` et `/commande/…` sont ouvertes à l'indexation.
- **Preuve.** Requêtes HTTP sur le serveur d'audit ; aucun fichier `app/sitemap.ts` ni `app/robots.ts` ; aucune balise `<meta name="robots">` dans le HTML de ces pages.
- **Correction proposée.**
  - `app/sitemap.ts`, générée à partir des produits, packages et catégories ;
  - `app/robots.ts`, qui exclut `/admin`, `/compte`, `/panier`, `/paiement`, `/commande`, `/facture`, `/devis` et `/recherche` ;
  - `robots: { index: false }` dans les métadonnées de ces pages.
- **Effort.** S

#### A-35 🟡 Mineur (mesure à refaire) — Trop de JavaScript exécuté au chargement
- **Constat.**
  - Le temps de blocage (TBT) atteint 2,8 s sur l'accueil en profil ordinateur, et 3,5 à 5,7 s en mobile (mesure pessimiste, voir 6.1).
  - Lighthouse relève 4,3 à 7 s d'exécution de scripts sur mobile, 20 tâches longues, 51 Kio de JavaScript inutilisé et 13 Kio de JavaScript « ancien ».
  - Principales causes repérées dans le build :
    - **le catalogue complet est envoyé au navigateur**, avec les comptes de démonstration (chunk `2ly6r07ub-w8e.js`, 61 Ko) ;
    - **les dictionnaires des 3 langues** sont envoyés à chaque visiteur, quelle que soit sa langue (chunk `2l6jp6tfod6zh.js`, 85 Ko) ;
    - beaucoup de composants sont rendus côté navigateur ;
    - les animations framer-motion.
  - Par ailleurs, toutes les pages sont rendues à la demande, sans cache possible, parce que la langue est lue dans un cookie (build : toutes les routes sont `ƒ (Dynamic)`).
- **Preuve.** Rapports Lighthouse (`bootup-time`, `mainthread-work-breakdown`, `unused-javascript`, `long-tasks`) ; contenu des fichiers `.next/static/chunks/*.js` (recherche de chaînes : « Batterie PYTES », « Bank transfer », « Transferencia bancaria », « particulier.demo@atc-demo.ht ») ; liste des routes dans le journal du build.
- **Impact pour ATC.** Un site lent sur les téléphones d'entrée de gamme et en 3G/4G, ce qui est fréquent en Haïti.
- **Correction proposée.**
  - charger seulement le dictionnaire de la langue active ;
  - garder les données du catalogue côté serveur et ne transmettre au navigateur que ce qu'une page affiche ;
  - réduire les animations sur mobile ;
  - **re-mesurer** sur une machine dédiée avant d'aller plus loin.
- **Effort.** M

#### A-36 ⚪ Suggestion — Données structurées
- **Constat.** Aucune page ne contient de JSON-LD : ni `Product` (nom, image, prix en USD, disponibilité), ni `Organization` / `LocalBusiness`, ni `BreadcrumbList`.
- **Correction proposée.** Ajouter du JSON-LD `Product` sur les fiches qui ont un prix, `LocalBusiness` sur l'accueil et la page Contact, et `BreadcrumbList`.
- **Effort.** S

#### A-37 ⚪ Suggestion — Versions anglaise et espagnole invisibles pour les moteurs de recherche
- **Constat.** La langue est choisie par cookie, sur la **même URL**. Un moteur de recherche ne voit que la version française. Il n'y a pas de balise `hreflang`.
- **Preuve.** `lib/i18n/serveur.ts` (lecture du cookie `atc-langue`) ; aucune balise `hreflang` dans le HTML.
- **Impact pour ATC.** Une partie de la diaspora (États-Unis, Amérique latine) ne trouvera pas le site en cherchant en anglais ou en espagnol.
- **Correction proposée.** Si l'acquisition en anglais ou en espagnol compte, préfixer les URL par la langue (`/en/…`, `/es/…`) et ajouter `hreflang`. Sinon, garder le fonctionnement actuel.
- **Effort.** L

#### A-38 ⚪ Suggestion — Petits gains sur les images
- **Constat.** Lighthouse estime 14 à 54 Kio d'économie possible sur des images servies trop grandes : logo `logo-02.png` servi en 384 px, vignettes SE-01 et CL-06 servies en 384 px.
- **Correction proposée.** Ajuster l'attribut `sizes` des `next/image` concernés.
- **Effort.** S

### 6.4 Non vérifié en phase 6

- **Performance sur une machine non chargée et sur de vrais téléphones :** voir l'avertissement en 6.1.
- **Performance en production derrière un CDN** (temps de réponse, cache) : le site n'est pas déployé.

### 6.5 Question de la phase 6

- **Q6-1.** Les versions anglaise et espagnole doivent-elles être trouvables sur Google (A-37, effort important), ou servent-elles seulement aux visiteurs déjà sur le site ?

> **Réponse de la commanditaire (1er novembre 2026) :**
> - **Q6-1 : « On doit l'avoir sur le site. »** Interprétation retenue : les versions anglaise et espagnole doivent être **disponibles sur le site** (c'est déjà le cas), sans exigence de référencement Google. **A-37 reste une simple suggestion**, à ne pas traiter pour l'instant.

### 6.6 Bilan de la phase 6

| Gravité | Nombre | Problèmes |
|---|---|---|
| 🔴 Critique | 0 | — |
| 🟠 Majeur | 1 | A-33 |
| 🟡 Mineur | 2 | A-34, A-35 |
| ⚪ Suggestion | 3 | A-36, A-37, A-38 |

---

## Phase 7 : sécurité et qualité du code

**Comment ça a été vérifié.**
- **Recherche de secrets :** dans le code et dans **tout l'historique Git** (57 commits).
- **Attaques simulées sur le serveur d'audit** (port 3005, données en mémoire, redémarré aussitôt après) :
  - appel direct, sans session, à des Server Actions ;
  - session falsifiée dans le navigateur ;
  - prix modifié dans le panier ;
  - connexion avec un mot de passe quelconque.
- **Dépendances :** `npm audit`, en lecture seule.
- **Qualité :** analyse statique du code et du build.

> **Rappel de la décision 1.7 :** il n'y a pas encore de backend. Les protections côté serveur sont donc notées « **absentes** » et non « défaillantes ». Leur gravité est indiquée pour une **mise en ligne** : ces points ne bloquent pas une démonstration faite en local, devant le client.

### 7.1 Ce qui est conforme

| Contrôle | Résultat |
|---|---|
| Secrets | ✅ Aucune clé, aucun jeton, aucun mot de passe réel dans le code ni dans l'historique Git (recherche de motifs : clés d'API, `sk_live`, `AKIA…`, clés privées, jetons GitHub ou Slack) |
| Fichiers `.env` | ✅ Aucun n'est versionné ; `.env*` est ignoré (`site-web/.gitignore`) |
| TypeScript | ✅ `"strict": true` (`tsconfig.json:7`) ; **0 `any`**, 0 `@ts-ignore` |
| Code mort et traces | ✅ 0 `console.log`, 0 TODO ou FIXME, 0 `dangerouslySetInnerHTML`, 0 `eval`. Seulement 4 `eslint-disable`, chacun justifié en commentaire |
| Injection de code (XSS) | ✅ Tous les contenus sont affichés par React (échappement automatique), y compris les textes modifiables dans l'admin. Les preuves de virement sont réencodées en JPEG avant d'être affichées |
| Règles métier | ✅ Isolées en fonctions pures (`lib/business-rules/`, 10 fichiers) et couvertes par des tests (taxe, barème, alertes de stock, J+3, installation) |
| Volume | 19 867 lignes TypeScript ; plus gros fichiers : `FormulaireProduit.tsx` (698 lignes), `AdminSidebar.tsx` (533), `CatalogueBrowser.tsx` (449) |

### 7.2 Problèmes relevés en phase 7

#### A-39 🔴 Critique (avant toute mise en ligne) — Les actions de l'admin s'exécutent sans aucune vérification : un inconnu peut changer les prix et les CGV
- **Constat.** Les 21 Server Actions de l'admin (catalogue, prix, stock, barèmes, packages, FAQ, CGV, pages légales, agents SAV) ne vérifient ni la session ni le rôle. Or une Server Action est un point d'entrée HTTP public, et son identifiant figure dans le JavaScript envoyé au navigateur.
- **Preuve, par une attaque simulée.** Une simple requête `curl` anonyme, sans cookie, sur le serveur d'audit :
  - `POST /admin/catalogue` avec l'en-tête `Next-Action: 60d17b50…` (identifiant de `modifierProduitAction`, lu dans `.next/server/server-reference-manifest.json` et présent dans les fichiers JavaScript publics) et le corps `["ES-13",{"prix_public":1}]` → HTTP 200. **Le prix public d'ES-13 passe de $1150.00 à $1.00 pour tous les visiteurs** ;
  - même chose sur `modifierSectionLegaleAction` → **l'article 2 des CGV est remplacé** par un texte arbitraire, visible sur `/cgv` ;
  - dans le code, la seule lecture de cookie de tout le dossier `lib/actions/` est celle de la langue (`lib/actions/langue.ts:13`). Le commentaire `lib/actions/catalogue-admin.ts:5-11` reconnaît cette absence de contrôle.
- **Impact pour ATC.** Dès que le site est accessible en ligne, même pour une démonstration, n'importe qui peut afficher de faux prix, vider le stock ou réécrire les CGV.
- **Correction proposée.** Vérifier dans chaque action une session serveur (cookie `httpOnly` signé) et le rôle requis, avant toute modification. En attendant le backend : ne pas déployer publiquement, ou désactiver ces actions en production.
- **Effort.** M

#### A-40 🔴 Critique (absent — à faire avec le backend) — Connexion et rôles gérés uniquement dans le navigateur
- **Constat.**
  - **N'importe quel mot de passe** est accepté pour un compte existant. Seul un champ vide est refusé.
  - La session est un simple objet dans le `localStorage`. En y écrivant `{ type: "admin", role: "general" }`, un visiteur **ouvre tout l'espace d'administration**, y compris les pages réservées à l'admin général.
  - Aucun `middleware.ts` ni `proxy.ts` ne protège `/admin` côté serveur.
- **Preuve.**
  - `app/compte/connexion/page.tsx:74-92` : aucune vérification du mot de passe ;
  - navigateur : connexion au compte Entreprise vérifié `contact@quisqueya-electro.ht` avec « n-importe-quoi » → connecté en tant que « Marie Delva » ;
  - session falsifiée → `/admin/transactions` et `/admin/parametres` s'affichent.
- **Correction proposée.** Authentification côté backend : mots de passe hachés (argon2 ou bcrypt), session dans un cookie `httpOnly` / `Secure` / `SameSite`, protection de `/admin` par `proxy.ts` (le nom du middleware dans Next 16) et contrôle du rôle à chaque requête et à chaque action.
- **Effort.** L

#### A-41 🔴 Critique (absent — à faire avec le backend) — Les prix et les montants payés viennent du navigateur
- **Constat.** Le prix unitaire de chaque ligne est stocké dans le panier du navigateur, puis repris tel quel pour la commande, la taxe et le paiement.
- **Preuve.**
  - `lib/store/commande-store.ts` (`montant_total` = somme des `prix_unitaire_applique` du panier) ; `components/paiement/EcranPaiement.tsx:161` ;
  - navigateur : batterie ES-13 à $1150, prix modifié à 1 dans `atc-panier` → « Montant à régler $1.10 », paiement enregistré `1.1 USD` avec le statut « **réussie** ».
- **Impact pour ATC.** Sans recalcul côté serveur, un client peut payer le prix qu'il veut.
- **Correction proposée.** Le backend recalcule chaque prix (catalogue, variante, palier B2B), la taxe et le total à partir des seuls identifiants et quantités. Le montant envoyé au prestataire de paiement vient du serveur.
- **Effort.** L

#### A-42 🔴 Critique — Next.js 16.3.1 a des vulnérabilités critiques connues
- **Constat.** `npm audit` signale **1 dépendance critique, 6 élevées et 18 modérées**. En production :
  - **next 16.3.1** : 4 failles critiques d'**exécution de code à distance sans authentification** ;
    - sur un serveur Windows : GHSA-p293-qw3h-jr36 ;
    - dans l'API d'optimisation d'images, que le site utilise : GHSA-2xp9-vwfh-vxw4 (fichiers AVIF) et GHSA-2464-fhr4-w9xw (fichiers SVG) ;
    - dans les fonctions `use cache` : GHSA-673q-mjm6-r5xr ;
  - next 16.3.1 a aussi une faille élevée de SSRF dans l'optimisation d'images (GHSA-cjq9-62q9-8jv4) et un déni de service par Server Actions (GHSA-p3m5-59mp-jv5r) ;
  - **sharp 0.35.3** (traitement d'images en production, dépendance de next) : 2 failles élevées (GHSA-rgj7-g3m4-5g8c, GHSA-wq5f-xc86-pv6w).
- **Preuve.** `npm audit --json` (lecture seule) ; `npm ls` : `next@16.3.1` → `sharp@0.35.3`.
- **Correction proposée.** Passer à **next 16.4.3** (version mineure, sans changement majeur selon `npm audit`), puis relancer le build et les tests.
- **Effort.** S

#### A-43 🟠 Majeur — Les données des comptes sont incluses dans le JavaScript public
- **Constat.** Les fichiers JavaScript envoyés à tout visiteur contiennent :
  - les comptes clients de démonstration : noms, e-mails, téléphones, NIF et raisons sociales des entreprises ;
  - les e-mails des comptes administrateurs.

  C'est la conséquence de composants client qui importent `lib/mock-data/utilisateurs` et `administrateurs`. Avec de vraies données, ce serait une **fuite de données personnelles**.
- **Preuve.** `.next/static/chunks/2ly6r07ub-w8e.js` contient `particulier.demo@atc-demo.ht`, `contact@quisqueya-electro.ht` et des NIF ; `.next/static/chunks/447fcy8qqbwfi.js` contient `admin.general@atc-demo.ht`.
- **Correction proposée.** Garder les données de comptes côté serveur, et n'envoyer au navigateur que le profil de l'utilisateur connecté.
- **Effort.** M (inclus dans la migration vers le backend)

#### A-44 🟡 Mineur — Aucun en-tête HTTP de sécurité
- **Constat.**
  - Les réponses n'ont ni `Content-Security-Policy`, ni `X-Frame-Options` / `frame-ancestors` (le site peut être affiché dans un cadre par un autre site, ce qui permet le *clickjacking*), ni `X-Content-Type-Options`, ni `Referrer-Policy`, ni `Strict-Transport-Security`.
  - L'en-tête `X-Powered-By: Next.js` révèle la technologie utilisée.
- **Preuve.** `curl -I http://localhost:3005/` ; `next.config.ts` est vide.
- **Correction proposée.** Ajouter ces en-têtes dans `headers()` de `next.config.ts`, et mettre `poweredByHeader: false`.
- **Effort.** S

#### A-45 🟡 Mineur — Vulnérabilités des outils de développement
- **Constat.** 24 alertes, modérées ou élevées, concernent des outils utilisés **uniquement en développement** : eslint et ses plugins, typescript-eslint, vitest, vite, minimatch, brace-expansion, js-yaml, source-map-js, zod. Elles n'ont pas d'effet sur le site en production.
- **Preuve.** `npm audit --json`.
- **Correction proposée.** `npm audit fix` pour les correctifs non majeurs, puis mettre à jour eslint et vitest.
- **Effort.** S

#### A-46 🟡 Mineur — Dans l'admin, les commandes et les devis d'un compte créé sur le site s'affichent au nom de « Client »
- **Constat.** La fonction `nomClient` est recopiée dans 8 composants de l'admin. Deux de ces copies ne cherchent que dans les comptes de démonstration : pour un client inscrit sur le site, la liste des commandes et celle des devis affichent « Client » au lieu de son nom. La fonction `idUnique` est aussi recopiée dans 8 fichiers de `lib/store` et `lib/mock-data`.
- **Preuve.** `components/admin/GestionCommandes.tsx:12-14` et `components/admin/TraitementDevis.tsx:12-14` (`utilisateurs.find(...) ?? "Client"`). Les 6 autres copies consultent aussi les comptes créés. Recherche de `function nomClient` et `function idUnique` dans `app/`, `components/` et `lib/`.
- **Correction proposée.** Une seule fonction partagée dans `lib/services/utilisateurs.ts`, et une seule fonction de génération d'identifiants, remplacée plus tard par la base de données.
- **Effort.** S

#### A-47 🟡 Mineur — Le journal des actions des agents SAV n'est jamais alimenté
- **Constat.** La page « Historique des actions » affiche un jeu de données fixe. Aucune action réelle d'un agent (prise en charge, réponse, changement de statut) n'y est ajoutée.
- **Preuve.** `app/admin/agents-sav/historique/page.tsx:2` et `:16` importent `journalAgentsSav` depuis `lib/mock-data` ; aucune écriture dans ce journal dans `lib/actions/`, `lib/store/` ni `components/`.
- **Correction proposée.** Écrire une entrée du journal à chaque action d'un agent (future table `agent_actions_log`).
- **Effort.** M

#### A-48 🟠 Majeur (structurel) — Passage à PostgreSQL : ce qui est prêt et ce qui bloque
**Ce qui est prêt :**
- **Modèle de données :** les 48 types de `lib/types/entities.ts` reprennent le cahier des données (cahier 9) : `Produit`, `VarianteProduit` (avec identifiant), `Commande`, `LigneCommande`, `Paiement`, `Utilisateur`, `ProfilEntreprise`, `CompteAgentSav`, `JournalActionAgentSav`… Ils se traduisent directement en tables `products`, `product_variants`, `orders`, `users`, `agent_actions_log`.
- **Règles métier :** isolées, pures et testées, donc réutilisables telles quelles côté serveur.
- **Couche de services :** elle existe (`lib/services/`, 18 fichiers) et prévoit déjà, par endroits, le remplacement par la base (`lib/services/agents-sav.ts:4-6`).

**Ce qui bloquerait sans refonte :**
1. **49 fichiers de `app/` et `components/` lisent directement les tableaux mock**, de façon synchrone : `produits` (21 fichiers), `utilisateurs` (16), `categories` (13)… Il faudra passer par des services asynchrones.
2. **Les commandes, devis, paiements, factures, comptes, avis, tickets SAV et installations vivent dans le `localStorage`** (10 stores Zustand persistés). Leurs méthodes sont synchrones : par exemple, `creerCommandeDepuisPanier` renvoie la commande immédiatement. Les composants qui les appellent devront gérer des appels réseau asynchrones, avec attente et erreurs.
3. **Les identifiants sont générés dans le navigateur** avec `Date.now()` (10 occurrences dans `lib/store`). Il faudra des identifiants générés par la base.
4. **Les Server Actions modifient les tableaux mock en mémoire.** Les modifications sont perdues au redémarrage et ne sont pas partagées entre plusieurs serveurs.
5. **Les montants sont des nombres flottants JavaScript.** Il faudra des colonnes `numeric(12,2)` et des calculs en centimes.
6. **Les fichiers** (documents Entreprise, preuves de virement, photos produits ajoutées dans l'admin) n'ont pas de stockage : seulement un nom, ou une data URL dans le navigateur.
7. **Les paliers B2B ne sont pas rattachés aux variantes** (A-04). Il faudra trancher ce point dans le schéma avant de créer les tables.

- **Impact pour ATC.** Le frontend peut être conservé, mais le branchement sur une base demandera une refonte de la couche de données, et de nombreux composants seront touchés.
- **Correction proposée.**
  1. Faire passer toutes les lectures par `lib/services/`.
  2. Remplacer les stores persistés par des appels à l'API, page par page, en commençant par le paiement et les commandes, qui portent l'argent.
  3. Générer les identifiants et les montants côté serveur.
- **Effort.** L

### 7.3 Non vérifié en phase 7

- **Backend NestJS :** absent du dépôt (décision 1.7). Il n'y a donc ni routes API, ni validation serveur, ni base de données à auditer.
- **`npm outdated` :** interrompu, faute de réponse du registre npm dans le délai. `npm audit` a abouti.
- **Test d'intrusion réel des failles de Next.js (A-42) :** non tenté, seulement constaté par version.

### 7.4 Bilan de la phase 7

| Gravité | Nombre | Problèmes |
|---|---|---|
| 🔴 Critique | 4 | A-39, A-40, A-41, A-42 (A-40 et A-41 : absents, à faire avec le backend) |
| 🟠 Majeur | 2 | A-43, A-48 |
| 🟡 Mineur | 4 | A-44, A-45, A-46, A-47 |
| ⚪ Suggestion | 0 | — |
| 🟡 Mineur | 4 | A-28, A-29, A-30, A-31 |
| ⚪ Suggestion | 1 | A-32 |
