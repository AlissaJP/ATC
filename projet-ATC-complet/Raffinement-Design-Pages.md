# RAFFINEMENT DESIGN — PAGE PAR PAGE

## Plateforme e-commerce ATC (Alpha Tech Center)

---

**Objet de ce document :** contrairement aux 15 cahiers de spécification, ce document n'est pas figé après validation — c'est un **document de travail vivant**, mis à jour au fur et à mesure qu'on affine chaque page avec vous, à partir d'images d'inspiration que vous fournissez. Le Cahier UX/UI (Cahier 7) reste la référence structurelle validée ; ce document apporte le niveau de détail concret nécessaire à l'implémentation, page par page.

**Méthode appliquée à chaque page :** analyse de la **structure** de l'image de référence fournie (disposition, hiérarchie, composants) — jamais ses couleurs ni sa typographie, qui restent celles d'ATC (palette et polices ci-dessous, confirmées au Cahier 7).

**Règle sur le périmètre des 15 cahiers officiels :** les Cahiers 1 à 15 ayant déjà été transmis à Claude Code, ils ne sont **plus modifiés** à partir de maintenant. Toute nouvelle page ou fonctionnalité identifiée pendant ce travail de raffinement (ex. page « À propos ») est ajoutée **uniquement dans ce document**, avec un identifiant provisoire distinct (`RAFF-XXX`) — jamais un faux `BF-XX` ou `ECR-XX` qui laisserait croire à une mise à jour des cahiers officiels.

**Palette et typographie ATC (rappel, inchangées pour tout le site) :**

| Élément | Valeur |
|---|---|
| Bleu primaire | `#014DAB` |
| Bleu clair (accent secondaire) | `#018DDE` |
| Accent (CTA, éléments forts) | `#FE4028` |
| Titres | Sora |
| Texte courant | Inter |

---

## PAGE 1 — Accueil (ECR-01-001)

### Section 1.1 — En-tête (header) et bannière principale (hero)

**Statut :** ✅ **Validé**

**Titre principal retenu (option F) :** « Le soleil d'Haïti, transformé en énergie fiable. »

#### Référence fournie

Image `header_home.avif` — site e-commerce mode/fitness (Rareblocks). Structure analysée, pas les couleurs ni la typographie.

#### Structure retenue de la référence

- En-tête à deux niveaux : barre utilitaire en haut, navigation par catégories juste en dessous
- Bannière en deux colonnes asymétriques : texte à gauche (~40-45 %), photo pleine hauteur à droite (~55-60 %), bord perdu
- Un petit texte d'accroche au-dessus du grand titre
- Grand titre sur plusieurs lignes, gras, dominant visuellement
- Un bouton d'action unique, clairement visible
- Deux cartes produit « flottantes » superposées sur la photo, à des profondeurs différentes

#### Adaptation proposée pour ATC

**En-tête — Niveau 1 (barre utilitaire), de gauche à droite :**
- Logo ATC (`logo-02-avec-badges`, version recadrée sur le seul bloc « ATC » pour l'en-tête — le tagline complet reste pour le pied de page ou l'à-propos)
- À droite : sélecteur de langue (FR/EN/ES) · lien « Se connecter » / « Mon compte » · icône recherche · icône panier avec badge de quantité

**En-tête — Niveau 2 (navigation catégories) :**
`Électronique · Énergie Solaire · Sécurité · Climatisation` — avec, à l'extrémité droite de cette barre, un lien distinct « Espace Entreprise » (cohérent avec BF-01-002)

**Bannière principale (hero) :**

| Zone | Contenu |
|---|---|
| Colonne gauche | Accroche courte en majuscules, couleur accent : `ÉNERGIE SOLAIRE · INSTALLATION INCLUSE` |
| | Titre principal (3 propositions, à choisir ou reformuler) : <br>**A.** « Votre confort, propulsé par le soleil. » <br>**B.** « L'énergie solaire pensée pour votre quotidien. » <br>**C.** « Produisez votre propre électricité, en toute confiance. » |
| | Bouton principal (accent `#FE4028`) : « Composer mon système solaire » → renvoie vers le configurateur (EPIC-04) |
| | Bouton secondaire (contour, discret) : « Voir le catalogue » |
| Colonne droite | Photo réelle **`energie-solaire/energie-16.webp`** (voir justification ci-dessous) |
| Cartes flottantes sur la photo | Carte 1 : « Panneau solaire 400W » — prix fictif de démonstration + bouton « Voir » <br>Carte 2 : « Batterie lithium 5 kWh » — prix fictif de démonstration + bouton « Voir » |

**Photo retenue : `energie-solaire/energie-16-retouche.webp`** *(version retouchée — recadrage resserré, contraste/saturation/netteté légèrement rehaussés pour un rendu plus premium ; aucune modification de contenu, photo 100 % authentique)*

