# Carnet de bord — Fabrice (Scrum Master)

Suivi de mon travail sur Je s’appelle Graine. Les décisions notées ici ont été prises avec l'équipe ; le suivi de l'équipe est dans le [carnet de bord Je s’appelle Graine](CARNET-DE-BORD-JE-S-APPELLE-GRAINE.md), que je tiens à jour.

## 2026-10-23 — Kanban GitHub et cartes du sprint 1

### Travail réalisé

- Kanban GitHub en place : colonnes (Backlog, À faire, En cours, En revue, Terminé), champs Sprint (sprints 1 à 3) et Feature, vues « Sprint en cours », « Backlog » (regroupée par feature) et « Par personne » (regroupée par responsable), issues #1 à #10 ajoutées avec leur sprint et leur feature. Le backlog reste dans l'ordre des numéros des features.
- Cartes du sprint 1 créées à l'avance (#11 à #38), toutes sur le même plan (story, à faire, fini quand, relecteur) : un responsable, des étiquettes, le sprint 1, la feature ou le bloc (base commune, outillage, socle API, mise en page, F1, déploiement, présentation), statut « À faire ». Les cartes de F1 (#26 à #30) sont des sous-issues de #1.
- Règles automatiques du Kanban testées avec une issue d'essai : une nouvelle issue arrive dans « Backlog », une issue fermée passe dans « Terminé », une carte glissée dans « Terminé » ferme son issue. Les règles liées aux PR seront vérifiées mardi avec la PR de la base commune.
- Documents préparés pour l'équipe : le déroulé des deux jours d'initialisation (lundi le back, mardi le front, puis le feu vert pour que chacun commence ses cartes), la démo du Kanban, un guide Git (journée type, une carte de la branche à la fusion, conflits, erreurs courantes), et les sujets transverses avec des exemples dans la fiche d'équipe et dans la feuille de route de chacun.
- Dépôt renommé en `apo-jesappellegraine` sur GitHub et dans mon dossier local ; adresse du dépôt mise à jour (`git remote set-url`) et ancien nom remplacé dans nos documents.
- Sessions communes de lundi et mardi organisées avec Live Share : chacun passe au clavier à tour de rôle.
- Pas de modèles d'issue ni de PR dans notre dépôt : ceux du centre sont gérés dans le dépôt des formateurs (`Projects-CDA`). Ma carte #16 devient l'ouverture de l'issue « Suivi du développement » dans ce dépôt, lundi à 11 h.
- Présentation de l'organisation des sprints et pitch du sprint 1 par Fabrice. Le backlog a été présenté rapidement : il sera relu en détail au sprint planning du lundi 26 octobre.

### Décisions

- **Organisation** : validée par l'équipe (rien n'est figé et fermé).
- **Sessions communes du début du sprint 1** en Live Share : lundi après-midi l'API et la base (Dimitry guide), mardi matin Next.js et Husky (Loïc guide). Chacun passe au clavier à tour de rôle, celui qui guide commite et pousse.
- **Dépôt GitHub renommé** : `apo-greenroots` devient `apo-jesappellegraine`, pour correspondre au nom du projet.

### Ce que j'ai appris

- GitHub Projects : les réglages d'une vue passent par le bouton « View », et « Save » enregistre la vue pour toute l'équipe. Une itération n'a pas de description : l'objectif du sprint se publie avec « Add status update ».
- Les modèles d'issue sont gérés par les formateurs : les issues de suivi s'ouvrent dans leur dépôt, pas dans le nôtre.

### À poursuivre

- Lundi : démo du Kanban, publier l'objectif du sprint, relire les cartes avec l'équipe ; carte #16 à 11 h.
- Remettre le filtre `status:"En cours"` dans la vue « Par personne » après la démo, et remplacer `sprint:"Sprint 1"` par `sprint:@current` dans la vue « Sprint en cours » avant le sprint planning du 2 novembre.
- Vérifier que chacun a accepté l'invitation au Kanban et mis à jour l'adresse du dépôt sur sa machine.

### À valider avec l'équipe

