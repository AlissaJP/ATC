# CAHIER DES EXIGENCES NON FONCTIONNELLES

## Plateforme E-commerce B2B/B2C — Électronique & Énergie Solaire (ATC — Alpha Tech Center)

---

### Page de garde

| | |
|---|---|
| **Projet** | Plateforme e-commerce Électronique, Énergie Solaire, Sécurité & Climatisation |
| **Client** | ATC (Alpha Tech Center) |
| **Type de document** | Cahier des Exigences Non Fonctionnelles (Document 11/15) |
| **Version** | 1.1 |
| **Date** | 01/08/2026 |
| **Statut** | Version finale — validée, plus aucune hypothèse ni question bloquante |
| **Documents parents** | Cahier de Vision (Doc. 1/15), Architecture Logicielle (Doc. 8/15), Données (Doc. 9/15), Intégrations (Doc. 10/15) |
| **Diffusion** | Direction, Produit, Développement, QA, DevOps |
| **Confidentialité** | Document interne — usage projet uniquement |

---

### Historique des versions

| Version | Date | Auteur | Description |
|---|---|---|---|
| 0.1 | 01/08/2026 | Architecte Logiciel (IA) | Rédaction initiale des exigences chiffrées |
| 1.0 | 01/08/2026 | Architecte Logiciel (IA) | Version finale après auto-évaluation et intégration des améliorations |
| 1.1 | 01/08/2026 | Architecte Logiciel (IA) | Mise à jour suite à la résolution de H1-H5 et Q3-Q7 (décisions n°29 à 38) |

---

### Sommaire

1. Introduction et méthodologie
2. Performance
3. Scalabilité et capacité
4. Disponibilité et continuité de service
5. Sécurité
6. Accessibilité
7. Compatibilité
8. Sauvegarde et reprise après sinistre
9. Supervision, journalisation et alerting
10. Maintenabilité et évolutivité
11. Conformité légale et protection des données
12. Internationalisation et référencement (SEO)
13. Synthèse consolidée des exigences
14. Risques
15. Hypothèses
16. Décisions actées
17. Questions restantes
18. Traçabilité et documents liés
19. Conclusion

<!-- pagebreak -->

## 1. Introduction et méthodologie

Ce cahier formalise, avec des cibles **mesurables et vérifiables**, les exigences non fonctionnelles déjà évoquées qualitativement dans les Cahiers 1 (performance, section 11), 7 (accessibilité) et 8 (architecture). Les catégories retenues s'inspirent des caractéristiques qualité standard du secteur (performance, fiabilité, sécurité, compatibilité, maintenabilité).

L'absence de contrainte budgétaire (décision actée n°7) permet de fixer des cibles ambitieuses et réalistes plutôt que des compromis dictés par le coût — sans pour autant sur-dimensionner au-delà du besoin réel (volumétrie de ~50 transactions/jour, décision actée n°12).

## 2. Performance

| Exigence | Cible | Méthode de vérification |
|---|---|---|
| Temps de premier affichage significatif (LCP) | < 2,5 secondes sur connexion 3G simulée, mobile milieu de gamme | Test Lighthouse / WebPageTest en environnement de recette |
| Score de performance Lighthouse (mobile) | ≥ 80 / 100 | Audit automatisé à chaque déploiement en production |
| Temps de réponse API — lecture standard (catalogue) | < 500 ms (95ᵉ percentile) | Tests de charge |
| Temps de réponse API — calcul complexe (barème, devis) | < 1 000 ms (95ᵉ percentile) | Tests de charge |
| Poids de la page d'accueil (hors cache navigateur) | < 1,5 Mo | Audit automatisé |
| Compression et format des images | WebP, redimensionnement automatique par contexte d'affichage | Revue technique |

*Cohérent avec la contrainte de connexions faibles identifiée dès le Cahier de Vision (section 11) et les recommandations du Cahier UX/UI (section 2.2).*

## 3. Scalabilité et capacité

| Exigence | Cible |
|---|---|
| Volumétrie nominale | ~50 transactions/jour (commandes + devis, décision actée n°12) |
| Marge de croissance sans refonte | Absorption de 10× la volumétrie nominale (~500/jour) par simple ajout d'instances applicatives (Cahier 8, section 9) |
| Déclenchement de la montée en charge horizontale | Seuil d'utilisation CPU/mémoire à 70 % soutenu sur 5 minutes |
| Redondance minimale dès le lancement | Au moins 2 instances applicatives actives (Cahier 8, section 9), pour la disponibilité autant que pour la charge |

