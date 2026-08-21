# AUDIT-REPORT.md — Audit qualité de la plateforme ATC

Audit mené comme QA senior / directeur artistique sur le site déjà construit (Phases 0 à 8), sur les 5 axes demandés.

**Statut : les 5 axes sont traités et corrigés. Les manques Must have de l'Axe 1, les constats des Axes 2, 3, 4 et les 7 doublons de l'Axe 5 sont tous corrigés — voir « Corrections appliquées » pour chaque axe.**

## Résumé exécutif — Axes 2 à 5

| Axe | Constats | Le plus important |
|---|---|---|
| 2 — Design | 3 constats (1 Important + 1 Important + 1 Mineur) — **les 2 Important corrigés** | Les photos par défaut de 4+ produits (caméras, sonnette, batterie) étaient des visuels marketing bruts du fournisseur, texte anglais et badges incrustés — l'un d'eux portait une marque « SMART+ » qui contredisait la marque affichée sur la fiche produit. **Corrigé.** |
| 3 — Typographie | 1 constat Important (doublon avec l'Axe 2) — **corrigé** + confirmations positives | Polices Sora/Inter correctement appliquées partout ; aucune faute FR relevée ; un identifiant de règle interne (`RG-04-002`) fuitait dans un texte client. **Corrigé.** |
| 4 — Contraste | 1 constat Important, mesuré — **corrigé** | Le libellé d'accroche de la bannière d'accueil était sous le seuil WCAG AA (contraste ≈ 4,03:1 contre 4,5:1 requis). **Corrigé.** |
| 5 — Doublons d'images | 7 paires de doublons (tous Mineur) sur 69 images inspectées — **corrigé** | Concentrés dans les diaporamas « caractéristiques »/« mise en situation » des 2 catalogues caméra + 2 paires dans énergie solaire ; les 7 fichiers redondants ont été supprimés du dossier source `Photos-Traitees\`. **Corrigé.** |

Aucun constat classé **Bloquant**. Détail complet ci-dessous.

---

## Corrections appliquées (Must have de l'Axe 1)

Suite au constat initial, les manques Must have suivants ont été corrigés :

| Item | Avant | Après | Ce qui a été construit |
|---|---|---|---|
| BF-11-001 / ECR-11-001 | Manquant | **Construit** | Page `/faq` (FAQ générale) |
| BF-11-002 | Manquant | **Construit** | FAQ groupée par catégorie sur `/faq` |
| BF-11-006 / ECR-11-003 | Manquant | **Construit** | Page `/contact` (formulaire + lien WhatsApp fonctionnel) |
| BF-09-003 | Partiellement construit | **Construit** | Lien WhatsApp `wa.me` cliquable dans le Footer (auparavant texte statique) |
| BF-11-004 / ECR-11-004 | Partiellement construit | **Construit** | Page `/mentions-legales` ajoutée (CGV + Confidentialité déjà présentes) |
| BF-12-011 / ECR-12-004 | Manquant | **Construit** | `/admin/contenu` — gestion FAQ (créer/modifier/supprimer) + édition des textes CGV/Confidentialité/Mentions légales, section par section |
| BF-12-008 | Manquant | **Construit** | `/admin/transactions` — liste des paiements par méthode, montants, statut, lien vers la facture pro forma associée |
| BF-12-015 / ECR-12-005 | Partiellement construit | **Construit** | `/admin/parametres` gère désormais aussi les langues actives (FR/EN/ES), qui filtrent réellement le sélecteur de langue du site |
| BF-12-003 | Partiellement construit | **Construit** | `/admin/packages` — création/édition/suppression de packages pré-configurés, prix recalculé automatiquement à partir du prix public des composants |
| BF-09-004 / ECR-09-002 | Manquant | **Construit** | Planification d'installation solaire (UC-09-001) : le client propose une date depuis sa page de confirmation de commande (si le produit est éligible — RG-09-002, famille Énergie solaire uniquement), l'admin confirme/ajuste/marque réalisée depuis `/admin/installations` |
| BF-12-009 (volet installation) | Partiellement construit | **Construit** | `/admin/installations` complète la gestion déjà en place pour les tickets SAV |

**Détails d'implémentation notables :**
- FAQ et textes légaux suivent la même architecture que la gestion catalogue (Server Actions + `revalidatePath`, mutation en place des tableaux mock-data) pour que les pages vitrine (Server Components) reflètent les modifications admin sans redémarrage serveur — vérifié en direct (une question FAQ créée en admin apparaît immédiatement sur `/faq`).
- En construisant `/admin/transactions`, un vrai bug d'accès a été trouvé et corrigé au passage : `/facture/[factureId]` n'autorisait que le client propriétaire, pas l'admin — un administrateur ne pouvait donc pas suivre le lien facture depuis cette nouvelle page. Corrigé pour autoriser aussi toute session admin (même logique déjà utilisée par `CommandeConfirmation.tsx`).
- En construisant `/admin/packages`, un second bug a été trouvé et corrigé : les pages `/packages` et `/packages/[slug]` plantaient (avertissement `next/image`) si le champ image d'un package était vide — un repli visuel « Image à venir » a été ajouté (même traitement que `ProductCard.tsx` pour les produits sans photo).
- Les modules `/admin/contenu`, `/admin/transactions` et `/admin/installations` sont accessibles aux deux rôles admin (ni gestion des prix catalogue ni Paramètres généraux au sens strict de RG-12-001) ; `/admin/packages` est réservé au rôle Général, par cohérence avec `/admin/catalogue`.
- Planification d'installation (UC-09-001) : suit fidèlement le scénario nominal du Cahier (le client propose une date, l'agent SAV ou l'admin confirme/ajuste) et le scénario d'erreur E1 (produit non éligible → l'option n'est simplement pas affichée, testé en direct avec un climatiseur). Nouvelle règle métier `RG-09-002` extraite dans `lib/business-rules/installation-eligibilite.ts`, couverte par 7 tests unitaires dédiés (mêmes conventions que les 17 tests déjà existants).
- Vérifié : TypeScript, ESLint et les 24 tests unitaires (17 + 7 nouveaux) restent au vert ; parcours bout-en-bout testés en direct pour chaque module, y compris le cycle complet devis→achat→planification→confirmation admin→statut mis à jour côté client.

### Ce qui reste — hors de portée assumée (non corrigible dans cette démo)

- **BF-13-001 — Chiffrement SSL / sécurisation paiement** : exigence d'hébergement/infrastructure réelle, sans objet pour une démo front-end sans backend.
- **BF-15-003 — Comportement client (Could have)** : nécessiterait un outil de mesure d'audience réel.
- Items Could/Should have non touchés par ce passage (hors périmètre "Must have") : BF-01-007 (fiche comparative), BF-10-003 (newsletter), BF-11-003/ECR-11-002 (blog), BF-12-010 (historique chatbot), BF-01-002 (espace dédié Entreprise/Particulier).

---

## Corrections appliquées (Axe 2)

Suite à votre validation de la politique de traitement (« Remplacer par un espace réservé » pour les produits sans photo propre disponible), les 2 constats Important de l'Axe 2 ont été corrigés :

| Constat | Avant | Après |
|---|---|---|
| Photos marketing fournisseur (texte anglais + marque « SMART+ » incrustée) sur `Sonnette vidéo connectée` et `Caméra PTZ standard` | 5 visuels fournisseur chacun, tous jugés inexploitables (marketing composite ou logo tiers) | `images: []` — repli « Image à venir » (même traitement que la carte Électronique déjà en place) |
| Idem sur `Caméra PTZ solaire autonome` | 5 visuels, dont un seul relativement propre | Conservé uniquement `produit-isole-03.webp` (logo tiers discret, sans bandeau marketing) ; les 4 autres retirés |
| Idem sur `Batterie lithium LiFePO4 100Ah` (Énergie solaire) | 2 visuels, marques tierces incohérentes entre elles (« SMART+ » / « ESLBATTERY ») et avec `marque-ecotech` | `images: []` — repli « Image à venir » |
| Identifiant interne `RG-04-002` visible dans le message client du configurateur de package (doublon Axe 2 / Axe 3) | *« ... réservé aux clients connectés (Particulier ou Entreprise) — RG-04-002. »* | *« ... réservé aux clients connectés (Particulier ou Entreprise). »* |

**Détails d'implémentation notables :**
- Vérification complémentaire à l'inspection initiale : sur les 3 produits Sécurité, **la totalité** des visuels fournisseur disponibles (pas seulement l'image par défaut) ont été inspectés un par un — y compris les diaporamas « mise en situation », « caractéristiques » et « dimensions ». Résultat : pour `Sonnette vidéo connectée` et `Caméra PTZ standard`, les 5 visuels du lot contiennent tous soit une composition marketing complète (titre anglais + photo de mise en scène + mockup de notification), soit des badges/logos tiers (Tuya, Smart Life, « SMART+ ») — aucun n'est un repli acceptable, d'où le choix de vider entièrement le tableau `images`. Pour `Caméra PTZ solaire autonome`, `produit-isole-03.webp` reste la seule exception valable (logo discret uniquement).
- **`Onduleur hybride 5kVA` (`prod-onduleur-hybride-5kva`) volontairement non modifié** : ses 2 photos (`energie-10`, `energie-11`) montrent du matériel de marque « Deye » visible, ce qui pose la même question de cohérence de marque que la batterie — mais ce sont de vraies photos d'installation ATC (pas des visuels marketing fournisseur), une situation qualitativement différente. Comme cette référence n'était pas nommément couverte par votre validation (« caméra standard, sonnette, batterie lithium »), elle est laissée en l'état et signalée ici comme limitation résiduelle à trancher si besoin — extension possible de la même politique sur simple confirmation.
- Aucun composant consommateur (`ProductCard`, `GalerieImages`, panier, configurateur de package, barre de recherche) ne plante sur un tableau `images` vide — tous ont déjà un repli conditionnel (`images[0] ? ... : ...` ou `images.length === 0`), le même utilisé pour la carte Électronique (décision n°42 déjà en place).
- Vérifié : `tsc --noEmit` propre, ESLint propre, 24/24 tests unitaires toujours au vert (ce lot ne touche que des données produit et un texte, aucune logique).

