# Carnet de bord — Je s’appelle Graine

## 2026-11-03 — F3 : inscription, déconnexion, droits et tests ; catalogue côté front

### Travail réalisé

- **Inscription `POST /api/users`** (#84) par Dimitry (PR #141 vers `back-F3`, carte terminée) : validation Zod, 409 si l'email existe déjà, mot de passe haché ; middleware `validateContentType` (415 si le body n'est pas du JSON), JSON mal formé → 400.
- **Déconnexion `DELETE /api/auth`** par Shanna (PR #134 vers `back-F3`), protégée ensuite par `isConnected`.
- **`/users/me` (appelée par l'en-tête de Dimitry), droits admin et tests de F3** (#85, #88) par Fabrice (PR #136 vers `back-F3`, en revue) : `checkRoles`, `/api/admin` protégé, tests d'intégration de l'inscription, de la connexion, de la déconnexion et des droits, premiers tests unitaires, section F3 du plan de tests ; `/users/me` renvoie aussi l'adresse et le type de compte, et `getAuthenticatedUser` (`controllers/utils.ts`, comme dans le cours) retrouve le compte connecté : ils préparent F4 (panier), F5 (commande) et F6 (espace client).
- **Page de connexion et en-tête connecté** (#86) par Dimitry sur `front-F3`, relus ensemble.
- **Catalogue côté front** par Loïc (PR #135, #137, #138 et #142 vers `front-F2`) : photos venues de l'API, fonction commune d'appel à l'API, carte arbre du catalogue.
- **Filtre et recherche du catalogue côté API** par Mahamadou sur `feat/tree` : filtre par catégorie, recherche par nom combinable, tests compatibles Windows.

### Branches en cours sur GitHub

| Branche           | Qui        | Contenu                                                       | État                                        |
| ----------------- | ---------- | ------------------------------------------------------------- | ------------------------------------------- |
| `back-F3`         | trinôme F3 | inscription, connexion, déconnexion                           | reçoit les PR de F3, pas encore dans `main` |
| `front-F3`        | Dimitry    | connexion et en-tête connecté (#86), avec `back-F3` fusionnée | pas encore dans `main`                      |
| `feat/tests-auth` | Fabrice    | `/users/me`, droits admin, tests de F3                        | PR #136 vers `back-F3`, en revue            |
| `front-F2`        | Loïc       | catalogue côté front, appel à l'API commun                    | pas encore dans `main`                      |
| `feat/tree`       | Mahamadou  | filtre par catégorie et recherche par nom                     | pas de PR                                   |

La page d'inscription (#121, Shanna) est en cours, sans branche sur GitHub pour l'instant.

### À poursuivre

- F3 : relire la PR #136, terminer `back-F3` et `front-F3`, puis les fusionner dans `main` après vérification.
- F2 : terminer `feat/tree` (filtre et recherche du catalogue) et `front-F2`, puis les fusionner après vérification.
- Page d'inscription (#121) et messages d'erreur des formulaires (#87).
- F5 (commande) : contrat #103, puis back et front.

## 2026-11-02 — Début du sprint 2 : connexion, catalogue et production

### Travail réalisé

- **Sprint 2 préparé** : cartes classées par priorité, contrats d'API dans les cartes de chaque feature, feuilles de route et vues du Kanban.
- **Connexion `POST /api/auth`** (#85) par Shanna et Fabrice (PR #132 vers `Back`) : validation Zod, mot de passe vérifié avec argon2, jeton JWT de 24 h dans le cookie `accessToken` ; `JWT_SECRET` obligatoire en production.
- **Seed** : nouveaux comptes de test, mots de passe de 12 caractères ; `bdd-arbres.json` supprimé.
- **Page de connexion et en-tête connecté** (#86) par Dimitry (PR #130 vers `Front`) : formulaire, messages 401 et 403, déconnexion, retour à la page d'origine après la connexion (US06).
- **Valeurs métier en français** (disponibilité, statut, type de compte, paiement) par Dimitry (PR #124), tests mis à jour.
- **Build de production de l'API corrigé** par Dimitry (PR #127) : les fichiers de test n'entrent plus dans le build ; dépendances npm dédoublonnées (PR #126) ; guide de mise à jour de la BDD de la VM (PR #129).
- **Catalogue** par Loïc et Mahamadou : page `/arbres` (dossier renommé), vignettes `TreeCard`, photos servies par l'API (PR #128), filtre par catégorie côté API (`feat/tree`).

### Décisions

- Organisation du sprint 2 par feature : trinôme (Fabrice, Dimitry, Shanna) sur F3 et F5, binôme (Loïc, Mahamadou) sur F2 et F4 ;
- JWT : un jeton de 24 h.
- Après la connexion, retour vers la page d'origine (US06), validé par le trinôme.
- Mots de passe des comptes clients de test dans le dépôt ; ceux des admins partagés en privé.

### À poursuivre

- Après la fusion de la connexion, chacun recrée le volume `node_modules` de l'API et relance `npm run db:seed`.
- Routes `DELETE /api/auth` et `GET /api/users/me`, utilisées par le front (#86) ; puis inscription (#84, #121).
- Production : `JWT_SECRET` dans le `.env` du VPS, mots de passe admin à changer.
- Déploiements individuels de Mahamadou et Shanna (#34, #36).

## 2026-10-30 — Accueil branché sur l'API, tests et présentation du sprint 1

### Travail réalisé

- **Page d'accueil branchée sur l'API** (#29) par Loïc : les 3 derniers arbres viennent de `GET /api/trees/featured` (PR #73 vers `Front`, puis #74 et #75 vers `main`).
- **Mise en page commune** du front par Shanna (PR #77 vers `Front`).
- **Photos des arbres servies par l'API** par Fabrice (PR #72) : `express.static`, copie des photos dans l'image de production, règle Nginx `/images/trees/` et relais Next.js en dev.
- **Build de production du front corrigé** par Dimitry (PR #76) : guide de déploiement mis à jour.
- **Tests d'intégration de l'API** (#18, #30) par Dimitry, sur `feat/test-setup` : accueil (tri, disponibilité, limite de 3, ...).
- **Présentation du sprint 1** (#38) par Fabrice et Mahamadou : le projet, l'organisation, l'initialisation, puis la feature F1 et sa démo.
- **Kanban** : 20 cartes du sprint 1 terminées sur 28.

### Décisions

- L'API ne sert que les photos des arbres (`/images/trees/`) ; les autres images (logo, icônes) sont dans le `public/` du front.

### À poursuivre

- Fusionner les tests dans `main` (#30).
- Appliquer le contrat #22 (`photoUrl`, `price` en nombre, `categoryName`), renommer `app/trees` en `app/arbres`, `lang="fr"`.
- Valider le guide d'installation (#17) et déploiements - à faire individuels (#34 à #37).
- Sprint planning du sprint 2 lundi.

## 2026-10-29 — Gestion des erreurs, fiche d'un arbre et mise en production

### Travail réalisé

- **Gestion des erreurs de l'API** (#20) par Mahamadou et Fabrice (PR #67 vers `back`, puis PR #68 de `back` vers `main`) :
  - classes d'erreurs dans `src/api/src/lib/errors.ts` (`NotFoundError`, `BadRequestError`…) ;
  - route inconnue → 404, id invalide → 400 (middleware `validateId`), erreur imprévue → 500 sans détail technique ;
  - messages en français, avec le champ `status`.
- **Catalogue et fiche d'un arbre** (bonus #22) :
  - `GET /api/trees` (`findAllCatalog`) par Dimitry : les arbres en vente ;
  - `GET /api/trees/:id` par Fabrice : la fiche, avec la description ; un arbre inexistant ou retiré → 404.
- **Mise en production** (#31) par Dimitry (PR #66) :
  - `docker-compose.prod.yml`, Dockerfiles de production, Nginx et Certbot dans des conteneurs ;
  - guide [DEPLOIEMENT.md](DEPLOIEMENT.md) ;
  - le site est en ligne en HTTPS sur sa VM.
- **Page accueil et catalogue** (desktop et mobile) et header responsive par Shanna et Loïc.
- **Tests de l'API** (#18) : branche `feat/test-setup` poussée, avec la base de test, `npm test` et un premier test d'intégration de `GET /api/trees/featured`(à poursuivre par Dimitry).

### Décisions

- Les messages d'erreur de l'API sont en français : le site s'adresse à un public français, et le front peut afficher le message tel quel.
- Les cartes du sprint 1 ne traitent que les erreurs du sprint 1. Ceux qui développent les features suivantes ajoutent les erreurs qui les concernent.

### À poursuivre

- Dimitry reprend les tests (#18, #30) sur `feat/test-setup` : les autres cas de l'accueil (puis le catalogue, la fiche et les erreurs).
- Photos des arbres : l'API ne les sert pas encore (`express.static`), ni en dev ni en production (Nginx et `Dockerfile.prod` à compléter).
- Délai de connexion du `pg.Pool` : sans lui, une base arrêtée ne renvoie pas l'erreur 500.
- Guide de déploiement : suivre `main` au lieu de `feat/deployment`.
- Préparer la présentation du sprint 1.

## 2026-10-28 — Route de l'accueil et page d'accueil statique

### Travail réalisé

- **Route `GET /api/trees/featured`** par le trinôme du back (PR #61 et #63, fusionnées dans `back`) :
  - DataMapper des arbres (`findAll`, `findFeatured`), contrôleur et routeur ;
  - les 3 derniers arbres disponibles, avec la catégorie (`{ id, name }`), le lieu de plantation et le prix en nombre, comme la vignette de la maquette ;
  - `GET /api/trees` renvoie aussi la liste complète des arbres (bonus #22) ;
  - vérifiées avec REST Client (`src/api/test/test.tree.http`).
- **Page d'accueil statique** par Loïc, sur la branche `welcomePage` (version desktop en cours).
- **Kanban** mis à jour d'après les commits et le code.

### Décisions

- Chaque groupe écrit les tests de ses features ; l'autre groupe relit la PR.
- Les PR du back vont vers la branche `back`, avant la fusion dans `main`.
- Les PR du front vont vers la branche `Front`, avant la fusion dans `main`.

### À poursuivre

- Base de test séparée et `npm test` à la racine (#18), puis les tests de la route de l'accueil (#30)
- Middleware d'erreur et délai de connexion à la base (#20) : sans eux, une panne de la base ne renvoie pas l'erreur 500 prévue par le contrat
- Aligner le type `Tree` de la page d'accueil sur le contrat avant de la brancher sur l'API.
- Valider le contrat #26 entre les deux groupes
- Faire relire les PR du back par le binôme du front quand terminé (F1 + tests).
- Faire valider carte #17 - README d'installation

## 2026-10-27 — Initialisation du front, Husky et environnement de développement

### Travail réalisé

- **Nettoyage de l'API** par Dimitry : fichiers en double supprimés (données et images regroupées dans `src/api/src/`), dossiers `controllers`, `datamappers`, `middlewares` et `services` préparés, `src/.env.docker.example` complété.
- **Initialisation du front** en session commune Live Share, guidée par Loïc (PR #54) :
  - projet Next.js dans `src/front` ;
  - Dockerfile du front et service `front` dans `docker-compose.yml` ;
  - relais `/api` du front vers l'API (`next.config.ts`) : le front appelle `fetch("/api/...")`, sans adresse en dur ;
  - Husky, lint-staged, Prettier et ESLint : à chaque commit, mise en forme, ESLint et vérification des types de l'API et du front.
- **Protection de `main`** (PR #55) : un premier test a montré qu'un push vers `main` passait encore. Ajout d'un hook `pre-push` qui le refuse ; les commits sur `main` étaient déjà refusés par le `pre-commit`.
- **Corrections de l'environnement de développement** (PR #56) :
  - port de l'API sur la machine réglable (`API_HOST_PORT`) ;
  - front lancé avec l'utilisateur `node` dans Docker : plus de fichiers au nom de `root`, qui bloquaient Husky ;
  - connexion à la base par un pool (`pg.Pool`) : l'API ne plante plus quand la base redémarre ;
  - routes `GET /api/health` et `GET /api/trees`, page d'accueil "test branchement API" qui affiche la liste des arbres ;
  - fichiers `.env.example` de l'API et du front pour travailler en local ;
  - commentaires des fichiers Docker simplifiés.
- **Guide d'installation** ([INSTALLATION.md](INSTALLATION.md), PR #57), lié depuis le README : prérequis Windows (WSL) et macOS, deux manières de lancer le projet (tout en Docker, ou l'API et le front en local avec la base dans Docker), vérifications et dépannage.
- **Initialisation du front terminée.**

### Décisions

- On ne travaille jamais sur `main` : une branche par carte, puis une Pull Request. Husky refuse les commits et les push vers `main`. Cette protection est locale : une protection côté GitHub dépend de l'école, propriétaire du dépôt.
- Le code est vérifié à chaque commit : Prettier, ESLint (0 erreur, 0 avertissement) et TypeScript.
- Deux manières de travailler, au choix : tout en Docker (par défaut) ou en local avec la base dans Docker.

### À poursuivre

- Chacun installe le projet de zéro avec le guide d'installation, sous Windows ou macOS, et remonte ses retours pour corriger/valider le guide.
- Ceux qui avaient déjà le projet : refaire une fois la mise à jour de leur machine (dépendances et anciens volumes Docker).
- Une fois l'installation validée sur chaque machine : feu vert pour commencer les cartes du sprint 1.
- NOTA : servir les images des arbres depuis l'API, penser à rajouter :`express.static`.

## 2026-10-26 — Sprint planning du sprint 1 et initialisation du back

### Déroulement prévu

- **Matin : sprint planning** animé par Fabrice : objectif du sprint, matrice de roulement, Definition of Ready et Definition of Done, règles de PR, conventions front et back, relecture des cartes du sprint 1 (#11 à #38), confirmation des groupes du sprint.
- **Après-midi : initialisation du back** en session commune Live Share sur la machine de Dimitry (cartes #11, #12 et #13).
  - Rôles : Dimitry guide et commite à la fin de chaque étape (avec `Co-authored-by` pour celui qui était au clavier), un conducteur tournant au clavier, les autres relisent. Fabrice prend les notes qui serviront au README, Shanna garde le temps (plus de 20 minutes bloqués sur une étape : on note et on avance).
  - Étapes et relais au clavier, dans l'ordre :

    | Étape                                                                                                | Au clavier |
    | ---------------------------------------------------------------------------------------------------- | ---------- |
    | 1. Branche, arborescence et fichiers de base (`.env.example`, `.gitignore`, `docker-compose.yml`)    | Dimitry    |
    | 2. Initialiser le projet Node.js de l'API en TypeScript                                              | Dimitry    |
    | 3. Express et la route `/api/health`, lancée en local                                                | Mahamadou  |
    | 4. PostgreSQL dans Docker Compose, scripts SQL et données de départ ; 5. vérifier la base (8 tables) | Fabrice    |
    | 6. L'API dans Docker                                                                                 | Loïc       |
    | 7. Première route qui lit la base `/api/` pour récupérer tous les arbres                             | Shanna     |

- **Mardi** : initialisation du front (Next.js, le front dans Docker, redirection de `/api`, Husky) guidée par Loïc, puis chacun installe le projet sur sa machine et la PR de la base commune est relue par les deux leads. Feu vert ensuite pour que chacun commence ses cartes.

### Travail réalisé

- **Sprint planning** : planning du sprint 1 présenté, démo du Kanban, objectif du sprint publié sur le Kanban, Definition of Ready et Definition of Done présentées, cartes du sprint 1 relues.
- Carte #16 : issue « Suivi du développement » ouverte dans le dépôt des formateurs (`Projects-CDA`).
- **Initialisation du back** faite en session commune, étapes 1 à 7 (PR #50 fusionnée) :
  - `src/docker-compose.yml` avec les services `db` (PostgreSQL 18, healthcheck), `adminer` et `api` ; `01-schema.sql` et `02-seed.sql` joués au premier démarrage de la base ;
  - scripts npm `db:up`, `db:reset`, `db:seed` et `db:psql` (documentés dans `src/api/README.md`) ;
  - Dockerfile de l'API, rechargement automatique du code (`tsx watch`) et volume dédié à `node_modules` ;
  - route `GET /api/health` et première route qui lit la base (`GET /api/`, liste des arbres).
- Début de la rédaction du guide d'installation par Fabrice (`INSTALLATION.md`, branche `docs/installation`).

### Décisions

- **Groupes de travail du sprint 1** validés, en pair programming (un clavier pour le groupe, on change souvent de conducteur) :
  - **trinôme du back** : Dimitry, Fabrice et Mahamadou : socle de l'API, route de l'accueil (`GET /api/trees/featured`), outil de test et tests, README, procédure de déploiement ;
  - **binôme du front** : Loïc et Shanna : pages statiques, socle du front (mise en page, styles de la charte), fonction commune d'appel à l'API, page d'accueil branchée sur l'API.
- Le **contrat d'API de l'accueil** relie les deux groupes : le trinôme sait quoi renvoyer, le binôme sait quoi afficher, et chacun avance sans attendre l'autre.
- Sur le Kanban, chaque carte garde **un seul responsable**, même quand le groupe y travaille ensemble. Les groupes changent à chaque sprint.

### À poursuivre

- Mardi matin : initialisation du front guidée par Loïc, puis installation du projet sur chaque machine.
- Relire le guide d'installation ; chacun le teste Mercredi en réinstallant le projet de zéro.
- Compléter `src/.env.docker.example` (`NODE_ENV`, `API_PORT`, `DATABASE_URL`).
- Remplacer la route de test `GET /api/` par les vraies routes (`/api/trees`…) ; supprimer les fichiers en double (`api/data/` et `api/src/data/`, images dans `api/public/public/` et `api/src/public/`) ; renommer le `WORKDIR` `/src/app.ts` en `/app`.

## 2026-10-23 — Fin du sprint 0, organisation du sprint 1 et Kanban GitHub

### Travail réalisé

- Présentation de l'organisation des sprints et pitch du sprint 1 par Fabrice. Le backlog a été présenté rapidement : il sera relu en détail au sprint planning du lundi 26 octobre.
- Derniers ajustements de la maquette.
- Finalisation des slides pour la présentation par Loïc
- **Présentation de fin du sprint 0 faite par Loïc et Shanna** : le sprint 0 (conception) est terminé.
- Charte graphique, maquette complète et wireframes ajoutés au dépôt (`docs/design/`).

### Décisions

- **Organisation** : validée par l'équipe (rien n'est figé et fermé).
- **Sessions communes du début du sprint 1** en Live Share : lundi après-midi l'API et la base (Dimitry guide), mardi matin Next.js et Husky (Loïc guide). Chacun passe au clavier à tour de rôle, celui qui guide commite et pousse.
- **Dépôt GitHub renommé** : `apo-greenroots` devient `apo-jesappellegraine`, pour correspondre au nom du projet. Le Kanban suit le renommage ; GitHub redirige encore l'ancienne adresse.

### À poursuivre

- **Sprint planning du lundi 26 octobre** : objectif du sprint, matrice des binômes, Definition of Ready et Definition of Done, conventions front et back, relecture des cartes du sprint 1.
- Accepter l'invitation au Kanban GitHub (chacun).
- Mettre à jour l'adresse du dépôt sur sa machine (chacun) : `git remote set-url origin git@github.com:O-clock-Kyoto/apo-jesappellegraine.git`, ou recloner le dépôt.
- Vérifications de chaque machine avant lundi (connexion au VPS, Git, clé SSH, Docker, Node.js) avec une checklist commune.

## 2026-10-22 — Relecture complète de la documentation et simplification du panier

### Travail réalisé

- Relecture complète du cahier des charges, des user stories, de la charte et des documents de conception pour corriger les incohérences (routes au singulier et au pluriel mélangées, langage, routes manquantes).
- Modèle de données mis à jour (textes, dictionnaire et schémas MCD, MLD, MPD) : suppression de la table `cart`, mode de paiement sans carte.
- Diagrammes PlantUML mis à jour (cas d'utilisation, séquence et activité de l'achat, architecture).
- Cahier des charges : choix de modélisation du panier documenté, nouvelles routes, précisions sur le paiement, les photos et la page d'accueil.

### Décisions

- **Table `cart` supprimée** (validé en équipe) : le panier n'a aucune information propre (réservé aux comptes connectés, un seul panier en cours par client, pas de suivi des paniers abandonnés). _Contenir_ relie directement l'utilisateur et l'arbre : `cart_item` est rattaché au compte (`account_id`, `UNIQUE (account_id, tree_id)`). Plus de panier à créer à l'inscription. Un panier enrichi (visiteur, paniers abandonnés, codes promo) est noté en évolution.
- **Paiement par carte et PayPal retirés du MVP** : sans paiement en ligne, aucun moyen de payer par carte, et PayPal arrivera avec le paiement en ligne. Modes acceptés : virement et chèque (`payment_method`). La carte bancaire et PayPal sont en évolution (Stripe).
- **Référence et instructions de paiement** : la page de confirmation et l'email donnent la référence de la commande, le montant TTC, la date limite et les instructions du mode choisi (IBAN ou adresse d'envoi du chèque). Les coordonnées sont dans la configuration de l'API.
- **Annulation par le client** : le client annule sa commande en attente (`PATCH /api/orders/:id/status`, passage à `cancelled`) au lieu de la supprimer. Aucune commande n'est jamais supprimée.
- **Email d'annulation** quand l'admin annule une commande non payée (US25c).
- **Routes** : connexion et déconnexion sur `/api/auth` (cohérent avec le JWT, sans session) ; pages de commande au pluriel (`/commandes/nouvelle`, `/commandes/nouvelle/paiement`, `/commandes/:id/confirmation`) ; ajout de `GET /api/categories`, `GET /api/admin/trees` et `GET /api/admin/trees/:id` (l'admin voit aussi les arbres retirés). Les ressources uniques de l'utilisateur connecté restent au singulier (`/panier`, `/compte`, `/api/cart`).
- **Filtre par catégorie** : la catégorie se choisit dans une liste et le site envoie son identifiant (`?category=2`) ; seul le nom de l'arbre se tape dans la recherche.
- **Après la connexion** : le client revient sur la fiche de l'arbre et clique de nouveau sur « Ajouter au panier » ; le retour automatique reste une évolution (US06).
- **TypeScript** pour le front-end et l'API.
- **Prix TTC** partout ; quantité de 1 à 100 par arbre dans le panier.
- **Accueil** : les 3 derniers arbres disponibles ajoutés au catalogue (`GET /api/trees/featured`).
- **Photos** stockées en dur dans le projet : l'admin renseigne le chemin, l'envoi de fichier est une évolution.
- **Premier compte admin** créé avec les données de départ de la base.
- **Informations modifiables par le client** (US28) : tout (prénom, nom, adresse, email, type de compte, structure) sauf le rôle ; l'activation du compte reste gérée par l'admin.
- **Durée du JWT** : 24 heures, puis le client se reconnecte.
- **Envoi des emails** : Nodemailer côté API, via le serveur SMTP d'un prestataire (choix retenu).
- **Sécurité de la connexion** : en MVP, mot de passe d'au moins 12 caractères et protection CSRF (cookie `SameSite=Lax` et requêtes JSON uniquement sur les routes qui modifient des données). La limitation des tentatives de connexion est classée en évolution.
- **Serveur web** : Nginx, placé devant le front-end et l'API sur le VPS (HTTPS avec Certbot, aiguillage des requêtes `/api`).
- **CGV** : classées en évolution (page `/cgv` et case à cocher sur la page de paiement).
- **Rôle administrateur des ventes** : classé en évolution. Il gérera les commandes et le catalogue sans accès aux comptes ni à la partie technique ; l'administrateur actuel devient le super-administrateur. La table `role` permet de l'ajouter sans changer la structure de la base (US49, US55, US56).
- **Évolutions ajoutées** : mot de passe oublié (US37), pagination des listes, envoi des photos (US48), retour automatique sur la fiche, panier enrichi.
- **Fin du sprint 0** : Préparation ensemble, Loïc et Shanna feront la présentation. Simulation faite, ajustée et validée.
- **Maquette et charte graphique** : analyse avec l'équipe, ajustement et correction. Maquette finale validée.

### À poursuivre

- **Fin du sprint 0** : Préparation de la présentation officielle..
- **Vision sur le sprint 1** : réflexions à donner aux Tech Leads pour lundi, tests des environements de chacun via une checklist

## 2026-10-21 — Nom du projet, paiement, disponibilité, hébergement et vérification du modèle de données

### Travail réalisé

- Projet renommé partout dans le dépôt : GreenRoots devient **Je s’appelle Graine** (fichiers `*-JE-S-APPELLE-GRAINE.md`).
- Modèle de données mis à jour (texte et schémas MCD, MLD, MPD) : lieu de plantation, compte actif, table de disponibilité, mode de paiement.
- Cahier des charges et user stories : quantité choisie sur la fiche arbre, page de paiement, emails automatiques, suivi des commandes par l'admin, hébergement sur VPS, nouvelles routes.
- Recherche d'arbres par nom (MVP, accents gérés avec l'extension PostgreSQL `unaccent`) ; filtres par lieu et par prix, et tri, en évolution.
- Endpoints de l'API renommés en anglais, comme le demande la charte de nommage (`/api/trees`, `/api/orders`, `/api/cart/items`…).
- Diagrammes d'architecture, de cas d'utilisation, de séquence et d'activité refaits avec PlantUML : les sources `.puml` sont rangées à côté des images pour pouvoir les modifier.
- Numérotation des user stories alignée entre le cahier des charges et `user-stories.md`.
- Wireframes (mobile first + desktop) :  
  Shanna page **Accueil**, Dimitry page **Fiche arbre**, Mahamadou **Panier**, Fabrice **Connexion/Inscription**, Loïc page **Catalogue**

### Décisions

- **Nom du projet** : « Je s’appelle Graine » (décidé avec le groupe). Le dépôt GitHub `apo-greenroots` garde son nom.
- **Lieu de plantation** : simple champ texte facultatif dans `tree` pour le MVP. Il pourra devenir une entité **Lieu** si la carte interactive (US33, évolution) a besoin de coordonnées.
- **Compte actif** (`account.is_active`, `TRUE` dès l'inscription) : géré par l'admin (`PATCH /api/admin/users/:id`, « Modifier l'état d'un compte client »). Un compte désactivé reçoit un **403** à la connexion : il est bien identifié, mais n'a pas le droit d'accéder au service.
- **Quantité** : le client choisit la quantité sur la fiche arbre avant d'ajouter au panier (US23b).
- **Disponibilité** : nouvelle table `availability` (disponible, épuisé, retiré du catalogue) qui remplace `tree.is_available`.
- **Historique des commandes** : `purchase_line` fige le **nom de l'arbre**, la quantité, le prix payé et le **lieu de plantation** (`tree_name` et `planting_location`, copiés à la création de la commande) : si l'admin modifie un arbre, l'historique ne change pas. Un arbre déjà commandé n'est jamais supprimé (`purchase_line.tree_id` NOT NULL), il passe à « retiré du catalogue ».
- **Acheteur figé dans la commande** : `purchase` copie à sa création le prénom, le nom, l'email, la structure et l'adresse du compte (`buyer_*`). Si le compte est supprimé, la vente reste identifiable (comptabilité, facturation des associations et entreprises, pièces conservées 10 ans) et les emails de la commande peuvent encore être envoyés.
- **Dates de statut** : `paid_at`, `planted_at` et `cancelled_at` sont renseignées par l'API au changement de statut.
- **Suppression d'une commande** : ~~le client ne peut supprimer une commande que si elle est `pending` (`DELETE /api/orders/:id`)~~. Révisé le 2026-10-22 : le client annule sa commande au lieu de la supprimer. Une commande `paid`, `planted` ou `cancelled` n'est jamais effacée : les annulations restent tracées.
- **Suivi du statut par le client** (US27) : passe en MVP ; le client voit le statut de ses commandes dans son historique, l'admin le fait évoluer (US46).
- **Paiement** : page de paiement avec choix du mode (virement, ~~carte,~~ chèque, ~~PayPal~~ ; carte et PayPal retirés le 2026-10-22) et case obligatoire « Je m'engage à effectuer mon paiement sous 10 jours ou ma commande sera annulée ». Rien n'est encaissé en ligne (nouveau statut `cancelled`).
- **Emails automatiques** : confirmation à la création de la commande ; avis de réception quand l'admin passe la commande à `paid`. Le suivi des commandes par l'admin (US46) passe en MVP.
- **Hébergement** : tout sur un **VPS fourni par O'Clock** (front, API, PostgreSQL en conteneurs Docker), sur un seul nom de domaine.
- **Authentification par JWT** : jeton signé (id du compte et rôle) dans un cookie `httpOnly`, aucune session stockée côté serveur. Un jeton ne peut pas être révoqué avant son expiration : en V1, `is_active` est contrôlé à la connexion ; la révocation (relecture du compte à chaque requête ou `token_version`) est prévue en V2.
- **Rôles** : les droits sont contrôlés par un middleware de rôles dans l'API. Les règles que la base ne peut pas garantir sont gérées par l'API : vérification du propriétaire d'une ressource, transitions de statut autorisées, refus de supprimer ou désactiver le dernier admin.
- **Recherche par nom** : `unaccent(name) ILIKE unaccent('%' || $1 || '%')`, sans nouvelle colonne.
- **Arbre jamais commandé** : supprimé directement ; il disparaît des paniers qui le contiennent (`cart_item.tree_id` en `ON DELETE CASCADE`).
- **DataMapper** : choix validé
- Échange de vision pour valider les wireframes (contenu, mise en forme, etc.)

### À poursuivre

- Fixer la durée d'expiration du JWT.
- Maquette et charte graphique en cours et à valider
- Fin du sprint 0 : nommer une personne et préparer la présentation ensemble

## 2026-10-20 — Conception de la base de données

### Travail réalisé

- MCD, MLD, MPD et dictionnaire de données.
- Répartition des rôles
- Diagramme de séquence pour l'achat et Use Cases
- Diagramme d'architecture et diagramme d'activité pour l'achat

### Décisions

- **Exception à la charte de nommage** : `user` et `order` sont des mots réservés en PostgreSQL. Les tables sont renommées `account`, `purchase` et `purchase_line`.
- **Suppression d'un compte** : le compte est supprimé, ses commandes sont conservées (`account_id` passe à `NULL`). Cardinalité _Passer_ : 0,1 côté Commande.
- **Statut d'une commande** : `pending` (en attente), `paid` (payée), `planted` (plantée), changé manuellement par l'admin. Le client peut supprimer une commande `pending`.
- **Panier réservé aux comptes connectés** : un visiteur qui clique sur « Ajouter au panier » est redirigé vers connexion. L'entité Panier est conservée, mais _Posséder_ passe à **1,1** côté Panier : `cart.account_id` devient `NOT NULL`. L'API répond **401** sans session (403 si le client touche au panier d'un autre).
- **Création du panier** : le panier est créé à l'inscription du client (vide). _Posséder_ reste 0,1 côté Utilisateur, car un admin n'a pas forcément de panier.
- **Rôles répartis** : Shanna **Product Owner**, Fabrice **Scrum Master**, Loïc **Tech Lead Front** et Dimitry **Tech Lead Back**

### À poursuivre

- Wireframes (mobile first + desktop) :  
  Shanna page **Accueil**, Dimitry page **Fiche arbre**, Mahamadou **Panier**, Fabrice **Connexion/Inscription**, Loïc page **Catalogue**
- Maquettes : Shanna
- Charte graphique : Shanna
- Valider le choix du DataMapper et prendre en compte l'analyse de Loïc pour la conception

## 2026-10-19 — Sprint 0

### Travail réalisé

- Le cahier des charges de Je s’appelle Graine a été établi (à valider).
- Les rôles de l’équipe restent à définir et à répartir.

### À poursuivre

- Répartir les rôles et valider le cahier des charges.
- Proposition de la charte de nommage
- Réaliser les documents de conception : diagramme ERD (ex: MCD, MLD, MPD), Use Cases, diagramme de séquence et dictionnaire de données.