## 4. Disponibilité et continuité de service

| Exigence | Cible |
|---|---|
| Disponibilité mensuelle cible | 99,5 % (≈ 3h39 d'indisponibilité tolérée par mois) |
| Fenêtre de maintenance planifiée | En dehors des heures de forte affluence (à affiner selon les statistiques réelles post-lancement, module Analytics — EPIC-15) |
| Notification en cas d'incident majeur | Bannière d'information sur la plateforme + communication WhatsApp si le canal est disponible |

*Une cible de 99,5 % est volontairement réaliste plutôt que maximaliste (99,99 % impliquerait une infrastructure multi-région disproportionnée pour la volumétrie visée) — cohérent avec le principe de sobriété face à la sur-ingénierie (Cahier 8, section 3).*

## 5. Sécurité

| Exigence | Cible |
|---|---|
| Chiffrement en transit | TLS 1.2 minimum sur l'ensemble des échanges (BF-13-001) |
| Chiffrement au repos | Documents Entreprise et données personnelles sensibles chiffrés (Cahier 9, section 7) |
| Rotation des secrets (clés API, jetons) | Tous les 6 mois au minimum, ou immédiatement en cas de suspicion de compromission |
| Test d'intrusion (pentest) | Avant la mise en production initiale, puis annuellement |
| Journalisation des actions administrateur sensibles | Conservée 12 mois minimum (Cahier 8, section 7) |
| Limitation de débit (rate limiting) | Sur les endpoints de connexion et de paiement, seuil à définir en phase de développement |

## 6. Accessibilité

| Exigence | Cible |
|---|---|
| Conformité | WCAG 2.2 niveau AA sur l'ensemble des parcours Must have (Cahier UX/UI, section 8) |
| Contraste minimal | 4,5:1 texte standard, 3:1 texte large |
| Navigation clavier | 100 % des composants interactifs accessibles sans souris |
| Test avec lecteur d'écran | Au minimum sur les parcours achat direct, devis, paiement, inscription Entreprise |

## 7. Compatibilité

| Exigence | Cible |
|---|---|
| Navigateurs desktop supportés | 2 dernières versions majeures de Chrome, Firefox, Edge, Safari |
| Navigateurs mobiles supportés | Safari iOS et Chrome Android, 2 dernières versions majeures |
| Largeur d'écran minimale supportée | 320 px (mobile-first, Cahier UX/UI section 3) |
| Résolution des tests de non-régression visuelle | Mobile (375 px), tablette (768 px), desktop (1440 px) |

## 8. Sauvegarde et reprise après sinistre

| Exigence | Cible |
|---|---|
| RPO (perte de données maximale tolérée) | 1 heure (réplication continue de la base de données) |
| RTO (délai de restauration maximal) | 4 heures |
| Fréquence des sauvegardes complètes | Quotidienne, conservées 30 jours glissants |
| Test de restauration | Trimestriel, en environnement de recette |

*Ces cibles, plus ambitieuses qu'une simple sauvegarde quotidienne, sont permises par l'absence de contrainte budgétaire (décision actée n°7) et se justifient par la nature transactionnelle et financière des données (devis, commandes, paiements).*

## 9. Supervision, journalisation et alerting

| Exigence | Cible |
|---|---|
| Supervision temps réel | Disponibilité, temps de réponse, taux d'erreur des services applicatifs et des intégrations externes (Cahier 10) |
| Alerting automatique | Notification immédiate de l'équipe technique en cas d'indisponibilité ou de taux d'erreur anormal |
| Conservation des journaux techniques | 90 jours minimum |
| Tableau de bord de santé système | Accessible à l'équipe technique, distinct du tableau de bord métier (ECR-12-001) |

## 10. Maintenabilité et évolutivité

| Exigence | Cible |
|---|---|
| Couverture de tests automatisés (backend) | ≥ 70 % du code des modules critiques (Paiement, Devis, Compte Client) |
| Documentation technique | README par module, schéma d'API à jour (cohérent avec le découpage modulaire, Cahier 8 section 5) |
| Dette technique | Revue de code obligatoire avant fusion sur la branche principale |

## 11. Conformité légale et protection des données

| Exigence | Cible |
|---|---|
| Politique de confidentialité multi-juridictions | Haïti, USA, Canada, UE le cas échéant (décision actée n°2) |
| Droit d'accès et de suppression des données personnelles | Processus à disposition du client depuis son espace client ou sur demande auprès du support |
| Consentement aux cookies non essentiels | Bandeau de consentement conforme aux standards internationaux |
| Durée de conservation des documents Entreprise | En attente d'arbitrage ATC (question ouverte, reprise du Cahier 9) |

## 12. Internationalisation et référencement (SEO)

| Exigence | Cible |
|---|---|
| Langues | FR/EN/ES, conformément à la décision actée (Cahier de Vision) |
| Balises multilingues | `hreflang` correctement configurées par langue |
| Plan de site (sitemap) | Généré automatiquement, multilingue |
| URLs localisées | Structure d'URL reflétant la langue active |

<!-- pagebreak -->

## 13. Synthèse consolidée des exigences

| ID | Catégorie | Exigence clé | Cible |
|---|---|---|---|
| NFR-01 | Performance | Premier affichage significatif | < 2,5 s (3G simulée) |
| NFR-02 | Performance | Score Lighthouse mobile | ≥ 80/100 |
| NFR-03 | Scalabilité | Marge de croissance sans refonte | 10× la volumétrie nominale |
| NFR-04 | Disponibilité | Disponibilité mensuelle | 99,5 % |
| NFR-05 | Sécurité | Chiffrement en transit | TLS 1.2 minimum |
| NFR-06 | Sécurité | Test d'intrusion | Avant mise en production, puis annuel |
| NFR-07 | Accessibilité | Conformité WCAG | Niveau AA (2.2) |
| NFR-08 | Compatibilité | Largeur d'écran minimale | 320 px |
| NFR-09 | Continuité | RPO / RTO | 1h / 4h |
| NFR-10 | Maintenabilité | Couverture de tests (modules critiques) | ≥ 70 % |
| NFR-11 | Conformité | Politique de confidentialité | Multi-juridictions |
| NFR-12 | Internationalisation | Langues supportées | FR/EN/ES |

## 14. Risques

| Risque | Impact | Niveau |
|---|---|---|
| Cible de performance (2,5 s) difficile à tenir si le catalogue s'enrichit fortement sans optimisation continue | Dégradation de l'expérience sur connexions faibles | Moyen |
| Cible de disponibilité 99,5 % non contractualisée avec les prestataires d'infrastructure/paiement choisis | Écart entre l'engagement interne et la réalité opérationnelle | Faible à moyen |
| Couverture de tests de 70 % non atteinte faute de discipline d'équipe | Risque de régression sur les modules critiques | Moyen |

## 15. Hypothèses

Les cibles chiffrées de ce cahier restent des propositions de bonnes pratiques sectorielles, à valider avec le prestataire de développement déjà identifié par ATC (décision actée n°35). Aucune hypothèse bloquante ne subsiste par ailleurs : H1 à H5 (Cahier UX/UI, Cahier des Tests) et Q3 à Q7 (PSP, équipe de développement, conservation des documents, comptes inactifs, WhatsApp) sont désormais résolues (décisions n°29 à n°38).

## 16. Décisions actées

Reprises à l'identique du Cahier des Règles Métiers, sans modification. Voir Cahier 4 pour la table complète des 39 décisions.

## 17. Questions restantes

Aucune question bloquante ne subsiste. Seule la réception des fichiers de marque ATC (Q2, Cahier UX/UI) reste en attente à l'échelle du projet, sans impact sur ce cahier.

## 18. Traçabilité et documents liés

Ces exigences seront directement reprises :

- Dans le **Cahier des Tests (Cahier 12)**, pour la définition des scénarios de test de performance, de charge, de sécurité et d'accessibilité.
- Dans le **Guide Administrateur (Cahier 13)**, pour les procédures de supervision courantes.
- Dans le **Dossier Final de Validation (Cahier 15)**, pour la consolidation des KPI techniques.

## 19. Conclusion

Ce cahier fixe **12 exigences non fonctionnelles consolidées**, avec des cibles chiffrées couvrant la performance, la scalabilité, la disponibilité, la sécurité, l'accessibilité, la compatibilité, la continuité de service, la maintenabilité, la conformité légale et l'internationalisation. Ces cibles s'appuient sur l'absence de contrainte budgétaire pour rester ambitieuses sans tomber dans la sur-ingénierie déjà écartée au Cahier d'Architecture.

Aucun point bloquant n'empêche la poursuite de la rédaction du **Cahier des Tests (Cahier 12)**.

---

*Fin du Cahier des Exigences Non Fonctionnelles — Document 11/15*