- **Sprint planning** : relire ensemble les cartes déjà créées et les ajuster (responsables, « fini quand », jours).
- **Première fonctionnalité du sprint 1 : la page d'accueil** (US01) binôme (Mahamadou au back, moi au front et aux tests).
- **CRUD au sprint 1** : routes CRUD des arbres (`/api/admin/trees`) activées en développement seulement et montrées à la présentation avec un client HTTP ; F7 les protège par le rôle admin au sprint 2.
- **Présentations** : vendredi 23 octobre, 30 octobre et 6 novembre, démo finale le lundi 16 novembre. Présentateurs proposés : sprint 1 Mahamadou et moi, sprint 2 Shanna et Dimitry, démo finale toute l'équipe. Version présentée figée et déployée le jeudi soir.
- **Répartition du sprint 1 côté front** : la fonction commune d'appel à l'API pour Loïc, la mise en page (en-tête, menu, pied de page, styles de la charte) pour Shanna, à partir de la charte et des maquettes du dossier `docs/design/`.
- **Imports en `.ts` côté API**, comme en formation : modules ECMAScript avec l'option `rewriteRelativeImportExtensions` dans `tsconfig.json` (à confirmer par Dimitry dans ses conventions back).

## 2026-10-22 — Relecture de la documentation et organisation des sprints

### Travail réalisé

- Relecture complète du cahier des charges, des user stories, de la charte et des documents de conception pour corriger les incohérences entre les documents.
- Mise à jour du modèle de données et des diagrammes après la suppression de la table `cart` et le retrait du paiement par carte.
- Report dans la documentation des décisions de la journée : Nodemailer, Nginx, sécurité de la connexion (mot de passe de 12 caractères, CSRF), CGV et administrateur des ventes en évolution.
- Préparation de l'organisation des sprints 1 à 3 : binôme front / back par feature, le dev front écrit les tests, roulement des binômes, relecteur pour chaque feature, rituels sur une semaine.
- Reprise des attendus des sprints donnés par le centre, sprint par sprint, avec un responsable pour chaque contrainte du sujet : premier CRUD (Dimitry), accessibilité et RGPD (Shanna), SEO (Mahamadou), éco-conception (Loïc), plan de tests et issues de suivi (moi), procédure de déploiement (Dimitry).
- Préparation du suivi des tâches sur le Kanban GitHub (GitHub Projects) : colonnes, champ Sprint, modèles d'issue « Tâche » et de Pull Request, découpage du sprint 1 en cartes.
- Déroulé détaillé du lundi 26 octobre (sprint planning et session commune d'installation).
- Création de mon carnet de bord personnel, demandé par le centre de formation.
- Backlog créé sur GitHub : étiquettes (`feature`, `evolution`, `front`, `back`, `tests`, `docs`, `devops`) et une issue par feature (#1 à #9 pour F1 à F9, avec leurs user stories, critères d'acceptation et routes), plus une issue pour les évolutions (#10).

### Propositions à valider avec l'équipe

- **Installation et configuration du projet** faites tous ensemble au début du sprint 1 (lundi après-midi et mardi matin), guidées par Dimitry et Loïc ; je documente ensuite l'installation dans le README et chacun la teste en réinstallant de zéro le mercredi.

### À poursuivre

- Présenter l'organisation des sprints et les propositions ci-dessus au sprint planning du sprint 1 (26 octobre) et les ajuster avec l'équipe.
- Créer le Kanban GitHub et y ajouter les issues #1 à #10 ; faire valider l'ordre du backlog par l'équipe.
- Demander à Loïc, Shanna et Mahamadou de créer leur carnet personnel.
- Scripts SQL (création des tables et données de départ) à écrire à partir du dictionnaire de données et du MPD avant la session de lundi (Dimitry).
- Rappeler à l'équipe que la page « Politique de confidentialité » (US09, F2) a été oubliée sur la maquette.

## 2026-10-21 — Modèle de données, routes admin et diagrammes

### Travail réalisé

- Modèle de données : identité de l'acheteur, nom de l'arbre et lieu de plantation figés dans la commande, dates de changement de statut.
- Routes d'administration regroupées sous `/api/admin`.
- Diagrammes refaits avec PlantUML et user stories alignées avec le cahier des charges.
- Organisation et mise à jour du carnet de bord de l'équipe.
- Wireframe de la page **Connexion / Inscription**.

## 2026-10-20 — Charte de nommage et carnet de bord

### Travail réalisé

- Rédaction de la charte de nommage.
- Création du carnet de bord de l'équipe.

### Décisions (prises avec l'équipe)

- Rôles répartis : je suis **Scrum Master**.
- Chaque membre tient son carnet personnel (`CARNET-DE-BORD-<PRÉNOM>.md`) ; je garde le carnet d'équipe à jour.

## 2026-10-19 — Sprint 0

### Travail réalisé

- Clonage du dépôt du projet.
- Participation à la rédaction du cahier des charges.