Choisie parmi 4 candidates réelles pour trois raisons : elle montre à la fois le produit (grand champ de panneaux), le service (deux techniciens en tenue de sécurité — cohérent avec l'installation interne, décision actée n°5), et l'ancrage local (vue panoramique de Port-au-Prince en arrière-plan) — sans logo de marque tierce visible.

**Titre principal (validé) :** « Le soleil d'Haïti, transformé en énergie fiable. »
**Accroche au-dessus du titre :** `ÉNERGIE SOLAIRE · INSTALLATION INCLUSE`

#### Différences volontaires par rapport à la référence

- Pas de mention de code promo (`Use "FIT40" coupon...`) — ATC n'a aucun mécanisme de coupon (décision actée, BF-10-004)
- « Create free account / Login » remplacé par une distinction claire Particulier/Entreprise, cohérente avec le parcours de validation en 4 étapes (décision actée n°17)
- Les cartes flottantes affichent de vrais produits ATC (données fictives de démonstration, décision actée n°42), pas des articles de mode

#### Comportement responsive (mobile-first)

Sur mobile, la disposition à deux colonnes devient une seule colonne : photo en pleine largeur en premier (hauteur réduite), texte et boutons en dessous. Les cartes flottantes superposées ne fonctionnent pas sur petit écran : elles deviennent deux mini-cartes empilées, juste sous le bouton principal, plutôt que superposées à la photo.

---

*Prochaine section à traiter : à définir avec vous (suite de la page d'accueil, ou une autre page de la liste communiquée).*

## PAGE 1 — Accueil (ECR-01-001) *(suite)*

### Section 1.2 — Catégories phares (grille de 4 blocs)

**Statut :** ✅ **Validé** — structure conforme au Cahier 6 (BF-01-008), sans image d'inspiration externe, détaillée ci-dessous pour être directement exploitable.

**Structure :** grille de 4 blocs de largeur égale, juste sous la bannière principale. Chaque bloc : photo en fond, dégradé sombre en bas pour la lisibilité du texte, nom de catégorie, courte accroche, flèche/lien « Découvrir ».

| Bloc | Catégorie | Image retenue | Accroche courte |
|---|---|---|---|
| 1 | Énergie Solaire | `energie-solaire/energie-06.webp` (photo produit, différente de la photo hero pour éviter la répétition) | « Panneaux, batteries, installation complète » |
| 2 | Électronique | **Aucune photo disponible** — voir traitement ci-dessous | « Ordinateurs, moniteurs, connectivité » |
| 3 | Sécurité | `securite-marketing-fournisseur/catalogue-03-camera-ptz-solaire/04-produit-isole/produit-isole-01.webp` | « Caméras et sonnettes connectées » |
| 4 | Climatisation | `climatisation/climatisation-07-recadre.webp` (recadrée, aucun logo tiers visible) | « Confort thermique pour chaque espace » |

**Traitement du bloc Électronique (gap connu) :** en l'absence de photo, ce bloc utilise un fond en dégradé de la palette ATC (bleu primaire vers bleu clair) avec une icône simple (ordinateur/écran, style trait fin cohérent avec le reste du design system) plutôt qu'un espace vide ou une image générique trouvée sur le web sans droits clairs. À remplacer par une vraie photo dès qu'elle sera disponible, sans changement de structure.

**Interaction :** léger zoom de la photo au survol (desktop), toute la carte cliquable vers la page catégorie correspondante (ECR-01-002).

**Responsive :** grille 4 colonnes (desktop) → 2×2 (tablette) → 1 colonne empilée (mobile).

---

*Prochaine section à traiter : à définir avec vous.*

## PAGE 1 — Accueil (ECR-01-001) *(suite)*

### Section 1.3 — Bloc « Devenir client professionnel »

**Statut :** ✅ **Validé** — structure conforme au Cahier 6 (BF-01-010), sans image d'inspiration externe.

**Objectif :** inciter les visiteurs Entreprise à s'inscrire, en mettant en avant l'avantage concret (barème de prix par palier) plutôt qu'un argumentaire générique.

**Structure du bloc (pleine largeur, fond bleu primaire `#014DAB`, texte blanc — rupture visuelle volontaire par rapport au fond clair du reste de la page) :**

| Zone | Contenu |
|---|---|
| Colonne gauche (texte) | Titre : « Vous êtes une entreprise ? Accédez à nos tarifs professionnels. » <br>Sous-texte court : « Barème de prix par volume, devis sur-mesure et facturation professionnelle — validation en quelques jours. » <br>Bouton (accent `#FE4028`) : « Créer un compte Entreprise » |
| Colonne droite (visuel) | Petit tableau illustratif simplifié montrant le principe du barème (ex. « 1-9 : $X · 10-49 : $Y · 50+ : $Z »), plutôt qu'une photo — reflète directement le mécanisme différenciant (décision actée n°16) sans dépendre d'une photo produit |

**Interaction :** le bouton renvoie vers `ECR-08-001` (inscription Entreprise, étape 1/4).

**Responsive :** sur mobile, le tableau illustratif passe sous le texte plutôt qu'à côté, colonne unique.

---

*Prochaine section à traiter : à définir avec vous (bloc de réassurance, ou passage à une autre page de la liste).*

## PAGE 1 — Accueil (ECR-01-001) *(suite)*

### Section 1.4 — Bloc de réassurance (4 éléments)

**Statut :** ✅ **Validé**

#### Référence fournie

Image `section.avif` — rangée de 4 pictogrammes avec texte (site générique). Structure analysée : icône trait fin à gauche, titre en gras + sous-texte gris à droite, alignement horizontal, pas de carte ni de bordure, fond neutre.

#### Adaptation retenue pour ATC

Rangée de **4 éléments** égaux (au lieu des 3 initialement prévus au Cahier 6 — ajout demandé de la qualité produit), positionnée sous le bloc « Devenir client professionnel ».

| # | Icône (style trait fin, bleu primaire `#014DAB`) | Titre | Sous-texte |
|---|---|---|---|
| 1 | Bouclier + carte de paiement | Paiement sécurisé | MonCash, carte ou PayPal, en toute confiance |
| 2 | Bâtiment / point de repère | Retrait en magasin | Récupérez votre commande à votre convenance |
| 3 | Bulle de discussion (style WhatsApp) | Support WhatsApp | Une question ? Nous répondons rapidement |
| 4 | Médaille / coche de qualité | Produits de qualité | Sélectionnés et garantis par ATC |

**Différence volontaire par rapport à la référence :** l'élément « Free Delivery » de l'image source est **délibérément absent** — ATC ne propose aucun service de livraison (décision actée n°27). C'est précisément pourquoi ce 4ᵉ emplacement a été réattribué à la qualité produit plutôt que reproduit tel quel.

**Mise en page :** 4 colonnes égales sur desktop, fond blanc ou gris très clair (`#F7F8FA`), aucune carte/bordure — juste l'alignement icône + texte, comme dans la référence.

**Responsive :** 2×2 sur tablette, empilé en 1 colonne sur mobile.

---

*Ceci clôt la page d'accueil (4 sections validées : hero, catégories phares, devenir client professionnel, réassurance). Prochaine étape : une autre page de la liste, à votre choix.*

## PAGE 1 — Accueil (ECR-01-001) *(suite)*

### Section 1.5 — Chiffres clés (nouvelle section, ajoutée après la réassurance)

**Statut :** ✅ **Validé**

#### Référence fournie

Image `section_home2.avif` — bloc centré (icône + titre + sous-titre) suivi de 3 statistiques alignées horizontalement avec séparateurs verticaux (« 40+ Integrations », « 600% Return on investment », « 4k+ Global customers »).

#### Adaptation retenue pour ATC

**En-tête du bloc (centré) :**
- Icône : éclair (reprend le pictogramme « Électricité » du logo ATC), sur cercle de fond bleu clair `#018DDE` à 10 % d'opacité
- Titre (validé) : « La confiance de centaines de clients en Haïti et dans la diaspora »
- Sous-titre : « Des particuliers aux entreprises, un même engagement de qualité. »

**Les 3 statistiques (validées, avec séparateurs verticaux, gros chiffre en accent `#FE4028` + libellé en dessous) :**

| # | Chiffre *(fictif, démonstration)* | Libellé |
|---|---|---|
| 1 | 500+ | Clients satisfaits |
| 2 | 80+ | Comptes professionnels vérifiés |
| 3 | 300+ | Installations solaires réalisées |

**⚠️ Toutes les valeurs restent des données fictives de démonstration** (décision actée n°42), à remplacer dès que les vrais chiffres seront disponibles.

**Mise en page :** fond blanc ou très légèrement teinté (`#F7F8FA`) pour distinguer ce bloc du blanc pur de la section précédente, séparateurs verticaux fins entre les 3 statistiques (desktop uniquement).

**Responsive :** les 3 statistiques s'empilent verticalement sur mobile, séparateurs remplacés par un léger espacement.

---

*Ceci clôt la page d'accueil (5 sections validées : hero, catégories phares, devenir client professionnel, réassurance, chiffres clés). Prochaine étape : une autre page de la liste, à votre choix.*

## ÉLÉMENTS TRANSVERSES (présents sur toutes les pages)

### Pied de page (Footer)

**Statut :** ✅ **Validé**

#### Référence fournie

Image `pied_de_page.avif` (ClarityUI) — 4 colonnes (logo+description, liens Entreprise, liens Aide, newsletter), séparateur horizontal, copyright centré en bas.

#### Adaptation retenue pour ATC

| Colonne | Contenu |
|---|---|
| **1 — Logo & description** | Logo ATC (version compacte) + courte description : « ATC (Alpha Tech Center) — Énergie solaire, électronique, sécurité et climatisation, en Haïti et pour la diaspora. » |
| **2 — ENTREPRISE** | À propos *(nouvelle page, `RAFF-A-PROPOS`)* · Blog (ECR-11-002) · Devenir client professionnel |
| **3 — AIDE** | FAQ (ECR-11-001) · Contact (ECR-11-003) · CGV · Politique de confidentialité *(ECR-11-004)* |
| **4 — NEWSLETTER** | Champ email + bouton « S'inscrire » (bleu primaire `#014DAB`), rattaché à BF-10-003 |

**Séparateur horizontal fin**, puis en bas, centré : « © 2026 ATC (Alpha Tech Center). Tous droits réservés. »

#### Différences volontaires par rapport à la référence

- **« Delivery Details » n'est pas repris** — ATC ne propose aucune livraison (décision actée n°27) ; remplacé par « Devenir client professionnel » dans la colonne Entreprise.
- Aucune icône réseau social ajoutée — je n'ai pas d'information sur d'éventuels comptes ATC existants. Dites-moi si vous en avez et je les ajoute.

**Responsive :** les 4 colonnes s'empilent verticalement sur mobile, dans le même ordre.

---

## NOUVELLE PAGE — À propos *(ajout hors périmètre des 15 cahiers)*

**Statut :** ✅ Ajoutée — **consignée uniquement dans ce document de raffinement**. Les Cahiers 2, 3 et 6 restent inchangés (toujours 92 besoins, 30 écrans), conformément à votre consigne puisque les cahiers d'origine ont déjà été transmis à Claude Code. Identifiant provisoire pour cette page, propre à ce document : `RAFF-A-PROPOS` (ne correspond à aucun `BF-XX` ou `ECR-XX` officiel).

**Objectif :** rassurer et humaniser la marque, en particulier pour la clientèle Entreprise et diaspora qui n'a pas de contact physique avec ATC avant l'achat.

**Structure proposée (pas d'image de référence fournie pour cette page — structure standard adaptée au contenu disponible) :**

| Section | Contenu |
|---|---|
| 1. Bannière | Photo réelle `energie-solaire/energie-13.webp` (technicien devant armoire électrique, différente des photos déjà utilisées en accueil) + titre « À propos d'ATC » + reprise du tagline officiel du logo : « Nous faisons de l'énergie solaire, de l'électricité et de la climatisation votre confort. » |
| 2. Notre mission | Court texte de présentation *(placeholder à valider par ATC)* : « Basée en Haïti, ATC accompagne particuliers et entreprises dans leurs projets d'énergie solaire, d'électronique, de sécurité et de climatisation — avec une exigence : une installation réalisée par notre propre équipe technique, de bout en bout. » |
| 3. Nos valeurs (4 blocs icône + texte, même style que la réassurance) | Qualité · Proximité (Haïti + diaspora) · Expertise technique · Confiance |
| 4. Nos chiffres | Réutilisation du bloc « Chiffres clés » déjà validé en page d'accueil (section 1.5) — cohérence visuelle, pas de contenu dupliqué inutilement |
| 5. Appel à l'action final | « Prêt à démarrer votre projet ? » + deux boutons : « Découvrir nos produits » et « Nous contacter » |

**⚠️ Le texte de la section 2 (mission) est un texte de démonstration** — à remplacer par votre propre texte dès que possible ; je peux vous en proposer plusieurs variantes si besoin.

**Responsive :** sections empilées verticalement, comportement standard déjà établi pour le reste du site.

---

## PAGE — Catalogue & Résultats de recherche (ECR-01-002 + ECR-02-001, template partagé)

**Statut :** ✅ **Validé** — toutes les sections de la référence sont conservées, comme demandé

#### Référence fournie

Image `1.avif` (« What a Market! ») — page de résultats de recherche marketplace : en-tête avec barre de recherche pleine largeur, navigation secondaire par catégories, filtres à facettes en colonne gauche, grille produit à droite avec notes/avis, widget de chat flottant.

#### Pourquoi un template partagé

Le même gabarit sert pour **deux écrans du Cahier 6** : la page catégorie (ECR-01-002) et les résultats de recherche (ECR-02-001). Seule change la ligne de titre en haut des résultats — le reste (filtres, grille, tri) est identique, ce qui correspond exactement à la structure de la référence.

#### Adaptation retenue pour ATC

**En-tête (reprend la structure déjà validée, section transverse) :** la barre de recherche s'affiche en version étendue et pré-remplie sur cette page (au lieu de la simple icône des autres pages) — comportement naturel de l'en-tête existant, pas un nouveau design. **Icône « Favoris » (validé) :** ajoutée au header global, mais **affichée uniquement pour un client connecté** (Particulier ou Entreprise) — invisible pour un visiteur non connecté, cohérent avec le fait que les favoris nécessitent un compte (BF-08-004).

**Ligne de titre des résultats :**
- Recherche : « 42 résultats pour « panneau solaire » »
- Catégorie : « 42 produits dans Énergie Solaire »
- À droite : tri (« Pertinence · Prix croissant · Prix décroissant · Nouveautés ») + bascule vue grille/liste

**Filtres (colonne gauche), adaptés au catalogue ATC — et rendus dynamiques par catégorie, contrairement à la référence qui les affiche fixes :**

| Filtre | Toujours présent ? | Exemple par catégorie |
|---|---|---|
| Prix (Min/Max) | Oui, toutes catégories | — |
| Caractéristiques techniques | Change selon la catégorie affichée | Énergie Solaire : Puissance (W), Capacité batterie (Ah/kWh), Type de composant · Climatisation : Puissance (BTU), Type (split/fenêtre/gainable) · Sécurité : Alimentation (solaire/secteur), Résolution |
| Marque | Oui, liste dynamique selon les produits présents | — |
| Disponible en package | Uniquement Énergie Solaire (BF-02-004) | — |
| Disponibilité | Oui, toutes catégories | En stock uniquement / Tous |

**Carte produit (grille), adaptée avec les éléments spécifiques à ATC absents de la référence :**

| Élément | Détail |
|---|---|
| Photo | Issue de `Photos-Traitees\` selon la catégorie |
| Cœur (favoris) | Repris tel quel de la référence (BF-08-004) |
| Badge de stock | **Ajout ATC** (absent de la référence) — pastille couleur en coin de l'image : vert/orange/rouge/gris selon RG-03-002 |
| Nom du produit | — |
| Prix | Client standard : prix public. **Compte Entreprise vérifié :** « À partir de $X (tarif pro) », reflétant le palier le plus avantageux — détail complet des paliers renvoyé à la fiche produit (ECR-03-001), pas affiché ici pour ne pas surcharger la grille |
| Note + nombre d'avis | Repris tel quel de la référence (BF-10-006) |
| Icône « + » (ajout rapide) | Ajout direct au panier depuis la grille, sans passer par la fiche produit |

**Éléments conservés tels quels de la référence :** widget de chat flottant en bas à droite (correspond au support WhatsApp/chatbot déjà prévu, BF-09-003) — confirme sa présence sur cette page aussi, pas seulement l'accueil.

#### Différences volontaires par rapport à la référence

- **Sélecteur de localisation (« California »)** absent — ATC n'a pas de logique multi-région/entrepôt local par ville.
- **« Become a seller »** absent — ATC n'est pas une marketplace multi-vendeurs (décision actée dès le Cahier de Vision).
- **Onglets « Best Sellers », « New Releases », « Books »...** remplacés par les 4 vraies catégories ATC (Électronique, Énergie Solaire, Sécurité, Climatisation), déjà définies en en-tête (section transverse).

**Responsive :** filtres déplacés dans un panneau coulissant (bottom sheet) activé par un bouton « Filtrer », grille passant de 3 colonnes à 2 puis 1 selon la largeur d'écran.

---

## PAGE — Fiche Produit (ECR-03-001)

**Statut :** ⏳ **En construction** — seul le bloc « Avis clients » est détaillé pour l'instant (image reçue) ; le reste de la fiche (galerie, barème B2B, bouton d'achat) sera traité dans une prochaine session.

### Bloc « Avis clients »

**Statut :** ✅ **Validé**

#### Référence fournie

Image `au_dessous_des_produits.avif` — bloc « Customer reviews & ratings » : synthèse de la note moyenne + répartition par étoile (5 à 1), suivi de la liste des avis individuels (note, auteur, date, badge vérifié, titre, texte).

#### Adaptation retenue pour ATC

**Synthèse (2 colonnes, en haut du bloc) :**
- Gauche : titre « Avis clients » + note moyenne en étoiles + « (4,6 sur 5) » + « Basé sur 128 avis » *(valeurs fictives de démonstration, décision actée n°42)*
- Droite : répartition par étoile (5 → 1), une barre horizontale + le nombre d'avis pour chaque niveau

**Liste des avis (répétée pour chaque avis, séparateur entre chaque) :**
- Colonne gauche : note en étoiles · nom du client · date · badge « Achat vérifié » (coche verte)
- Colonne droite : titre de l'avis (gras) · texte de l'avis

**Note sur le badge « Achat vérifié » :** chez ATC, seul un client ayant réellement acheté le produit peut laisser un avis (BF-10-006) — tous les avis affichés sont donc par nature vérifiés. Le badge est conservé malgré tout comme signal de confiance visuel immédiat, cohérent avec la référence.

**Position sur la page :** sous le bloc principal de la fiche produit (galerie, prix/barème, bouton d'achat), avant le bloc « Produits associés » déjà prévu au Cahier 6.

**Modération :** les avis affichés ici sont uniquement ceux déjà validés par l'administrateur (ECR-12-003, RG-12-002) — aucun avis en attente de modération n'apparaît côté client.

**Responsive :** la synthèse (2 colonnes) passe en 1 colonne empilée sur mobile ; chaque avis individuel reste en 2 colonnes (note/auteur à gauche, texte à droite) jusqu'à ce que l'écran devienne trop étroit, puis empile également.

---

*Prochaine étape : galerie photo, affichage du barème B2B et bouton d'achat de la fiche produit — dès que vous avez une image d'inspiration, ou je pars du Cahier 6 directement.*

---

## PAGE — Confirmation de commande & statut de retrait (ECR-05-002)

**Statut :** ✅ **Validé**

#### Référence fournie

Image `payment_confirmation.avif` — carte de confirmation centrée : coche verte, message de succès, numéro de commande, adresse de livraison + moyen de paiement en 2 colonnes, liste des articles, sous-total/total, bouton « View Invoice », fil d'Ariane du parcours de commande en haut.

#### Adaptation retenue pour ATC

**Fil d'Ariane du parcours (haut de page), simplifié :**
`Panier → Paiement → Confirmation` *(la référence a une étape « Shipping Address » supplémentaire, retirée — sans objet chez ATC)*

**Carte de confirmation (centrée, structure conservée) :**

| Zone | Référence | Adaptation ATC |
|---|---|---|
| Icône + titre | Coche verte + « We received your order! » | Coche verte + « Nous avons bien reçu votre commande ! » |
| Sous-titre | « Your order #... is completed and ready to ship » | « Votre commande **#XXXXXX** est confirmée et en cours de préparation. Vous serez averti dès qu'elle sera prête. » *(reflète le vrai statut initial — RG-05-001 : `En préparation`, pas encore `Prête pour retrait`)* |
| Bouton coin supérieur | « View Invoice » | « Télécharger la facture pro forma » (compte Entreprise) ou « Télécharger le reçu » (compte Particulier) |
| Colonne gauche | SHIPPING ADDRESS | **MODALITÉS DE RETRAIT** — lieu et horaires de retrait (ECR-05-002, déjà prévu au Cahier 6) |
| Colonne droite | PAYMENT INFO (Credit Card, Visa, ****4660) | **MOYEN DE PAIEMENT** — MonCash (montant HTG affiché) / Carte •••• 4660 / PayPal, selon le choix réel du client |
| Articles commandés | Photo + nom + variante + prix | Photo + nom + prix **appliqué** (palier B2B le cas échéant) — identique dans l'esprit |
| Sous-total / Total | Sub Total / Total | Sous-total, **Taxe (10 %)** *(décision actée n°18 — nouvelle ligne absente de la référence)*, Total |

#### Différences volontaires par rapport à la référence

- **Aucune mention de livraison ou d'expédition** — remplacée systématiquement par les modalités de retrait (décision actée n°27).
- **Ligne de taxe ajoutée**, absente de la référence mais obligatoire chez ATC (décision actée n°18).
- Le statut affiché reflète fidèlement le cycle réel de la commande (`En préparation` → `Prête pour retrait` → `Retirée`, RG-05-001), pas un simple message statique.

**Responsive :** carte pleine largeur sur mobile, les 2 colonnes (retrait/paiement) s'empilent.

---

*Prochaine étape : nouvelle page à traiter — dites-moi laquelle.*

---

## NOUVELLE SOUS-SECTION — Moyens de paiement enregistrés *(ajout à l'Espace Client, hors périmètre des 15 cahiers)*

**Statut :** ✅ **Validé** — identifiant provisoire `RAFF-MOYENS-PAIEMENT`, consigné uniquement ici (voir règle en introduction). Le Cahier 6 (ECR-08-003) listait « historique, statut du compte, carnet d'adresses, favoris » pour l'Espace Client, sans section dédiée aux moyens de paiement enregistrés — cet ajout comble ce manque.

#### Référence fournie

Image `method_payment.avif` — liste de moyens de paiement enregistrés, une ligne par méthode : logo, libellé, date d'expiration, liens « Set as default » / « Edit », case de sélection à droite (méthode par défaut mise en évidence par un fond teinté).

#### Adaptation retenue pour ATC

Structure identique, mais limitée aux **3 moyens de paiement réels d'ATC** (RG-06-001 — rappel : MonCash, Carte, PayPal ; pas de virement bancaire) au lieu des 5 fournisseurs génériques de la référence :

| Ligne | Icône | Libellé | Info secondaire | Actions |
|---|---|---|---|---|
| 1 *(par défaut, ligne mise en évidence)* | Visa/Mastercard | Carte •••• 1234 | Expire 06/2027 | Définir par défaut · Modifier |
| 2 | MonCash | MonCash — •••• 5678 | Numéro enregistré | Définir par défaut · Modifier |
| 3 | PayPal | PayPal connecté | j\*\*\*@exemple.com | Définir par défaut · Modifier |

En bas de liste : lien « + Ajouter un moyen de paiement » (permet d'enregistrer une carte supplémentaire, un autre numéro MonCash, ou reconnecter un compte PayPal différent).

**Double usage de cette section :**
1. Dans l'**Espace Client** (nouvelle sous-section), pour une gestion autonome par le client.
2. Réutilisée à l'**écran de paiement** (ECR-06-001) : si des moyens sont déjà enregistrés, ils s'affichent en premier sous cette forme pour une sélection rapide en un clic, avant de proposer la saisie manuelle d'un nouveau moyen.

**Sécurité :** aucune donnée de carte complète n'est stockée par ATC (Cahier 8, section 7) — seuls les 4 derniers chiffres et la date d'expiration sont conservés, le reste étant géré par le prestataire de paiement (PSP) ou MonCash/PayPal directement.

**Responsive :** liste déjà verticale par nature — inchangée sur mobile, actions (« Définir par défaut » / « Modifier ») empilées sous le libellé si l'espace horizontal manque.

---

## PAGE — Connexion / Inscription Particulier (B2C) *(détail complet, page seulement esquissée dans le Cahier 6)*

**Statut :** ✅ **Validé** — inclut un ajout hors périmètre des 15 cahiers (connexion sociale), noté `RAFF-CONNEXION-SOCIALE`

**Périmètre de cette page :** uniquement les comptes **Particulier**. Le parcours Entreprise garde son propre écran dédié (ECR-08-001, inscription en 4 étapes avec documents légaux) — la connexion sociale ne s'y applique pas, une entreprise devant fournir des informations vérifiables qu'un simple compte Google/Facebook ne peut pas garantir.

#### Référence fournie

Image `connection_inscription_B2C.avif` — boutons de connexion sociale (Google, Facebook, Apple), en deux variantes : boutons pleine largeur avec libellé, ou icônes compactes côte à côte.

#### Structure retenue pour ATC

**Un seul écran, deux modes** (bascule par onglet ou lien) : « Se connecter » / « Créer un compte ».

**Mode Connexion :**
1. Champ email *(déjà existant, conservé tel quel)*
2. Champ mot de passe
3. Bouton « Se connecter » (accent `#FE4028`)
4. Lien « Mot de passe oublié ? »
5. Séparateur « — OU —»
6. **3 boutons de connexion sociale, pleine largeur avec icône + libellé** (variante retenue plutôt que les icônes seules, pour rester conforme à l'accessibilité WCAG 2.2 AA déjà actée — un bouton icône seule sans texte est ambigu) : « Continuer avec Google », « Continuer avec Facebook », « Continuer avec Apple »
7. En bas : « Pas encore de compte ? **Créer un compte** »

**Mode Inscription :** mêmes principes — nom, email, mot de passe, bouton « Créer mon compte », puis même bloc de connexion sociale en alternative rapide.

#### Point technique à anticiper

La connexion sociale (Google/Facebook/Apple) est une **nouvelle intégration technique**, absente du Cahier 10 (qui couvre MonCash, PSP carte, PayPal, WhatsApp). Comme pour ces derniers, elle nécessite la création de comptes développeur et l'enregistrement de l'application auprès de chaque fournisseur (Google Cloud Console, Facebook for Developers, Apple Developer) — à prévoir par le prestataire de développement (décision actée n°35), avec votre validation finale sur les comptes utilisés.

**Responsive :** boutons sociaux déjà pleine largeur — inchangés sur mobile.

---

# SECTION ADMINISTRATION (BACK-OFFICE)

## Navigation latérale — transverse à tout le back-office

**Statut :** ✅ **Validé** — mis à jour avec des sous-sections (image `mode_payment_dashboard.avif` reçue), le même traitement étant appliqué à toutes les sections qui s'y prêtent, pas seulement Paiements.

#### Référence complémentaire fournie

Image `mode_payment_dashboard.avif` (Stripe) — dans la barre latérale, l'élément « Payments » actif affiche directement en dessous, en retrait et sans icône, ses sous-éléments (Reviews, Disputes, Top-ups, Check deposits, Payouts, All transactions).

#### Structure complète retenue pour ATC

Barre latérale fixe, regroupée par section. Chaque **section principale** peut avoir des **sous-éléments** indentés en dessous, affichés uniquement quand la section est active/dépliée (même comportement que la référence) :

| Groupe | Section principale | Sous-éléments |
|---|---|---|
| *(sans groupe)* | Tableau de bord | — |
| **VENTES** | Catalogue | Produits · Barèmes B2B · Stock |
| | Packages | — |
| | Devis | En attente · Répondus · Acceptés / Expirés *(reprend RG-04-001)* |
| | Commandes | En préparation · Prêtes pour retrait · Retirées *(reprend RG-05-001)* |
| | **Paiements** *(nouveau, demandé)* | **Tous les paiements · MonCash · Carte · PayPal** *(reprend RG-06-001 — rappel : pas de virement)* |
| **CLIENTS** | Clients | Particuliers · Entreprises *(badge si dossiers en attente de validation)* |
| | Avis clients | — |
| **SUPPORT** | Assistance / SAV | Tickets SAV · Installations planifiées |
| **CONTENU** | Contenu | FAQ · Blog · Mentions légales & CGV |
| **PILOTAGE** | Statistiques | — *(un seul tableau de bord analytique, pas de sous-vues séparées)* |
| *(bas de page)* | Paramètres généraux | Langues · Taux de change · Notifications |
| | Comptes administrateurs | — |
| | Déconnexion | — |

**Logique appliquée pour décider où ajouter des sous-éléments :** uniquement là où une section regroupe déjà, dans les cahiers d'origine, plusieurs sous-thèmes distincts (ex. Paramètres généraux couvrait déjà 3 réglages différents au Cahier 3) ou plusieurs statuts significatifs (ex. les états d'un devis ou d'une commande). Les sections déjà atomiques (Packages, Avis clients, Comptes administrateurs) restent sans sous-menu — ajouter des sous-éléments artificiellement aurait nui à la clarté plutôt que de l'améliorer.

**Visibilité selon le rôle (RG-12-001, rappel) :** un **Agent SAV** ne voit que Tableau de bord, Devis (avec ses sous-éléments), Commandes (avec ses sous-éléments), Clients, Assistance/SAV — Catalogue, Packages, **Paiements**, Contenu, Statistiques, Paramètres et Comptes administrateurs restent invisibles, sous-éléments compris.

**Élément de la référence volontairement exclu :** le bouton « Connect New Account » (spécifique à un outil connectant plusieurs boutiques) n'a pas d'équivalent chez ATC — un seul back-office, une seule boutique.

---

## PAGE — Tableau de bord administrateur (ECR-12-001)

**Statut :** ✅ **Validé**

#### Référence fournie

Image `Dashboard.avif` (ClarityUI) — barre latérale, en-tête avec recherche/notifications/profil, message d'accueil, 4 cartes KPI, graphique de ventes (avec sélecteur de période), widget de répartition (barres horizontales), liste de transactions avec statuts colorés, liste de clients récents.

#### Adaptation retenue pour ATC

**Barre du haut :** recherche (produit/client/commande) · icône notifications · nom + avatar de l'administrateur connecté

**Message d'accueil :** « Bonjour [Prénom] — voici un résumé de l'activité aujourd'hui »

**4 cartes KPI (au lieu des métriques génériques de la référence) :**

| Carte | Contenu |
|---|---|
| Ventes du jour | Montant + tendance vs hier |
| Devis en attente | Nombre, dont X en attente depuis plus de 48h *(reprend la règle déjà établie au Guide Administrateur)* |
| Commandes du mois | Nombre + tendance vs mois dernier |
| Comptes Entreprise actifs | Nombre + dossiers en attente de vérification |

**Graphique principal (« Évolution des ventes »)** : même structure que la référence — sélecteur de période (7 jours / 30 jours / 12 mois), bouton « Exporter en PDF », courbe avec infobulle au survol sur un point précis.

**Widget de droite — remplace « Traffic Sources » par « Ventes par catégorie »** : réutilise exactement la même structure visuelle (barres horizontales + valeur), mais avec les 4 vraies catégories ATC (Énergie Solaire, Électronique, Sécurité, Climatisation) plutôt que des sources de trafic web — correspond directement à BF-15-001 déjà spécifié.

**Widget « Devis en attente » (remplace « Transactions ») :** liste des devis les plus anciens en premier, chaque ligne : badge de statut coloré (En attente/Répondu — reprend RG-04-001), nom du client, montant estimé, ancienneté, lien direct « Traiter ». Lien « Voir tous les devis » en haut à droite.

**Widget « Dossiers Entreprise en attente » (remplace « Recent Customers ») :** avatar/initiales, nom de l'entreprise, email professionnel, date de soumission, badge si en attente depuis plus de 48h. Lien « Voir tous les dossiers » en bas.

#### Différences volontaires par rapport à la référence

- Aucune métrique n'est un placeholder générique : chaque carte/widget reprend un élément déjà établi dans les Cahiers 1, 6 ou le Guide Administrateur — rien n'a été ajouté sans lien avec le projet.
- Les valeurs de la démo restent fictives (décision actée n°42).

**Visibilité selon le rôle :** un Agent SAV voit une version réduite du tableau de bord — uniquement les cartes/widgets « Devis en attente » et éventuellement « Commandes du mois » ; les ventes, le graphique financier et les dossiers Entreprise restent réservés à l'Administrateur Général.

**Responsive :** peu prioritaire pour un back-office (usage desktop dominant), mais la grille de cartes KPI passe de 4 à 2 colonnes sur tablette, widgets empilés en une colonne sur mobile.

---

*Prochaine étape : nouvelle page admin à traiter (catalogue/barème, traitement des devis, validation Entreprise...), ou retour aux pages client.*