---

## Axe 1 — Complétude fonctionnelle

**Méthodologie :** lecture intégrale de `03-Cahier-des-Besoins-Fonctionnels.md` (92 BF) et `06-Cahier-Specifications-Fonctionnelles-Detaillees.md` (30 ECR), croisée avec le code réel de `site-web/`. Les 92 BF et 30 ECR ont tous été vérifiés individuellement ; ce tableau reflète l'état **après corrections**.

### Résumé exécutif (après corrections)

| | Construit | Partiellement construit | Manquant | Non retenu / contrainte |
|---|---|---|---|---|
| **BF (92)** | 72 | 1 | 6 | 13 |
| **ECR (30)** | 29 | 0 | 1 | 0 |

**Tous les items Must have sont désormais construits.** Ce qui reste manquant est soit hors de portée assumée (BF-13-001, infrastructure), soit Should/Could have jamais demandé dans ce passage de corrections.

### Ce qui manque encore (aucun Must have restant)

- BF-01-007 — Fiche technique comparative par sous-catégorie (Should have)
- BF-10-003 — Newsletter (Could have)
- BF-11-003 / ECR-11-002 — Blog (Could have)
- BF-12-010 — Historique des échanges chatbot/WhatsApp (Could have)
- **BF-13-001** — Chiffrement SSL / sécurisation paiement (hors de portée, voir note dédiée)
- BF-15-003 — Comportement client / parcours / abandons (Could have, hors scope démo)

### Ce qui reste partiel

