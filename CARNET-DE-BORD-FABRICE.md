# Carnet de bord — Fabrice (Scrum Master)

Suivi de mon travail sur Je s’appelle Graine. Les décisions notées ici ont été prises avec l'équipe ; le suivi de l'équipe est dans le [carnet de bord Je s’appelle Graine](CARNET-DE-BORD-JE-S-APPELLE-GRAINE.md), que je tiens à jour.

## 2026-11-06 — F6 : compte du client, relecture de F5 et test du site en ligne

### Travail réalisé

- **F6, partie compte** (#160), sur `feat/f6-compte-back` :
  - `PATCH /api/users/me` : modification du compte, email déjà pris par un autre compte → 409, `RETURNING` pour renvoyer le compte à jour;
  - `PATCH /api/users/me/password` : vérification du mot de passe actuel avec `argon2.verify`, puis enregistrement du nouveau hash, réponse 204 ;
  - `DELETE /api/users/me` : blocage du dernier admin actif (403), cookie effacé ;
  - `clearAccessCookie` dans `lib/token.ts`, utilisée aussi par `logout` ;
  - `.trim()` sur le prénom, le nom et la structure, et `.max()` selon la taille des colonnes, à l'inscription et à la modification ;
  - essais des routes à la main sur l'API locale.
  - Tests de la partie compte (#162), dont le dernier admin et la conservation des commandes après suppression.
- **Relecture de F5 par rapport au cahier des charges :** conforme sur le parcours de commande. Corrections notées dans le challenge de Dimitry, dont un `n°` en trop dans l'email pour un chèque.
- **Test du site en ligne :** pages, catalogue, recherche, accès protégés et formulaires invalides. Photos des arbres cassées : cause trouvée et confirmée par une compilation de production, corrigée par Dimitry (PR #197).
- **Organisation :** challenge et Kanban mis à jour, documents de l'équipe du sprint 3.

### Ce que j'ai appris

- `RETURNING` renvoie la ligne modifiée dans la même requête. Il n'accepte pas de `JOIN` : une sous-requête permet de lire le nom du rôle.
- `COUNT(*)` arrive en texte dans Node, d'où le `CAST(... AS INTEGER)`.
- `??` ne remplace que `null` et `undefined`, alors que `||` remplace aussi une chaîne vide.
- Les relais de `next.config.ts` sont figés à la compilation : `env_file` ne sert qu'au lancement du conteneur.

### Décisions (prises avec l'équipe)

- `deleteById` et `countActiveAdmins` sont écrites dans F6 (Fabrice) et réutilisées par F9(Mahamadou).
- L'email de confirmation ne vaut pas facture ; une facture en PDF pourrait être une évolution du projet.

### À poursuivre

- Ouvrir ensuite la PR de `feat/f6-compte-back` vers `DEV`, relue par Shanna.
- F6, commandes du client (#198, #199) : `GET /api/orders` et l'annulation d'une commande en attente, avec leurs tests, puis pages compte et commandes (#161, #200).
- Relire F9, et aider Loïc et Shanna sur le back.

## 2026-11-05 — Fin de F2, outils communs et organisation du sprint 3

### Travail réalisé

- **Catalogue** (#92), PR #185 vers `front-F2` :
  - fusion de `main` dans `front-F2` et résolution du conflit de `test/index.ts` ;
  - reprise de `feat/front-catalogue` de Mahamadou, conflits de `Header.tsx` et `AddToCartButton.tsx` résolus ;
  - catégories lues depuis `GET /api/categories`, avec « Tous nos arbres » ajouté côté front ;
  - `TreeCard` : arbres en rupture de stock sans bouton panier, prix formaté, lieu affiché seulement s'il existe ;
  - page : `metadata`, `<li>` dans la liste, `h2` masqué, message d'erreur simple pour le visiteur.
- **`formatEuros` et `formatDate`** (PR #184), pour écrire les prix et les dates de la même façon partout.
- **Préparation de la fusion de F2** (PR #187) : `api()` simplifiée pour les lectures des pages serveur, `clientApi()` pour les composants clients, retrait de `jwt` et `Bearer`, `--color-green` à la place de `--color-primary-green`, test et plan de tests alignés sur « Ce compte existe déjà. ».
- **Organisation en mode challenge du sprint 3 :** objectifs par personne (routes, données, dépendances entre nous, conflits à éviter), relectures réparties, routine de branches à partir de `DEV`.
- **Kanban :** cartes de F6, F8, F9 et du sprint 3 créées (#159 à #182).
- **Relecture en équipe de la PR #191** de Dimitry, et ajustements à faire notés dans son challenge.
- **Vérification de `main` et de `DEV`** : tests de l'API, build du front et parcours dans le navigateur.

### Ce que j'ai appris

- Une page serveur et un composant client n'appellent pas l'API de la même façon : la page serveur s'exécute hors du navigateur, avec `API_URL` et sans le cookie ; le composant client passe par `/api` et le navigateur envoie le cookie.
- Une même date peut tomber sur deux jours différents selon le fuseau horaire, d'où `timeZone: "Europe/Paris"` dans `formatDate`.
- `git fetch --prune` retire les copies des branches supprimées sur GitHub, sans toucher aux branches locales.

### Décisions (prises avec l'équipe)

- Une feature entière par personne au sprint 3 ; pour moi, F6 Espace client. Relectures à égalité : je relis F9.
- Branche commune `DEV`, noms de branches au format `type/fN-partie`.
- Adresse du client demandée à la commande, et présente dans l'email de confirmation.
- Arbres indisponibles affichés « en rupture de stock ».

### À poursuivre

- F6, partie compte : `PATCH /api/users/me`, mot de passe et suppression du compte, sur `feat/f6-compte-back`.
- F6, partie commandes, après les ajustements de Dimitry.
- Relire F9, et aider Shanna sur le back de F7.

## 2026-11-04 — F3 dans `main`, relecture de F2 et priorités de fin de sprint

### Travail réalisé

- **Fin du back de F3** (#85, #88) : PR #136 et #144 fusionnées dans `back-F3`.
  - `GET /api/users/me` complété avec l'adresse et le type de compte ;
  - CORS limité au front avec `ALLOWED_ORIGINS`, port de l'API par défaut à 4050 ;
  - un particulier enregistré sans structure ;
  - typage : `IAccountBase`, `INewAccount`, `IAuthenticatedRequest`, `Role`, `IAccessToken` partagé.
- **Fin du front de F3** avec le trinôme : `next` vérifié avec `new URL` (une tabulation dans l'adresse permettait de quitter le site), structure facultative, focus sur le champ à corriger après une erreur.
- **Fusion de la F3 dans `main`** : PR #153.
- **Priorités proposées à l'équipe** : terminer F1, F2 et F3 avant d'ouvrir de nouvelles features.
- **Relecture de `back-F2`** pour aider Mahamadou : route `GET /api/categories` manquante, id trop grand qui répond 500, tests du filtre par catégorie à ajouter.

### Ce que j'ai appris

- Résoudre un conflit : lire les deux côtés, garder ce qui doit l'être, corriger à la main, puis tester avant de valider. « Accepter les deux » peut laisser une accolade manquante.
- `git merge --abort` permet d'essayer une fusion en local, pour voir les conflits sans rien envoyer.
- Le navigateur retire les tabulations et les retours à la ligne d'une adresse : contrôler le début d'une chaîne ne suffit pas, `new URL` donne la vraie destination.
- Le type `FormEvent` de React est déprécié : pour un formulaire, c'est `SubmitEvent` (dû à la version de React).

### Décisions (prises avec l'équipe)

- La redirection du visiteur depuis « Ajouter au panier » (US05, US05b) est traitée avec la F4.
- Après l'inscription, le visiteur passe par la page de connexion, puis revient à sa page d'origine.

### À poursuivre

- Accompagner Mahamadou et Loïc sur la fin de F2.
- Organisation de la suite du sprint à définir avec l'équipe.

## 2026-11-03 — Fin du back de F3 : `/users/me`, droits admin et tests

### Travail réalisé

- **Branche `feat/tests-auth`** (#85, #88), PR #136 vers `back-F3` :
  - fusion de `back-F3` et `front-F3` pour travailler sur le code à jour ;
  - `GET /api/users/me` (`isConnected`) : les champs de la connexion, plus `address`, `accountType` et `organizationName` (récapitulatif de F5, espace client F6) ;
  - `getAuthenticatedUser` dans `controllers/utils.ts`, comme dans le cours : retrouve le compte connecté (401 s'il n'existe plus) ; prépare F4 (panier du client), F5 (acheteur copié dans la commande) et F6 (espace client) ;
  - `/api/admin` protégé par `isConnected` et `checkRoles(["admin"])`, `adminRouter` prêt pour F7, F8, F9 ;
  - `checkRoles` : pas de rôle → 401, rôle non autorisé → 403 ; messages conformes au contrat ;
  - un seul traitement du JSON mal formé dans `errorMiddleware` après la fusion ;
  - tests d'intégration : connexion, déconnexion (401 sans être connecté), inscription (201, 400, 409, 415, mot de passe haché), `/users/me`, droits sur `/api/admin` ; helper `loginAs` dans `test/index.ts` ;
  - premiers tests unitaires du projet : `checkRoles` ;
  - plan de tests : section F3 et nouveau type « Unitaire ».
- **Relecture du code de l'équipe** (front et back) : remarques par fichier, partagées en tenant compte du travail en cours.
- **Kanban** : #84 terminé (PR #141), #85 et #88 en revue (PR #136).

### À poursuivre

- Faire relire la PR #136 et la fusionner après vérification, puis #85 et #88 dans « Terminé ».
- F5 front (#107) : récapitulatif (adresse de l'acheteur lue avec `/users/me`), paiement, confirmation.

## 2026-11-02 — Préparation du sprint 2 et connexion `POST /api/auth`

### Travail réalisé

- **Préparation du sprint 2** :
  - cartes du sprint 2 (#81 à #114, puis #121 à #123), classées par priorité ; format « Groupe / Responsable » ;
  - organisation par feature : trinôme (Fabrice, Dimitry, Shanna) sur F3 et F5, binôme (Loïc, Mahamadou) sur F2 et F4 ;
  - contrats d'API dans les cartes #83 (F3), #89 (F2), #99 (F4), #103 (F5) ;
  - feuilles de route des 5 membres et vues du Kanban (« Sprint en cours », « Backlog », « Par personne ») mises à jour.
- **Connexion `POST /api/auth`** (#85) avec Shanna (PR #132 vers `Back`) :
  - Shanna : `authRouter` et `accountDatamapper.findByEmail` (jointure sur `role`) ;
  - Fabrice : `login` (Zod, argon2, compte actif), jeton JWT de 24 h dans le cookie `accessToken` (`lib/token.ts`), erreurs Zod → 400 dans `errorMiddleware` ;
  - `JWT_SECRET` dans `config.ts` : obligatoire en production, clé de secours en dev et en test ; ligne ajoutée dans DEPLOIEMENT.md ;
  - réponses testées avec Rest Client : 400, 401 (même message que l'email existe ou non), 403, 200 avec le cookie.
- **Seed** : nouveaux comptes (`prenom@graine.fr`, `alice` à `eve@test.fr`), mots de passe de 12 caractères hachés en Argon2 ; `bdd-arbres.json` supprimé (inutilisé, mots de passe en clair).

### Ce que j'ai appris

- `||` et non `??` pour `JWT_SECRET` : une ligne vide `JWT_SECRET=` donne `""`, pas `undefined`.
- `res.cookie` et `res.clearCookie` sont dans Express ; `cookie-parser` ne sert qu'à lire `req.cookies`.
- Le volume nommé `node_modules` de Docker n'est pas mis à jour par `--build` : après une nouvelle dépendance, il faut le supprimer (`docker volume rm src_api-node-modules`).

### Décisions (prises avec l'équipe)

- JWT : un jeton de 24 h (cahier des charges).

### À poursuivre

- `DELETE /api/auth`, `GET /api/users/me`, middlewares `isConnected` et `isAdmin` : Dimitry les utilise déjà dans le front (#86).
- Tests de la connexion (#88).
- Avec Dimitry : `JWT_SECRET` dans le `.env` du VPS, et mots de passe admin de la base de production.
- Fusionner `Back` dans `main`.

## 2026-10-30 — Photos des arbres, revue du front et présentation du sprint 1

### Travail réalisé

- **Photos des arbres** (PR #72) :
  - `express.static` dans `app.ts`, avec le chemin calculé depuis le fichier (`import.meta.url`) ;
  - copie des photos dans l'image de production (`dist/src/public`) ;
  - règle Nginx `/images/trees/` vers l'API, et relais Next.js pour le dev ;
  - pile de production testée en local avant la fusion.
- **Relecture du front dans `main`** et message à Shanna et Loïc : dossier `app/trees` à renommer `app/arbres`, page du catalogue à aligner sur le contrat #22, icône du panier, interface `ITree`, `lang="fr"`.
- **PR #69** : le front en cours de Shanna est arrivé dans `main` avec son carnet (travail non commité qui a suivi le `git switch`). Code gardé dans `main` ; rappel du `git status` et du commit `wip:` avant de changer de branche.
- **Présentation du sprint 1** (#38) avec Mahamadou : Le projet, l'organisation, l'initialisation, puis F1 : Mahamadou présente le back de l'accueil, la démo montre l'accueil en ligne.

### Ce que j'ai appris

- Avec Next.js (App Router), le nom d'un dossier de `app/` devient l'adresse de la page : `app/trees` donne `/trees`.
- L'image Nginx ne remplace les variables du `.template` qu'au démarrage du conteneur : après un changement de config, il faut `restart nginx`, pas `nginx -s reload`.
- Un chemin calculé depuis le fichier (`import.meta.url`) ne dépend pas du dossier de lancement, mais après compilation le fichier est dans `dist/src/`.

### Décisions (prises avec l'équipe)

- L'API ne sert que `/images/trees/` ; les autres images restent dans le `public/` du front.
- La présentation ne montre que l'accueil.

### À poursuivre

- Relire la PR des tests de Dimitry (`feat/test-setup` vers `back`).
- Sprint planning du sprint 2 lundi.

## 2026-10-29 — Fiche d'un arbre, gestion des erreurs et tests de l'API

### Travail réalisé

- **Fiche d'un arbre** `GET /api/trees/:id` (bonus #22) : routeur, contrôleur et `findById` dans le DataMapper ; un arbre inexistant ou retiré → 404.
- **Types de l'API** : `ICatalogueTree` pour le catalogue, `availabilityName` limité aux 3 valeurs de la table `availability`.
- **Mise en place de la gestion des erreurs** avec Mahamadou (`feat/error-handling`) : middlewares errorMiddleware et commonMiddleware.
- **Contrats #22 et #26** : messages d'erreur en français et champ `status`. **Carte #20** limitée aux erreurs du sprint 1.
- **Fusion de `back` dans `main`** (PR #68).
- **Tests de l'API** (#18) : branche `feat/test-setup` poussée, avec la config reprise du cours (base de test dans un conteneur, `--env-file`, `global-setup.ts`, `requester` axios, `createTree`) et un premier test d'intégration de `GET /api/trees/featured`. Dimitry prend la suite.
- **Relecture du déploiement de Dimitry** (PR #66) : pile de production construite et testée en local ; points remontés (guide à mettre à jour).

### Ce que j'ai appris

- Nginx choisit la `location` la plus précise ; un seul domaine évite le CORS et garde le cookie du JWT sur un seul site.
- Un Dockerfile _multi-stage_ sépare la construction (avec les outils de dev) de l'image finale, plus légère.
- Les fichiers non commités n'appartiennent à aucune branche : ils suivent le `git switch`.
- Un test unitaire vise une fonction pure (comme `isValidPassword` dans oQuiz) ; tester un contrôleur seul demande des _mocks_.
- `console.error` écrit dans la sortie d'erreur, ce qui distingue les erreurs dans les logs Docker.

### Décisions (prises avec l'équipe)

- Messages d'erreur de l'API en français.
- Chaque feature ajoute ses propres erreurs ; le sprint 1 ne traite que les siennes..

### À poursuivre

- Préparer la présentation du sprint 1.
- Suivre les tests de Dimitry sur `feat/test-setup`, puis la PR vers `back`.
- Photos des arbres : `express.static` dans l'API, puis Nginx et `Dockerfile.prod`.

## 2026-10-28 — Route de l'accueil, contrat d'API et préparation des tests

### Travail réalisé

- **Contrôleur des arbres** (`treeController.ts`) : `getAllTrees` et `getFeaturedTrees`, branchés sur le routeur et le DataMapper du trinôme (PR #61 et #63, fusionnées dans `back`).
- **Revue et corrections de la route `GET /api/trees/featured`**, testée avec REST Client (`src/api/test/test.tree.http`) :
  - requête `findFeatured` réécrite d'après le schéma : arbres disponibles seulement, le plus récent en premier, 3 au plus ;
  - prix converti en nombre (`CAST(price AS FLOAT)`) ;
  - catégorie jointe, renvoyée en objet `{ id, name }` ;
  - lieu de plantation ajouté, après vérification de la maquette v7 (il est sur la vignette).
- **Réponses de l'API en camelCase** (`photoUrl`, `plantingLocation`…), types `ITree` et `IFeaturedTree` alignés, règle ajoutée à la charte de nommage (PR #63).
- **Contrat d'API #26 mis à jour** : tableau des champs, exemple de réponse, message d'erreur 500.
- `.vscode/` ignoré et retiré du dépôt.
- **Guide d'installation** : `mkdir -p src/front/.next` ajouté à l'installation, et dépannage du commit refusé quand ce dossier est au nom de `root`.
- **Kanban mis à jour** d'après les commits et le code.

### Ce que j'ai appris

- Un fichier `.d.ts` n'est pas vérifié quand `skipLibCheck` est activé, et il s'importe avec `import type`.
- `pg` renvoie une colonne `NUMERIC` en texte (`"9.90"`) : il faut la convertir dans le `SELECT`.
- Un alias en camelCase doit être entre guillemets (`AS "photoUrl"`), sinon PostgreSQL le passe en minuscules.
- Le préfixe donné à `app.use("/api", router)` s'ajoute aux chemins du routeur : il ne faut pas le répéter.
- Après un changement de branche, `tsx watch` peut continuer à servir l'ancien code : il faut redémarrer le conteneur de l'API.
- Docker crée en `root` le dossier `src/front/.next` sur la machine pour y monter le volume du cache ; Husky ne peut plus y écrire.
- Sans délai de connexion, `pg.Pool` attend sans fin quand la base est arrêtée : l'API ne renvoie jamais d'erreur 500.

### Décisions (prises avec l'équipe)

- Les types de l'API restent dans `src/api/src/@types/index.d.ts`, avec le préfixe `I` (`ITree`, `IFeaturedTree`). La règle est ajoutée à la charte de nommage.
- Les tests sont écrits par le groupe qui code la feature ; l'autre groupe relit la PR.
- Les PR du back vont vers la branche `back` (idem pour le front).

### À poursuivre

- #18 : `node:test`, base de test séparée, `npm test` à la racine, premier test d'exemple, explication dans le README.
- #20 : middleware d'erreur (JSON sans détail technique) et délai de connexion du `pg.Pool`, pour respecter l'erreur 500 du contrat.
- #30 : tests d'intégration de `GET /api/trees/featured`, un par règle du contrat.
- Faire valider le contrat #26 par le binôme du front ; le type `Tree` de la page d'accueil (`welcomePage`) doit s'aligner sur le contrat.
- Faire relire les PR du back par l'autre groupe avant la fusion de `back` dans `main`.

## 2026-10-27 — Initialisation du front, Husky et environnement de développement

### Travail réalisé

- **Initialisation du front** en session commune Live Share, guidée par Loïc : Next.js, le front dans Docker, relais `/api` vers l'API, Husky avec Prettier, ESLint et la vérification des types (PR #54).
- **Vérification de l'environnement Docker et de Husky** sur le dépôt, puis tests sur une copie isolée. Problèmes trouvés :
  - un push vers `main` passait : Husky ne bloquait que les commits ;
  - `next.config.ts` contenait une erreur de syntaxe (`export default const`), et le relais `/api` ne fonctionnait pas ;
  - le conteneur du front tournait en `root` : les fichiers créés sur nos machines étaient au nom de `root`, et Husky échouait ;
  - l'API plantait quand la base redémarrait (`pg.Client` unique) ;
  - le port de l'API sur la machine n'utilisait pas `API_HOST_PORT`.
- **Corrections** commitées et fusionnées :
  - PR #55 : hook `pre-push` qui refuse les push vers `main` ;
  - PR #56 : utilisateur `node` dans le Dockerfile du front, `pg.Pool`, `next.config.ts` corrigé, port de l'API, `.env.example` de l'API et du front pour travailler en local, commentaires des fichiers Docker simplifiés.
- **Guide d'installation terminé** ([INSTALLATION.md](INSTALLATION.md), PR #57) :
  - installation commune pour Windows (WSL) et macOS ;
  - chapitre 1 : tout en Docker ; chapitre 2 : l'API et le front en local, la base dans Docker ;
  - les deux manières testées, y compris l'affichage de la liste des arbres dans un navigateur.
- **Guide de développement** préparé : démarrer et arrêter, Git et Husky, ajouter une dépendance, quoi faire après un `git pull`, scripts de la base. À proposer à l'équipe.

### Ce que j'ai appris

- Husky ne protège qu'en local, et seulement après un `npm install` à la racine. Il faut un hook `pre-push` pour bloquer les push vers `main`, et seule une règle de branche sur GitHub protège vraiment.
- Un conteneur qui tourne en `root` crée des fichiers au nom de `root` sur la machine, à travers le bind mount. L'utilisateur `node` de l'image (uid 1000, le même que sous WSL) règle le problème ; `COPY` écrit toujours en `root`, d'où `--chown=node:node`.
- `CMD` est la commande par défaut du conteneur ; `command:` dans le compose la remplace.
- Un `pg.Client` unique fait planter l'API si la base redémarre ; un `pg.Pool` se reconnecte.
- Dans le navigateur, `process.env` ne contient que les variables `NEXT_PUBLIC_` : le front appelle donc `/api/...`, et c'est Next.js qui relaie vers l'API.

### Décisions (prises avec l'équipe)

- On ne travaille jamais sur `main` : une branche par carte, puis une Pull Request.
- Deux manières de travailler, au choix : tout en Docker choisie par défaut (ou en local avec la base dans Docker si réel besoin).

### À poursuivre

- Mercredi : chacun installe le projet de zéro avec le guide ; corriger le guide avec les retours, en particulier sous macOS (non testé sur un vrai Mac).
- Accompagner la mise à jour des machines de ceux qui avaient déjà le projet.
- Proposer le guide de développement à l'équipe.
- Donner le feu vert pour les cartes du sprint 1 une fois toutes les installations validées.

## 2026-10-26 — Sprint planning du sprint 1, initialisation de l'API et guide d'installation

### Travail réalisé

- **Sprint planning du sprint 1** :
  - présentation du planning du sprint 1 et démo du Kanban GitHub à l'équipe ;
  - objectif du sprint publié sur le Kanban (« Add status update ») ;
  - Definition of Ready et Definition of Done présentées ;
  - relecture des cartes du sprint 1 (#11 à #38) avec l'équipe.
- **Groupes de travail du sprint 1** présentés et validés, en pair programming :
  - **trinôme du back** : Dimitry, Mahamadou et moi (socle de l'API, route de l'accueil, outil de test et tests, README, procédure de déploiement) ;
  - **binôme du front** : Loïc et Shanna (pages statiques, socle du front, fonction commune d'appel à l'API, page d'accueil branchée sur l'API) ;
  - sur le Kanban, chaque carte garde un seul responsable, même quand le groupe y travaille ensemble.
- Carte #16 faite : issue « Suivi du développement » ouverte dans le dépôt des formateurs (`Projects-CDA`).
- **Initialisation de l'API** en session commune Live Share (Dimitry guide, chacun au clavier à tour de rôle) :
  - `docker-compose.yml` avec les services `db` (PostgreSQL 18), `adminer` et `api` ;
  - scripts SQL joués au premier démarrage de la base, scripts npm `db:up`, `db:reset`, `db:seed` et `db:psql` ;
  - Dockerfile de l'API et rechargement automatique du code (`tsx watch`) ;
  - route `GET /api/health` et première requête vers la base (`GET /api/`, liste des arbres).
- **Début de la rédaction du guide d'installation** ([INSTALLATION.md](INSTALLATION.md), branche `docs/installation`), lié depuis le README :
  - chapitre 1 : installation avec Docker en 6 étapes (outils selon Linux, Windows avec WSL2 ou macOS, clonage, `.env.docker`, lancement, vérification, `npm install` pour VS Code), commandes du quotidien et dépannage ;
  - chapitre 2 (optionnel) : lancer l'API sur sa machine, la BDD restant dans Docker.

### Ce que j'ai appris

- En mode Docker, `npm install` n'est pas nécessaire pour faire tourner l'API : les dépendances sont installées dans l'image. Le `node_modules` du conteneur est dans un volume Docker, donc absent de la machine : sans `npm install` local, VS Code souligne les imports en rouge alors que l'API fonctionne.
- L'adresse de la base change selon l'endroit où tourne l'API : `db:5432` depuis un conteneur, `localhost:5433` depuis sa machine.
- Les scripts `db:*` demandent Docker Compose v2.1 minimum (`docker compose` sans tiret, option `--wait`).
- Sous macOS, Docker a besoin d'une machine virtuelle Linux, fournie par Docker Desktop. Sous Windows, WSL2 est recommandé (les scripts `db:*` utilisent une syntaxe Linux) ; Docker Desktop y est facultatif.

### À poursuivre

- Pursuivre l'écriture du guide d'installation.
- Mercredi : chacun teste le guide en réinstallant le projet de zéro ; corriger le guide avec les retours.
- Compléter `src/.env.docker.example` : il manque `NODE_ENV`, `API_PORT` et `DATABASE_URL`, utilisées par `docker-compose.yml`.
- Signaler à Dimitry les fichiers en double (`api/data/` et `api/src/data/`, images dans `api/public/public/` et `api/src/public/`) et le fichier `.env.example` à la racine, qui reprend celui de `src/api/`.

## 2026-10-23 — Kanban GitHub et cartes du sprint 1

### Travail réalisé

- test husky
- Kanban GitHub en place : colonnes (Backlog, À faire, En cours, En revue, Terminé), champs Sprint (sprints 1 à 3) et Feature, vues « Sprint en cours », « Backlog » (regroupée par feature) et « Par personne » (regroupée par responsable), issues #1 à #10 ajoutées avec leur sprint et leur feature. Le backlog reste dans l'ordre des numéros des features.
- Cartes du sprint 1 créées à l'avance (#11 à #38), toutes sur le même plan (story, à faire, fini quand, relecteur) : un responsable, des étiquettes, le sprint 1, la feature ou le bloc (base commune, outillage, socle API, mise en page, F1, déploiement, présentation), statut « À faire ». Les cartes de F1 (#26 à #30) sont des sous-issues de #1.
- Règles automatiques du Kanban testées avec une issue d'essai : une nouvelle issue arrive dans « Backlog », une issue fermée passe dans « Terminé », une carte glissée dans « Terminé » ferme son issue. Les règles liées aux PR seront vérifiées mardi avec la PR de la base commune.
- Documents préparés pour l'équipe : le déroulé des deux jours d'initialisation (lundi le back, mardi le front, puis le feu vert pour que chacun commence ses cartes), la démo du Kanban, un guide Git (journée type, une carte de la branche à la fusion, conflits, erreurs courantes), et les sujets transverses avec des exemples dans la fiche d'équipe et dans la feuille de route de chacun.
- Dépôt renommé en `apo-jesappellegraine` sur GitHub et dans mon dossier local ; adresse du dépôt mise à jour (`git remote set-url`) et ancien nom remplacé dans nos documents.
- Sessions communes de lundi et mardi organisées avec Live Share : chacun passe au clavier à tour de rôle.
- Pas de modèles d'issue ni de PR dans notre dépôt : ceux du centre sont gérés dans le dépôt des formateurs (`Projects-CDA`). Ma carte #16 devient l'ouverture de l'issue « Suivi du développement » dans ce dépôt, lundi.
- Présentation de l'organisation des sprints et pitch du sprint 1 par Fabrice. Le backlog a été présenté rapidement : il sera relu en détail au sprint planning du lundi 26 octobre.

### Décisions

- **Organisation** : validée par l'équipe (rien n'est figé et fermé).
- **Sessions communes du début du sprint 1** en Live Share : lundi après-midi l'API et la base (Dimitry guide), mardi matin Next.js et Husky (Loïc guide). Chacun passe au clavier à tour de rôle, celui qui guide commite et pousse.
- **Dépôt GitHub renommé** : `apo-greenroots` devient `apo-jesappellegraine`, pour correspondre au nom du projet.

### Ce que j'ai appris

- GitHub Projects : les réglages d'une vue passent par le bouton « View », et « Save » enregistre la vue pour toute l'équipe. Une itération n'a pas de description : l'objectif du sprint se publie avec « Add status update ».
- Les modèles d'issue sont gérés par les formateurs : les issues de suivi s'ouvrent dans leur dépôt, pas dans le nôtre.

### À poursuivre

- Lundi : démo du Kanban, publier l'objectif du sprint, relire les cartes avec l'équipe ; carte #16.
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