- BF-01-002 — La séparation Entreprise/Particulier existe fonctionnellement (parcours d'inscription distincts, tarification différenciée) mais sans « espace » dédié avec sa propre navigation. (Should have.)

### Note sur BF-13-001 (sécurité paiement/SSL)

Le chiffrement TLS/SSL et la sécurisation infrastructure des paiements sont des exigences réelles mais de niveau hébergement/production — non démontrables dans une démo front-end sans backend ni certificat réel. Listé ici comme « Manquant » par souci d'exhaustivité vis-à-vis du Cahier, mais ce n'est pas un défaut de code corrigible dans ce projet.

### Partie A — Détail par BF (par EPIC)

#### EPIC-01 — Navigation & Catalogue

| BF ID | Résumé | Statut | Preuve/Note |
|---|---|---|---|
| BF-01-001 | Menu principal par catégories | Construit | `components/layout/Header.tsx` |
| BF-01-002 | Espace distinct Entreprise/Particulier | Partiellement construit | Séparation fonctionnelle seulement, pas d'UI dédiée |
| BF-01-003 | Fil d'Ariane dès catégorie | Construit | `components/layout/Breadcrumb.tsx` |
| BF-01-004 | Changement de langue sans perte de contexte | Construit | `LanguageSelector.tsx`, filtré par langues actives (`parametres-store.ts`) |
| BF-01-005 | Sélecteur de devise | Non retenu | Confirmé absent |
| BF-01-006 | Filtre par marque | Construit | `lib/mock-data/marques.ts`, `CatalogueBrowser.tsx` |
| BF-01-007 | Fiche comparative par sous-catégorie | Manquant | Aucune trace |
| BF-01-008 | Catégories phares accueil | Construit | `components/home/CategoriesPhares.tsx` |
| BF-01-009 | Bannière packages solaires | Construit | `components/home/BanniereSolaire.tsx` |
| BF-01-010 | Bloc « Devenir client professionnel » | Construit | `components/home/BlocDevenirPro.tsx` |
| BF-01-011 | Réassurance accueil | Construit | `components/layout/Footer.tsx` |
| BF-01-012 | Structure catalogue par familles | Construit | `lib/mock-data/produits.ts`, `lib/services/catalogue.ts` |

#### EPIC-02 — Recherche & Filtres

| BF ID | Résumé | Statut | Preuve/Note |
|---|---|---|---|
| BF-02-001 | Recherche avec suggestions | Construit | `lib/services/recherche.ts`, `SearchBar.tsx` |
| BF-02-002 | Filtre caractéristiques techniques | Construit | `CatalogueBrowser.tsx` |
| BF-02-003 | Filtre prix/marque | Construit | `CatalogueBrowser.tsx` |
| BF-02-004 | Filtre « disponible en package » | Construit | `CatalogueBrowser.tsx` |

#### EPIC-03 — Fiche Produit

| BF ID | Résumé | Statut | Preuve/Note |
|---|---|---|---|
| BF-03-001 | Description/specs/images/prix | Construit | `app/produit/[slug]/page.tsx` |
| BF-03-002 | Indicateur de stock par seuils | Construit | `StockBadge.tsx`, `lib/mock-data/stock.ts` |
| BF-03-003 | Ajouter au panier | Construit | `AchatProduit.tsx` |
| BF-03-004 | Ajouter au package personnalisé | Construit | `AchatProduit.tsx`, `package-draft-store.ts` |
| BF-03-005 | Prix différencié B2B/B2C | Construit | `AchatProduit.tsx` |
| BF-03-006 | Produits associés/accessoires | Construit | `ProduitsAssocies.tsx` |
| BF-03-007 | Barème de prix par palier B2B | Construit | `AchatProduit.tsx`, `bareme-b2b.ts` |

#### EPIC-04 — Devis & Packages personnalisés

| BF ID | Résumé | Statut | Preuve/Note |
|---|---|---|---|
| BF-04-001 | Catalogue packages pré-configurés | Construit | `app/packages/page.tsx` |
| BF-04-002 | Générateur package personnalisé | Construit | `ConfigurateurPackage.tsx` |
| BF-04-003 | Envoi auto vers demande de devis | Construit | `devis-store.ts` (`creerDevis`) |
| BF-04-004 | Suivi statut devis | Construit | `app/devis/page.tsx` |
| BF-04-005 | Historique des devis | Construit | `app/devis/page.tsx` |
| BF-04-006 | Réponse admin avec calcul auto | Construit | `TraitementDevis.tsx`, `devis-store.ts` |
| BF-04-007 | Conversion devis → commande | Construit | `devis-store.ts` (`convertirEnCommande`) |
| BF-04-008 | Expiration auto J+3 | Construit | `lib/business-rules/devis-expiration.ts` |

#### EPIC-05 — Panier & Commande

| BF ID | Résumé | Statut | Preuve/Note |
|---|---|---|---|
| BF-05-001 | Panier classique multi-catégories | Construit | `lib/store/cart-store.ts` |
| BF-05-002 | Sous-total par catégorie | Construit | `PanierContenu.tsx` |
| BF-05-003 | Prix palier B2B au panier | Construit | `cart-store.ts` |
| BF-05-004 | Statut « Prêt pour retrait » | Construit | `commande-store.ts`, `GestionCommandes.tsx` |

#### EPIC-06 — Paiement & Facturation

| BF ID | Résumé | Statut | Preuve/Note |
|---|---|---|---|
| BF-06-001 | Paiement MonCash + conversion HTG | Construit | `EcranPaiement.tsx` |
| BF-06-002 | Paiement carte | Construit | `EcranPaiement.tsx` |
| BF-06-003 | Paiement PayPal | Construit | `EcranPaiement.tsx` |
| BF-06-004 | Virement bancaire | Non retenu | Confirmé exclu |
| BF-06-005 | Facture pro forma B2B + taxe | Construit | `FactureProFormaDocument.tsx` |
| BF-06-006 | Prix en USD partout | Construit | Vérifié |

#### EPIC-07 — Livraison (annulé)

BF-07-001 à 004 — Non retenu, confirmé absent du code.

#### EPIC-08 — Compte Client

| BF ID | Résumé | Statut | Preuve/Note |
|---|---|---|---|
| BF-08-001 | Création compte Entreprise/Particulier | Construit | `app/compte/inscription/page.tsx` |
| BF-08-002 | Plusieurs adresses | Construit | `CarnetAdresses.tsx` |
| BF-08-003 | Historique commandes/devis | Construit | `app/compte/tableau-de-bord/page.tsx` |
| BF-08-004 | Liste de favoris | Construit | `BoutonFavori.tsx`, `app/compte/favoris/page.tsx` |
| BF-08-005 | Multi-utilisateurs compte Entreprise | Non retenu | Confirmé absent |
| BF-08-006 | Collecte infos inscription Entreprise | Construit | `InscriptionEntreprise.tsx` |
| BF-08-007 | Upload documents (5 Mo max) | Construit | `InscriptionEntreprise.tsx` |
| BF-08-008 | Admin Approuve/Rejette/Complément | Construit | `ValidationEntreprises.tsx` |
| BF-08-009 | Activation auto statut B2B | Construit | `devis-store.ts` |

#### EPIC-09 — SAV & Assistance

| BF ID | Résumé | Statut | Preuve/Note |
|---|---|---|---|
| BF-09-001 | Garantie par catégorie sur fiche produit | Construit | `lib/mock-data/garanties.ts` |
| BF-09-002 | Création ticket SAV | Construit | `lib/store/sav-store.ts`, `MesTickets.tsx` |
| BF-09-003 | Chatbot/WhatsApp accessible partout | Construit | Lien `wa.me` cliquable dans `Footer.tsx` et `/contact` ; aucun chatbot (canal WhatsApp couvre le besoin) |
| BF-09-004 | Planification installation solaire | Construit | `PlanificationInstallation.tsx` (client), `GestionInstallations.tsx` (admin), `installation-store.ts` |

#### EPIC-10 — Marketing (Avis clients)

| BF ID | Résumé | Statut | Preuve/Note |
|---|---|---|---|
| BF-10-001/002 | Statuts de fidélité | Non retenu | Confirmé absent |
| BF-10-003 | Newsletter | Manquant | Aucune trace |
| BF-10-004 | Aucun code promo | Contrainte respectée | Confirmé |
| BF-10-005 | Tarifs B2B auto sans code | Non retenu | Remplacé par BF-03-007 |
| BF-10-006 | Dépôt d'avis (acheteurs uniquement) | Construit | `AvisProduit.tsx`, `avis-store.ts` |

#### EPIC-11 — Contenu

| BF ID | Résumé | Statut | Preuve/Note |
|---|---|---|---|
| BF-11-001 | FAQ générale | Construit | `app/faq/page.tsx` |
| BF-11-002 | FAQ par catégorie | Construit | `app/faq/page.tsx` |
| BF-11-003 | Blog | Manquant | Aucune page (Could have) |
| BF-11-004 | CGV/confidentialité/mentions légales | Construit | `app/{cgv,confidentialite,mentions-legales}/page.tsx` |
| BF-11-005 | Conditions export/diaspora | Construit | Intégré dans `app/cgv/page.tsx` |
| BF-11-006 | Formulaire de contact + WhatsApp | Construit | `app/contact/page.tsx` |

#### EPIC-12 — Administration / Back-office

| BF ID | Résumé | Statut | Preuve/Note |
|---|---|---|---|
| BF-12-001 | Tableau de bord admin | Construit | `TableauDeBord.tsx` |
| BF-12-002 | CRUD produits/stock/barèmes | Construit | `GestionCatalogue.tsx`, `catalogue-admin.ts` |
| BF-12-003 | Créer packages + traiter demandes perso | Construit | `GestionPackages.tsx` (création/édition/suppression), `TraitementDevis.tsx` (demandes) |
| BF-12-004 | Répondre devis, convertir commande | Construit | `TraitementDevis.tsx` |
| BF-12-005 | Suivi commandes | Construit | `GestionCommandes.tsx` |
| BF-12-006 | Liste clients | Construit | `GestionClients.tsx` |
| BF-12-007 | Config livraison | Non retenu | Confirmé |
| BF-12-008 | Suivi transactions + factures pro forma | Construit | `GestionTransactions.tsx` |
| BF-12-009 | Gestion installation + tickets SAV | Construit | Tickets (`GestionSAV.tsx`) + installations (`GestionInstallations.tsx`) |
| BF-12-010 | Historique chatbot/WhatsApp | Manquant | Aucune trace |
| BF-12-011 | Gestion contenu (Must have, décision n°9) | Construit | `GestionContenu.tsx` (FAQ + textes légaux) |
| BF-12-012 | Modération avis clients | Construit | `ModerationAvis.tsx` |
| BF-12-013 | Statistiques | Construit | `Statistiques.tsx` |
| BF-12-014 | 2 rôles admin fixes | Construit | `administrateurs.ts` |
| BF-12-015 | Paramètres généraux complets | Construit | Taux de change + langues actives (`app/admin/parametres/page.tsx`) ; notifications non applicables (aucune infrastructure d'envoi réel) |

#### EPIC-13 — Sécurité & Conformité

| BF ID | Résumé | Statut | Preuve/Note |
|---|---|---|---|
| BF-13-001 | Chiffrement SSL / sécurisation paiement | Manquant | Non démontrable en démo front-end (voir note dédiée) |
| BF-13-002 | Protection données multi-juridictions | Construit | `app/confidentialite/page.tsx` |

#### EPIC-14 — Internationalisation

| BF ID | Résumé | Statut | Preuve/Note |
|---|---|---|---|
| BF-14-001 | Site FR/EN/ES | Construit | Dictionnaires complets, chrome UI traduit, langues actives administrables |
| BF-14-002 | Adapter infos livraison par pays | Non retenu | Confirmé |

#### EPIC-15 — Analytics & Pilotage

| BF ID | Résumé | Statut | Preuve/Note |
|---|---|---|---|
| BF-15-001 | Ventes par catégorie | Construit | `Statistiques.tsx` |
| BF-15-002 | Conversion devis→commande | Construit | `Statistiques.tsx` |
| BF-15-003 | Comportement client | Manquant | Explicitement hors scope démo |

### Partie B — Détail par ECR

| ECR ID | Nom de l'écran | Statut | Preuve/Note |
|---|---|---|---|
| ECR-01-001 | Page d'accueil | Construit | `app/page.tsx` |
| ECR-01-002 | Page catégorie | Construit | `app/categorie/[slug]/page.tsx` |
| ECR-02-001 | Résultats de recherche | Construit | `app/recherche/page.tsx` |
| ECR-03-001 | Fiche produit | Construit | `app/produit/[slug]/page.tsx` |
| ECR-04-001 | Catalogue packages pré-configurés | Construit | `app/packages/page.tsx` |
| ECR-04-002 | Configurateur package personnalisé | Construit | `ConfigurateurPackage.tsx` |
| ECR-04-003 | Suivi de devis (client) | Construit | `app/devis/page.tsx` |
| ECR-04-004 | Traitement des devis (admin) | Construit | `TraitementDevis.tsx` |
| ECR-05-001 | Panier | Construit | `PanierContenu.tsx` |
| ECR-05-002 | Confirmation commande & retrait | Construit | `CommandeConfirmation.tsx` |
| ECR-06-001 | Paiement | Construit | `EcranPaiement.tsx` |
| ECR-06-002 | Facture pro forma | Construit | `FactureProFormaDocument.tsx` |
| ECR-08-001 | Inscription Entreprise (étapes 1-2) | Construit | `InscriptionEntreprise.tsx` |
| ECR-08-002 | Validation compte Entreprise (étapes 3-4) | Construit | `ValidationEntreprises.tsx` |
| ECR-08-003 | Espace client | Construit | `app/compte/tableau-de-bord/page.tsx` |
| ECR-08-004 | Favoris | Construit | `app/compte/favoris/page.tsx` |
| ECR-09-001 | Ticket SAV (client) | Construit | `app/sav/page.tsx` |
| ECR-09-002 | Planification installation | Construit | `PlanificationInstallation.tsx`, `app/admin/installations/page.tsx` |
| ECR-10-001 | Dépôt d'un avis produit | Construit | `AvisProduit.tsx` |
| ECR-11-001 | FAQ | Construit | `app/faq/page.tsx` |
| ECR-11-002 | Blog | Manquant | Aucune page (Could have) |
| ECR-11-003 | Contact | Construit | `app/contact/page.tsx` |
| ECR-11-004 | Mentions légales/CGV/Confidentialité | Construit | Les trois pages existent |
| ECR-12-001 | Tableau de bord admin | Construit | `app/admin/page.tsx` |
| ECR-12-002 | Gestion catalogue | Construit | `app/admin/catalogue/page.tsx` |
| ECR-12-003 | Modération avis clients | Construit | `ModerationAvis.tsx` |
| ECR-12-004 | Gestion contenu | Construit | `app/admin/contenu/page.tsx` |
| ECR-12-005 | Paramètres généraux | Construit | Taux de change + langues actives |
| ECR-12-006 | Comptes administrateurs | Construit | `app/admin/comptes/page.tsx` |
| ECR-15-001 | Statistiques | Construit | `app/admin/statistiques/page.tsx` |

### Partie C — Règles absolues (section 8 du prompt de mission)

Toutes **PASS** — inchangé depuis le premier passage, revérifié : aucune des corrections apportées ne touche la livraison, la fidélité, les codes promo, le virement bancaire, le sélecteur de devise, la négociation B2B libre, les rôles admin ou la validation Entreprise en 4 étapes.

---

## Axe 2 — Qualité du design

**Méthodologie :** capture d'écran desktop (1440px) et mobile (390px) de 19 pages représentatives (accueil, en-tête, catégories, fiches produit, packages, configurateur, panier, compte, contenu, admin), inspection visuelle directe, croisée avec `07-Cahier-UX-UI.md` (palette, grille 8 px, distinction des CTA) et le code source des composants concernés.

### Constat principal (Important)

**Emplacement :** fiches produit et grille catégorie de `Caméra PTZ solaire autonome`, `Caméra PTZ standard`, `Sonnette vidéo connectée` (les 3 produits Sécurité) + `Batterie lithium LiFePO4 100Ah` (Énergie solaire) — au moins ces 4 produits, probablement d'autres parmi les produits sourcés depuis `securite-marketing-fournisseur\`.

**Description :** la photo par défaut (premier visuel affiché, y compris sur la grille de catégorie) de ces produits n'est pas une photo de produit isolée mais un **visuel marketing brut du fournisseur**, avec du texte promotionnel anglais et des badges incrustés dans l'image : « 4G », « 4MP ULTRA HD », « Mini Size / Solar Powered / Built-in Battery / PIR Detection », « Works with Tuya / Smart Life », etc. Pire : plusieurs de ces visuels portent la marque **« SMART+ »** incrustée directement sur le produit — alors que la fiche produit ATC attribue ces articles à la marque fictive **« SecurVision »** (caméras) ou **« EcoTech Energy »** (batterie). Il y a donc une incohérence de marque visible à l'écran, pas seulement un problème esthétique.

J'ai vérifié qu'aucun texte d'interface ATC ne se superpose à ce texte déjà présent dans l'image (le point de vigilance spécifiquement signalé dans la consigne d'audit) — sur ce point précis, pas de double illisibilité. Le problème est plus large : c'est le visuel choisi comme image par défaut qui n'est pas une photo de produit propre.

**Vérification :** pour la caméra PTZ solaire, les 4 photos « produit isolé » disponibles dans `Photos-Traitees\...\catalogue-03-camera-ptz-solaire\04-produit-isole\` ont toutes été inspectées individuellement — aucune n'est réellement propre (4G/4MP, WiFi/4MP, logo « SMART+ » sur l'appareil, ou une pleine composition marketing avec titre « Solar Battery Powered Mini PTZ Camera »). Ce n'est donc pas un choix d'image malheureux facilement corrigible par une simple permutation dans le code : **c'est une limitation des visuels fournisseur disponibles**.

**Sévérité :** Important (visible par défaut sur chaque visite de 4+ fiches produit et sur la grille de catégorie Sécurité ; la mention de marque erronée « SMART+ » est en limite de trompeur pour un vrai client).

**Statut : corrigé** — voir « Corrections appliquées (Axe 2) » en haut de ce document. Les visuels inexploitables ont été retirés au profit du repli « Image à venir » (à l'exception de `Caméra PTZ solaire autonome`, où une photo restait acceptable).

**Recommandation :**
1. Court terme, sans nouvel asset : basculer sur la photo la moins chargée du lot disponible (ex. pour la caméra solaire, `produit-isole-03.webp` — logo « SMART+ » discret uniquement, sans bandeaux de texte) plutôt que la plus chargée actuellement utilisée en premier (`produit-isole-01.webp`).
2. Moyen terme : demander au fournisseur des photos produit isolées sans surimpression, ou recadrer/retoucher (supprimer les bandeaux) les visuels existants — plusieurs contiennent le produit sur fond blanc avec le texte cantonné aux coins, un recadrage serré est possible pour certains (pas tous, le logo « SMART+ » de `produit-isole-02/03` est imprimé sur le boîtier lui-même, pas un texte surimposé).
3. Vérifier les autres produits sourcés du même dossier fournisseur (climatisation, énergie solaire) pour la même incohérence de marque — la batterie « Batterie lithium LiFePO4 100Ah » (`prod-batterie-lithium-100ah`) présente déjà le même symptôme.

### Autres constats

**Emplacement :** `components/home/CategoriesPhares.tsx`, carte « Électronique » (accueil).
**Description :** les 3 autres cartes de la section « Nos univers produits » utilisent une vraie photo ; la carte Électronique utilise un dégradé générique + icône (aucune photo Électronique disponible — décision déjà actée n°42, signalée dans le code). Le rendu reste lisible mais visuellement plus « vide »/moins premium que ses voisines.
**Sévérité :** Mineur.
**Recommandation :** accepter tel quel (contrainte déjà documentée), ou remplacer l'icône générique par une texture/motif plus travaillé graphiquement si un budget design existe.

**Emplacement :** `components/packages/ConfigurateurPackage.tsx:107`.
**Description :** le message affiché à un visiteur non connecté contient l'identifiant de règle métier interne en toutes lettres : *« Le configurateur de package personnalisé est réservé aux clients connectés (Particulier ou Entreprise) — RG-04-002. »* Un identifiant de traçabilité interne (`RG-04-002`) ne devrait jamais apparaître dans un texte client — ça n'a aucun sens pour un visiteur et détonne avec le ton premium du reste du site.
**Sévérité :** Important (facile à corriger, mais visible et non professionnel dès qu'un visiteur non connecté clique sur le configurateur).
**Recommandation :** retirer `— RG-04-002` du texte affiché ; garder la référence dans un commentaire de code si utile à la traçabilité.
**Statut : corrigé.**

**Emplacement :** ensemble du site (vérifié sur en-tête, fiches produit, formulaires).
**Description :** points positifs confirmés — la distinction visuelle entre « Ajouter au panier » (plein, accent orange `#FE4028`) et « Ajouter au package personnalisé » (contour bleu) est bien respectée partout, conforme à l'exigence explicite du Cahier 7 (§6). Les cibles tactiles mesurées (`Ajouter au panier` : 358×44 px, `Ajouter au package` : 358×48 px sur mobile) respectent le minimum de 44×44 px (Cahier 7 §8).
**Sévérité :** — (conforme, aucune action requise).

## Axe 3 — Typographie et texte

**Méthodologie :** vérification du `font-family` calculé (via le DOM rendu, pas seulement le CSS déclaré) sur un titre et un paragraphe ; relecture des textes FR sur les 19 pages capturées ; recherche du pattern d'identifiants internes dans les textes visibles (cf. Axe 2).

### Constats

**Emplacement :** ensemble du site.
**Description :** vérifié positivement — les polices calculées sont bien `Sora, "Sora Fallback", -apple-system, "Segoe UI", Roboto, sans-serif` pour les titres et `Inter, "Inter Fallback", -apple-system, "Segoe UI", Roboto, sans-serif` pour le corps de texte, avec la pile de secours système recommandée par le Cahier 7 (§2.2). Aucune police par défaut du navigateur détectée.
**Sévérité :** — (conforme).

**Emplacement :** `components/packages/ConfigurateurPackage.tsx:107` (cf. Axe 2).
**Description :** même constat que l'Axe 2 — l'identifiant `RG-04-002` dans un texte client est aussi un problème de rédaction/ton (jargon interne non expliqué, contraire à la consigne « pas de jargon technique non expliqué pour la clientèle B2C »).
**Sévérité :** Important (doublon volontaire avec l'Axe 2, le même correctif règle les deux).
**Statut : corrigé** (même correctif que l'Axe 2).

**Emplacement :** relecture générale FR (19 pages).
**Description :** aucune faute d'orthographe ou de grammaire relevée dans les textes visités (accueil, catalogue, fiches produit, packages, panier, compte, FAQ, contact, CGV, confidentialité, à propos, admin). La hiérarchie de titres (H1 unique par page, tailles décroissantes cohérentes) est respectée sur toutes les pages inspectées. Aucun texte tronqué ou débordant de son conteneur observé, y compris en vue mobile 390 px.
**Sévérité :** — (conforme).

**Note :** la relecture ne couvre que le français, langue par défaut. Les versions EN/ES n'ont pas été relues mot à mot dans cet audit (elles avaient été rédigées et non revues par un locuteur natif) — à faire relire si le client compte réellement servir des visiteurs anglophones/hispanophones.

## Axe 4 — Contraste texte/image

**Méthodologie :** identification des zones où du texte est superposé à une photo (bannière d'accueil, cartes catégories), calcul du ratio de contraste WCAG (luminance relative sRGB) entre la couleur du texte et la couleur de fond au point le plus défavorable de l'incrustation, comparé aux seuils du Cahier 7 §8 (4,5:1 texte standard, 3:1 texte large).

### Constat (Important)

**Emplacement :** `components/home/BanniereSolaire.tsx` — bandeau d'accueil, libellé « PACKAGES SOLAIRES CLÉS EN MAIN ».

**Description :** ce libellé (14px, semi-gras, donc « texte standard » au sens WCAG — ne franchit pas le seuil de 18,66px gras requis pour compter comme « texte large ») est affiché en `text-primaire-clair` (`#018DDE`) sur le dégradé sombre superposé à la photo (`from-texte-principal/85` soit `#1F2937` à 85 % d'opacité au point le plus sombre du dégradé). Calcul du ratio de contraste (luminance relative sRGB) entre `#018DDE` et `#1F2937` : **≈ 4,03:1**, sous le seuil de 4,5:1 requis. Le titre et le paragraphe juste en dessous, eux, sont en blanc plein et passent largement (contraste ≈ 15,8:1 sur le même fond).

**Sévérité :** Important (échec mesuré du critère WCAG 2.2 AA explicitement fixé au Cahier 7, sur l'écran le plus visible du site).

**Recommandation :** passer ce libellé en blanc (comme le titre et le paragraphe) — cohérent visuellement et garantit la conformité —, ou assombrir davantage le point du dégradé où il se trouve. Éviter `text-primaire-clair` sur fond photo sombre en général : cette couleur n'est fiable en contraste que sur fond clair/neutre (elle passe bien en usage normal, ex. liens sur fond blanc).

**Statut : corrigé.** Le libellé utilise désormais `text-white` (`components/home/BanniereSolaire.tsx`), identique au titre et au paragraphe déjà conformes — contraste ≈ 15,8:1 sur ce même point du dégradé. Vérifié : `tsc --noEmit` et ESLint propres sur le fichier modifié.

### Autres emplacements vérifiés (conformes)

**Emplacement :** `components/home/CategoriesPhares.tsx` — libellés « Énergie solaire », « Sécurité », « Climatisation », « Électronique » sur les cartes de la page d'accueil.
**Description :** texte blanc plein sur dégradé sombre (`from-texte-principal/70`) ancré en bas de carte — inspection visuelle et vérification du code confirment un contraste large (blanc sur fond très sombre au point d'ancrage du texte). Conforme.
**Sévérité :** — (conforme).

**Point de vigilance spécifique (vérifié, pas de problème trouvé) :** les visuels marketing sécurité utilisés en l'état (cf. Axe 2) contiennent déjà du texte anglais incrusté dans l'image. Vérifié qu'aucun texte d'interface ATC (badges, boutons, légendes) n'est jamais positionné par-dessus ces visuels — ils sont affichés dans leur propre conteneur, sans superposition d'UI. Le problème de ces visuels est traité à l'Axe 2 (choix de l'image), pas un problème de contraste au sens de cet axe.

## Axe 5 — Doublons d'images

**Méthodologie :** délégué à un passage dédié — inspection visuelle directe (fichier par fichier) de l'intégralité des 3 catalogues sécurité (tous sous-dossiers), du dossier énergie solaire (17 photos) et climatisation (9 photos), soit 69 images vues une à une. Les deux pistes connues signalées dans la consigne d'audit ont été vérifiées en premier, puis l'ensemble des dossiers a été scanné sans s'y limiter, comme demandé.

### catalogue-02-camera-ptz-standard

**Emplacement :** `03-caracteristiques\caracteristiques-03.webp` et `caracteristiques-06.webp`
**Description :** même slide « IP66 Waterproof » (même texte, même photo produit sous la pluie). `caracteristiques-03.webp` = 1000×1000 (63 720 octets) ; `caracteristiques-06.webp` = 800×910 recadré (53 834 octets), et rompt aussi l'ordre logique du diaporama.
**Sévérité :** Mineur.
**Recommandation :** garder `caracteristiques-03.webp` (résolution pleine, cohérente avec le reste du jeu 1000×1000) ; retirer `caracteristiques-06.webp`.

**Emplacement :** `03-caracteristiques\caracteristiques-04.webp` et `caracteristiques-05.webp`
**Description :** même slide « lighting linkage » (même photo, même texte). `caracteristiques-04.webp` = 1000×1000 (59 862 octets) ; `caracteristiques-05.webp` = 800×897 recadré (47 372 octets).
**Sévérité :** Mineur.
**Recommandation :** garder `caracteristiques-04.webp` ; retirer `caracteristiques-05.webp`.

**Emplacement :** `02-mise-en-situation\mise-en-situation-01.webp` et `mise-en-situation-02.webp`
**Description :** même slide « Motion Detection Alarm & Auto Tracking » (même photo cambrioleur/notification téléphone). Correction par rapport à la piste initiale : ce doublon se trouve dans `02-mise-en-situation`, pas `03-caracteristiques` comme le tip d'origine le suggérait. `-01` (1000×1000, 81 850 octets, mise en page resserrée, sans paragraphe) vs `-02` (800×1024, 81 198 octets, avec un paragraphe descriptif en plus).
**Sévérité :** Mineur.
**Recommandation :** garder `mise-en-situation-01.webp` pour la cohérence de format (1000×1000) ; à nuancer si le paragraphe descriptif de `-02` est jugé apporter une information utile — jugement de valeur, pas tranché ici.

`01-dimensions\` et `04-produit-isole\` de ce catalogue : aucun doublon.

### catalogue-03-camera-ptz-solaire

**Emplacement :** `02-mise-en-situation\mise-en-situation-02.webp` et `mise-en-situation-05.webp`
**Description :** même slide « Color & IR Night Vision » (même photo femme de nuit, mêmes vignettes jour/nuit). Confirme la piste connue — les deux copies sont dans `02-mise-en-situation` (pas réparties entre `02` et `03` comme suggéré). `-02` = 1000×1000 (75 704 octets) ; `-05` = 800×1164 (69 060 octets).
**Sévérité :** Mineur.
**Recommandation :** garder `mise-en-situation-02.webp` ; retirer `mise-en-situation-05.webp`.

**Emplacement :** `03-caracteristiques\caracteristiques-02.webp` et `caracteristiques-06.webp`
**Description :** même slide « Solar Energy No need to charge » (même graphique, même texte). `-02` = 1000×1000 (125 362 octets) ; `-06` = 800×990 (136 574 octets — fichier plus lourd malgré moins de pixels, donc moins compressé par pixel).
**Sévérité :** Mineur.
**Recommandation :** garder `caracteristiques-02.webp` pour la cohérence de résolution ; à nuancer si la netteté par pixel de `-06` est jugée prioritaire.

**Non retenu comme doublon (pour information) :** `04-produit-isole\produit-isole-01.webp` et `produit-isole-02.webp` montrent le même produit avec des badges de connectivité différents (« 4G » vs « WiFi ») — variante intentionnelle (deux versions du produit), pas une redondance.

`01-dimensions\` et `05-emballage\` : un seul fichier chacun, pas de doublon possible.

### energie-solaire (hors pistes connues, trouvé lors du scan complet)

**Emplacement :** `energie-02.webp` et `energie-03.webp`
**Description :** deux photos réelles (pas des templates) des mêmes 3 unités de batterie « Lithium Battery 6000+ » dans la même pièce, prises à quelques instants d'écart. Les deux en 1200×1600. `-02` = 111 146 octets (cadrage plus large, les 3 unités entièrement visibles) ; `-03` = 76 438 octets (cadrage plus serré, une unité partiellement coupée).
**Sévérité :** Mineur.
**Recommandation :** garder `energie-02.webp` (meilleur cadrage) ; retirer `energie-03.webp`.

**Emplacement :** `energie-07.webp` et `energie-08.webp`
**Description :** photos d'installation quasi identiques du même onduleur Deye + tableau électrique + batteries, même angle, même cadrage. Toutes deux 567×1008 exactement. `-07` = 28 612 octets vs `-08` = 19 354 octets (nettement plus compressée à résolution identique).
**Sévérité :** Mineur.
**Recommandation :** garder `energie-07.webp` (mieux préservée) ; retirer `energie-08.webp`.

**Vérifié, non retenu :** `energie-06.webp` montre les mêmes 3 unités que -02/-03 mais en gros plan avec les écrans LCD lisibles — cadrage suffisamment différent (plan de détail vs plan d'ensemble) pour être une photo distincte légitime.

Le reste des photos énergie solaire (01, 04, 09 à 17) : produits ou sites d'installation tous distincts, aucun doublon.

### climatisation

Aucun doublon trouvé sur les 9 photos — chaque installation photographiée est visuellement distincte (pièces, meubles, éléments de décor différents), malgré des équipements similaires. Note : `climatisation-08.webp` et `climatisation-09.webp` montrent le même climatiseur « EVP.3 » Carrier à deux stades de chantier différents (avant/après pose des gaines) — documentation de progression, pas une redondance.

### catalogue-01-sonnette-video

Aucun doublon trouvé sur les 11 photos (dimensions, mise en situation ×3, caractéristiques ×5, produit isolé, emballage) — toutes visuellement distinctes.

### Résumé Axe 5

7 paires de doublons confirmées (tous Mineur), sur 69 images inspectées : 3 dans `catalogue-02-camera-ptz-standard`, 2 dans `catalogue-03-camera-ptz-solaire`, 2 dans `energie-solaire`. `catalogue-01-sonnette-video` et `climatisation` sont propres.

**Statut : corrigé.** Les 7 fichiers redondants ont été supprimés de `Photos-Traitees\` (dossier source de documentation) :
- `securite-marketing-fournisseur\catalogue-02-camera-ptz-standard\03-caracteristiques\caracteristiques-06.webp`
- `securite-marketing-fournisseur\catalogue-02-camera-ptz-standard\03-caracteristiques\caracteristiques-05.webp`
- `securite-marketing-fournisseur\catalogue-02-camera-ptz-standard\02-mise-en-situation\mise-en-situation-02.webp`
- `securite-marketing-fournisseur\catalogue-03-camera-ptz-solaire\02-mise-en-situation\mise-en-situation-05.webp`
- `securite-marketing-fournisseur\catalogue-03-camera-ptz-solaire\03-caracteristiques\caracteristiques-06.webp`
- `energie-solaire\energie-03.webp`
- `energie-solaire\energie-08.webp`

**Point de vigilance vérifié avant suppression :** contrairement à l'hypothèse initiale (« aucun n'est référencé dans le code »), `energie-08.webp` est en réalité utilisé par `prod-regulateur-mppt-60a` (`img.energie(8)`, deuxième visuel). Vérifié que ce nom de fichier renvoie à une **copie distincte** dans `site-web/public/images/energie-solaire/energie-08.webp`, non affectée par la suppression du fichier source dans `Photos-Traitees\` — les deux dossiers ne sont pas liés. Le site reste donc fonctionnellement intact ; seul le doublon dans le dossier de documentation source a été retiré. Vérifié après coup : le fichier servi par le site est toujours présent.
