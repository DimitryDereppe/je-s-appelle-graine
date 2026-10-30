# Carnet de bord — Dimitry (Tech Lead Back)

Suivi de mon travail sur Je s’appelle Graine. Les décisions notées ici ont été prises avec l'équipe sur Discord ; le suivi de l'équipe est dans le [[Apothéose/apo-jesappellegraine/CARNET-DE-BORD-JE-S-APPELLE-GRAINE|carnet de bord Je s’appelle Graine]].

## 2026-10-30 — Tests d'intégration de l'API

Branche `feat/test-setup`.

**✅ Les 15 tests d'intégration passent** (`npm run test:spec`, environ 5 s).

### Travail réalisé

- **Motif des tests entre guillemets** dans `src/api/package.json` (commit `a8a64d4`) : `"./**/*.spec.test.ts"`. Node lit lui-même les `**`, sans que le shell interprète le motif avant lui.
- **Tests de `GET /api/trees/featured`** (commit `3f3a776`, puis compléments) :
  - 3 arbres maximum ;
  - seulement les arbres `available` (ni `out_of_stock`, ni `withdrawn`) ;
  - tri par `id` décroissant ;
  - le plus ancien disparaît quand il y a plus de 3 arbres (`map` + `includes`) ;
  - `200` et `[]` sans arbre, ou sans arbre disponible.
- **Tests de `GET /api/trees`** : `withdrawn` exclu, `out_of_stock` inclus, tri par `id` croissant, `200` et `[]` sans arbre.
- **Tests de `GET /api/trees/:id`** :
  - `200` avec la `description` ;
  - `404` pour un arbre `withdrawn` et pour un id inexistant (`999`) ;
  - `400` et `"Identifiant invalide"` pour `abc`.
- **`src/api/src/app.spec.test.ts`** (nouveau fichier, à côté de `app.ts`) : `GET /api/health` en `200`, route inconnue en `404` avec `{ error: "Ressource introuvable", status: 404 }`.
- **Rangement de `treeController.spec.test.ts`** : un seul `describe("treeController")` qui contient les 3 routes, et le titre de chaque test en français au-dessus de son `it`.

### Décisions

- **Tests d'intégration rangés à côté du fichier testé**, suffixe `.spec.test.ts`. Le dossier `test/` ne contient que les outils partagés : `requester`, `createTree()`, `global-setup.ts`, `.env.test`.
- **BDD de test en mémoire vive** : `--tmpfs /var/lib/postgresql` dans le `docker run` de `test/config/global-setup.ts`. Sans risque : la base est supprimée à la fin des tests.
- **Objets pliés pour une seule propriété, dépliés à partir de deux**, à la main. Aucune option Prettier ne compte les propriétés, et l'idée d'une règle ESLint (`@stylistic/object-curly-newline`) est abandonnée.

### Difficultés

- **Tous les tests annulés** (`cancelled`), avec `PostgreSQL indisponible après 10 tentatives` puis `ECONNRESET` :
  - Docker range ses données sur le disque dur à plateaux (`/mnt/donnees/docker`, sur `sdb`) ;
  - au premier démarrage, PostgreSQL force l'écriture de ses fichiers sur le disque : environ 45 s au total ;
  - `waitForDatabase()` n'attend que 10 s.
  - Avec `--tmpfs`, PostgreSQL démarre en 3 s.
- **`Cannot find package 'axios'`** : déclaré dans `devDependencies`, mais pas encore installé → `npm install` dans `src/api/`.
- **Valeurs de `availability` sans guillemets** (`availability: available`) : JavaScript les lisait comme des variables qui n'existent pas.
- **Message d'erreur attendu faux** : `"invalid id"` alors que `validateId` renvoie `"Identifiant invalide"`.
- **Deux `describe("treeController")`** : le `});` qui fermait le premier était placé avant le bloc `/api/trees`.

### À poursuivre

- Test de `GET /api/trees/:id` pour un arbre `out_of_stock` (attendu : `200`).
- Test du format de la réponse : `price` en nombre, `photoUrl` et `categoryName` en camelCase.
- Ouvrir la PR `feat/test-setup` → `main`. La branche est partie avant l'entrée du 30/10 sur le front : il faudra garder les deux entrées du carnet au moment de la fusion.

## 2026-10-29 — Catalogue `findAllCatalog`, Docker de production et déploiement sur le VPS

Le matin, branche `feat/datamappers/accueil`, fusionnée deux fois dans `back` (09:56 et 11:09). L'après-midi, branche `feat/deployment`, qui part du dernier merge.

**✅ Le déploiement fonctionne.** Le site est en ligne en HTTPS sur le VPS Kourou, avec la branche `feat/deployment` (commit `38729f8`), et tous les tests passent.

### Travail réalisé

- **`findAll` renommée `findAllCatalog`** (commits `4af6ded` 09:47, `eb0df6f` 09:52, même message) :
  - `treeDatamapper.ts` : jointure `JOIN availability ON tree.availability_id = availability.id` ajoutée à la requête du catalogue ;
  - `treeController.ts` : `getAllTrees` appelle `treeDatamapper.findAllCatalog()`.
- **Merge dans `back`** (commit `4e03f6e`, 09:56) : `feat/datamappers/accueil` et `origin`, avec le carnet de Shanna (PR #65).
- **Dockerfile du front** (commit `5351488`, 10:14) : `RUN npm run build` remplace `RUN mkdir -p .next`. Le build crée aussi `.next` au nom de `node`, dont hérite le volume `.next` du dev.
- **Catalogue limité aux arbres en vente** (commit `7651267`, 11:07) :
  - colonnes préfixées par `tree.` (`tree.id`, `tree.name`…) ;
  - `WHERE availability.name = 'available'`.
  - Vérifié : `GET /api/trees` répond en 200, avec 13 arbres, tous `availabilityId: 1`.
- **Merge dans `back`** (commit `12a44b9`, 11:09).
- **Docker de production** (commit `38729f8`, carte #31), d'après la page wiki « Déployer sur un VPS Kourou, pas à pas » :
  - `src/docker-compose.prod.yml` : 4 services (`db`, `api`, `front`, `nginx`), plus `certbot` lancé à la demande (profil `outils`), et `name: graine` ;
  - `src/api/Dockerfile.prod` et `src/front/Dockerfile.prod` : construction en deux étapes, utilisateur `node` ;
  - `src/nginx/default.conf.template` : HTTP renvoyé vers HTTPS, `/api/` vers l'API, le reste vers le front ;
  - `src/.env.prod.example` ;
  - `output: "standalone"` dans `next.config.ts` ;
  - `!.env.prod.example` et `certbot/` dans `src/.gitignore` ;
  - pile testée d'abord en local, sous un autre nom de projet Docker (images de 177 Mo pour l'API, 209 Mo pour le front).
- **Déploiement sur le VPS** (<https://dimitrydereppe-server.eddi.cloud>) :
  - clé SSH créée sur la VM ;
  - clone, puis `git fetch` et `git switch feat/deployment` ;
  - `.env` rempli (`chmod 600`) ;
  - `up -d --build db api front` ;
  - certificat d'essai (`--staging`), puis vrai certificat Let's Encrypt ;
  - `up -d nginx`.
- **Vérifications** :
  - depuis Internet :
    - certificat Let's Encrypt reconnu, valable jusqu'au 27/01/2027 ;
    - `http://…/api/trees` renvoie `301` vers HTTPS ;
    - `https://…/` répond `200` ;
    - `/api/trees` renvoie 13 arbres, `/api/trees/featured` répond `200` ;
    - ports 3000, 4000, 5432, 5433 et 8080 fermés ;
  - sur la VM :
    - 4 conteneurs `Up`, `db` en `(healthy)` ;
    - `nginx -t` OK ;
    - seuls 22, 80 et 443 sont à l'écoute sur `0.0.0.0` ;
    - `restart: unless-stopped` sur les 4 conteneurs ;
    - 21 arbres en base.
- **Documentation** :
  - `docs/specifications/CAHIER-DES-CHARGES-JE-S-APPELLE-GRAINE.md` (justification des choix) et `docs/conception/diagrammes/01-architecture.md` : décision Nginx et Certbot en conteneur ;
  - Follow « Déployer sur un VPS Kourou » mis à jour (local et wiki, page 152) : chemins `src/`, pièges, check-list de vérifications sur la VM.

### Décisions

- **Nginx et Certbot dans des conteneurs**, et non installés sur le VPS (cf. cahier des charges et architecture). Raisons :
  - leur configuration est versionnée dans le dépôt et relue en PR ;
  - Nginx joint l'API et le front par leur nom de service (`api`, `front`) sur le réseau Docker, sans que leurs ports soient publiés ;
  - la pile de production se teste d'abord en local ;
  - un VPS neuf se remet en service avec `git clone` puis `docker compose`.
  - Contrepartie : quelques commandes Certbot de plus qu'un `certbot --nginx` (`--standalone`, puis `--webroot` et une tâche cron).
- **`name: graine` dans le compose de prod** : sans ce nom, Compose prendrait le nom du dossier (`src`), le même que le dev, et remplacerait les conteneurs de dev si on lançait la prod sur son poste.
- **Pas de Node sur le VPS** : il tourne dans les images.
- **Tester une branche sur le VPS avant de la fusionner** : elle doit être poussée, puis récupérée avec `git fetch` et `git switch`.

### Difficultés

- **`/api/trees` en 500 après `eb0df6f`** : `syntax error at or near "availability"`, en dev comme en prod.
  - Le premier `JOIN` avait été placé après le `;` de `FROM tree;`, donc hors de la requête.
  - En voulant corriger, le `;` est devenu une virgule (`FROM tree,`). Or un `JOIN` suit directement la table, sans virgule.
  - Une fois la virgule retirée, `id` et `name` devenaient ambigus : les tables `tree` et `availability` ont toutes les deux ces colonnes. D'où le préfixe `tree.` partout, comme dans `findFeatured()`.
- **Sur le VPS** :
  - `git clone` : `Permission denied (publickey)`, parce qu'il n'y avait pas encore de clé SSH sur la VM ;
  - `apt install npm` : série de `404 Not Found`, parce que la liste des paquets n'était pas à jour (`apt update` d'abord). Et npm était de toute façon inutile ;
  - `cp .env.prod.example .env` : `cannot stat`, commande lancée à la racine alors que le fichier est dans `src/` ;
  - Certbot `--staging` : `Service busy; retry later.`, serveur de test de Let's Encrypt surchargé. Ça a marché en relançant.
- **Écarts avec le wiki** :
  - SQL dans `api/src/data/` ;
  - `index.ts` et `config.ts` à copier dans l'image de l'API ;
  - pas de dossier `public/` dans le front ;
  - la vérification `config --env-file …` échoue (`env_file: .env` obligatoire).

### À poursuivre

- **PR de `feat/deployment`** vers `back` / `main`, avec les deux documents (`docs/`) à commiter.
- **Sur le VPS** : renouvellement automatique du certificat (`--dry-run`, puis ligne cron avec le chemin `…/src`) et sauvegarde de la base. `crontab -l` est encore vide.
- **À valider avec l'équipe** : le seed dit que `out_of_stock` doit rester « visible, non commandable ». Or le catalogue masque maintenant les 5 arbres en rupture. Deux options : `WHERE availability.name <> 'withdrawn'` (18 arbres), ou mettre à jour le commentaire du seed.
- `/api/health` est en commentaire dans `index.router.ts` : à rétablir, c'est le test de déploiement le plus simple.
- Les photos des arbres ne sont pas servies (`express.static`). Il faudra ensuite copier les images dans `Dockerfile.prod`.
- Mot de passe admin à changer en production quand argon2 et la connexion seront en place.

## 2026-10-28 (après-midi) — Datamapper `tree` et routes `/api/trees` de l'accueil

Branche `feat/datamappers/accueil`, PR #61 fusionnée à 15:44 (après la PR #60 `.gitignore`, fusionnée à 10:29).

### Travail réalisé

- **`src/api/src/datamappers/treeDatamapper.ts`** (commit `23c7469`) : objet `treeDatamapper` avec deux méthodes qui interrogent la base via `pool.query` :
  - `findAll()` : tous les arbres ;
  - `findFeatured()` : les arbres mis en avant sur la page d'accueil.
- **Types** dans `src/api/src/@types/index.d.ts` (commit `8797a2b`) : `ITree` et `IFeaturedTree`, importés dans le datamapper pour typer les retours (`Promise<ITree[]>`, `Promise<IFeaturedTree[]>`).
- **Commentaires** dans le datamapper (commit `70833ad`) : rôle de chaque méthode, ligne par ligne pour la requête SQL.
- **Export nommé** (commit `73a8ed0`) : `export const treeDatamapper` à la place de `export default`, comme les autres modules du projet (`export const router`...), et pour éviter un conflit au merge avec le controller.
- **Merge de `origin/feat/router-acceuil`** dans ma branche (commit `2c7d781`) : récupère le controller (Fabrice, `878277f`) et le router `tree` (Mahamadou, `80ef8f9`) pour tester la chaîne complète route → controller → datamapper → base.
- **Corrections après le merge** (commit `479da8d`) :
  - `treeRouter.ts` : routes écrites `/trees` et `/trees/featured` au lieu de `/api/trees...`. Le préfixe `/api` est déjà ajouté par `app.use("/api", ...)` dans `app.ts` ; sinon l'adresse devenait `/api/api/trees`.
  - `app.ts` : suppression du second `app.use("/api", treeRouter)`, le router `tree` étant déjà branché dans `index.router.ts`.
  - `findFeatured()` réécrite d'après le vrai schéma : jointure `tree.availability_id = availability.id`, filtre `availability.name = 'available'`, `ORDER BY tree.id` (sans tri, PostgreSQL ne garantit aucun ordre), `LIMIT 3`. Colonnes préfixées par `tree.` parce que `availability` a aussi des colonnes `id` et `name`.
  - Prix renvoyé en nombre : `CAST(price AS FLOAT)` dans les deux requêtes. `price` est en `NUMERIC`, que `pg` renvoie en texte (`"9.90"`).
  - `IFeaturedTree` aligné sur les colonnes réellement renvoyées (`photo_url`, `category_id`).
  - `test/test.tree.http` : requête `GET http://localhost:4000/api/trees/featured`.

### Difficultés

- **Première version de `findFeatured()` incompatible avec le schéma** : elle supposait une table `availability` avec `tree_id`, `is_available`, `start_date` et `end_date`, alors que c'est `tree` qui pointe vers `availability` (`availability_id`), et `availability` ne contient qu'un statut (`name`). La requête contenait aussi `trees.id` (table `tree` au singulier) et deux `WHERE` à la suite (il faut un seul `WHERE` avec `AND`).
- **Route introuvable après le merge** : le préfixe `/api` était écrit à la fois dans `app.ts` et dans `treeRouter.ts` → `/api/api/trees`.

### À poursuivre

- Le commit `9b72536` (message avec les commentaires du Dockerfile sur une ligne) est maintenant poussé et fusionné : on ne le corrige plus avec `--amend`, on le laisse tel quel.
- Fabrice a ensuite passé les réponses en camelCase et ajouté `planting_location` (`b693daa`, `826a432`, PR #63) : vérifier que `IFeaturedTree` correspond toujours aux colonnes renvoyées.
- Toujours en attente : CORS avec l'origine du front, emplacement de `db-client.ts`, `src/package-lock.json` vide.

## 2026-10-28 — Conteneurs front et API sous l'utilisateur `node`

Travail solo, avec l'aval du groupe.

### Travail réalisé

- **Diagnostic « Cannot GET » et « connexion échouée »** : db, adminer et api tournaient, mais le conteneur `front` était resté à l'état `Created`, sans jamais démarrer. Cause : `failed to bind host port 0.0.0.0:3000/tcp: address already in use`. Le port 3000 était déjà occupé par un autre programme au moment du `up`.
  - Le `Cannot GET /` sur le port 4000 est la page 404 par défaut d'Express. Toutes les routes sont sous `/api` (`/api/health`, `/api/trees`), donc ce n'est pas une panne.
- **Front reconstruit** avec l'image à jour (`USER node`, commit `b28e153`) :
  - commandes : `rm -sf front`, puis `docker volume rm src_front-next src_front-node-modules`, puis `up -d --build front` ;
  - vérifié : `docker compose exec front whoami` → `node`.
- **Dockerfile de l'API** (commit `9b72536`), même modèle que le front :
  - `RUN chown node:node /api` puis `USER node` ;
  - `--chown=node:node` sur les `COPY`, parce que `COPY` écrit en root même après `USER`.
  - Image reconstruite (`npm run build` passe), conteneur recréé, `whoami` → `node`.
- **Ports** : `API_HOST_PORT` remis à `4000` dans `.env.docker` (il valait `4001`), cohérent avec `API_URL=http://localhost:4000/api/`. État vérifié : front sur 3000 (200), api sur 4000, db sur 5433, adminer sur 8080.
- **`.gitignore`** (commits `a813e13`, `6249bd7`) : exceptions `!.env.example` et `!.env.docker.example`, pour que les modèles d'environnement soient suivis par git alors que les `.env*` sont ignorés.

### Difficultés

- **Pre-commit en échec avec `EACCES: permission denied, open '.../src/front/next-env.d.ts'`** :
  - `next-env.d.ts` et `.next` appartenaient à root. Ils avaient été créés le 27/10 à 17:00 par le conteneur front, dont l'image (construite à 16:59) tournait encore en root. La correction `USER node` n'est arrivée qu'à 23:16, et une image ne change pas tant qu'on ne la reconstruit pas.
  - Le hook lance `npm --prefix src/front run typecheck`, donc `next typegen`, qui réécrit `next-env.d.ts` → refusé.
  - Débloqué avec `sudo chown -R $USER:$USER src/front/next-env.d.ts src/front/.next`. Le premier essai a échoué (« Aucun fichier ou dossier de ce nom ») parce que la commande n'était pas lancée depuis la racine du dépôt : les chemins relatifs partent du dossier courant (`pwd`).
- **Les volumes nommés gardent les propriétaires de leurs fichiers** : un volume rempli par root reste à root après la reconstruction de l'image. Il faut supprimer les volumes du service concerné (pas `down -v`, qui efface aussi `db-data`).
- `docker compose ps` lancé sans `--env-file .env.docker` affiche des dizaines d'avertissements « variable is not set » et échoue (`no port specified`).

### À poursuivre

- Revoir le message du commit `9b72536`, qui contient les commentaires du Dockerfile collés sur une seule ligne (à corriger avant la PR, par exemple `git commit --amend` tant qu'il n'est pas poussé).
- Vérifier si les doublons `api/data/` et `api/public/` (cf. 27/10) reviennent encore maintenant que l'ancienne image `src-api` a été remplacée.
- Toujours en attente : CORS avec l'origine du front, emplacement de `db-client.ts`, `src/package-lock.json` vide.

## 2026-10-27 — Un seul dossier de données (`api/src/data`)

### Travail réalisé

- Suppression des doublons `src/api/data/` et `src/api/public/` (`git rm -r`, 49 fichiers) :
  - `data/` contenait les mêmes fichiers que `src/data/` (sans `db-client.ts`, utilisé par le routeur) ;
  - `public/` contenait les images en double (`public/images/` et `public/public/images/`), toutes déjà présentes dans `src/public/`, et aucun code n'y faisait référence.
- Chemins mis à jour vers `src/data/` : montages `initdb.d` de `docker-compose.yml` (lignes 37-38), script `db:seed` de `package.json` et `README.md`. Vérifié avec `docker compose config --quiet`.
- Question réglée au passage : pas besoin de `DROP TABLE` en tête de `01-schema.sql`. `initdb.d` ne s'exécute que sur un volume vide, et `db:reset` fait déjà `DROP SCHEMA public CASCADE` avant de rejouer le schéma.
- **État final (commit `d33dcc2`)** : données dans `src/api/src/data/`, images dans `src/api/src/public/`. Fichiers ramenés avec `git mv` : git les voit comme renommés (`R`), l'historique est conservé.
- **`src/api/.gitignore`** : ajout de `/data/` et `/public/`. Le `/` au début limite la règle aux dossiers situés à côté du `.gitignore` (`src/api/data`, `src/api/public`). Sans lui, git ignorerait aussi `src/api/src/data` et `src/api/src/public`.
- **Dossiers des couches de l'API** créés dans `src/api/src/` d'après le [[docs/conception/diagrammes/01-architecture|diagramme d'architecture]] : `middlewares/`, `controllers/`, `services/`, `datamappers/`. Chacun contient un `.gitkeep`, parce que git ne suit pas les dossiers vides.
- Vérifié sur un volume neuf (`down -v` puis `up -d`) : 8 tables et 21 arbres chargés depuis `api/src/data/`.
- **`src/.env.docker.example`** (commit `d33dcc2`) : ajout d'un bloc `# API` avec `NODE_ENV`, `DATABASE_URL` (hôte `db`, le nom du service Compose), `API_PORT=4000` et `API_HOST_PORT=4001`. Le modèle reflète maintenant les variables lues par le service `api`.

### Difficultés

- Risque repéré avant la suppression : `docker-compose.yml` montait encore `./api/data/...`. Sans mise à jour, Docker aurait recréé des dossiers vides appartenant à root à la place des fichiers SQL, comme le 2026-10-26 → chemins corrigés dans le même commit.
- **Les doublons réapparaissent après chaque commit de nettoyage**, en fichiers non suivis (`??`) : à 07:50 après le commit de 07:44, à 09:10 et à 09:20. Les fichiers sont complets, m'appartiennent (pas à root) et sont écrits un par un, environ 0,4 s par fichier. Ils correspondent exactement au contenu de l'ancienne image `src-api` (construite le 26/10 à 16:49) : `data/`, `public/images`, `public/public`, `src/data`, `src/public`.
  - Cause non trouvée. Ce n'est ni git (rien dans le reflog), ni le conteneur (il tourne en root et l'API n'écrit aucun fichier), ni un outil de synchronisation.
  - J'ai d'abord pensé à `docker compose up -d`, mais la séquence `down -v` puis `up -d` lancée depuis un autre shell ne les recrée pas : testée 4 fois.
  - Piste restante : un programme lancé depuis VS Code (extension Docker, Container Tools ou Dev Containers ?).
  - Parade : la règle `.gitignore` ci-dessus. Même s'ils reviennent, git ne les affiche plus.
  - Ils sont revenus une fois de plus à 09:30 (`api/data/` et `api/public/`, après le commit de 09:19). Cette fois `git status --ignored` les marque `!!` (ignorés) et non plus `??` : la parade fonctionne.
- Au passage, aller-retour sur l'emplacement des données (`api/data` ↔ `api/src/data`) entre les commits `13d2acd`, `af8fbb6` et `d33dcc2`.

### À poursuivre

- ~~Retester sur un volume neuf que le schéma et le seed sont bien chargés depuis `api/src/data/`~~ → fait (8 tables, 21 arbres).
- Trouver ce qui recrée les dossiers : lancer `ls api ; docker compose --env-file=.env.docker up -d ; ls api` dans le terminal de VS Code, puis dans un terminal hors de VS Code, et comparer.
- Reconstruire l'image (`up -d --build`) : celle du 26/10 contient encore `data/`, `public/public`, `src/errors` et `src/lib`.
- Placer `db-client.ts` (actuellement dans `src/data/`) : il relève plutôt des datamappers ou d'un dossier de configuration de la base.
- **CORS, maintenant que le front existe** (Next.js initialisé par Loïc dans `src/front/`, commits `db5cee2` et `e9c776a`) : `app.ts` appelle `cors()` sans option, donc toutes les origines sont acceptées, et `config.allowedOrigins` (`ALLOWED_ORIGINS`, `*` par défaut) n'est lu nulle part. À brancher avec l'origine du front (`http://localhost:3000` en dev, port par défaut de Next.js).
- `src/package-lock.json` vide (`"packages": {}`) ajouté par `db5cee2`, sans `package.json` à côté : sans doute un `npm install` lancé depuis `src/`. À signaler à Loïc avant de le supprimer.

## 2026-10-26 — API dans Docker : démarrage, rechargement automatique et première requête

### Travail réalisé

- **Service `api` du compose** (`src/docker-compose.yml`), en mode développement :
  - bind mount `./api:/src/app.ts` (le `WORKDIR` du Dockerfile) et `command: ["npm", "run", "dev"]` : `tsx watch` relance l'API à chaque sauvegarde, sans `--build` (testé : `[tsx] change in ./src/app.ts Restarting...` puis `Server ready`) ;
  - volume nommé `api-node-modules` monté sur `node_modules`, pour que le `node_modules` de la machine ne recouvre pas celui de l'image ;
  - `depends_on` avec `condition: service_healthy` : l'API attend que `pg_isready` réponde.
- **`src/api/.dockerignore`** complété (`dist`, `node_modules`, `.env*`, tests, README...).
- **Script `docker:start`** ajouté dans `package.json` (le `CMD` du Dockerfile) : il lance le code compilé et reste prévu pour la prod.
- **Première requête vers la base depuis l'API** :
  - `src/api/src/data/db-client.ts` crée un client `pg` à partir de `DATABASE_URL` et se connecte au démarrage ;
  - route de test `GET /api/` dans `index.router.ts` : elle exécute `SELECT * FROM tree;` et renvoie les lignes en JSON.

### Difficultés

- **Conteneur `src-api` en `Restarting (1)` et rien sur `localhost:4000`** → `npm error Missing script: "docker:start"` : le `CMD` appelait un script absent de `package.json` → script ajouté.
- **API plantée au premier lancement** avec `the database system is starting up` (code `57P03`) → `depends_on: - db` attend que le conteneur soit démarré, pas que PostgreSQL soit prêt → `condition: service_healthy`.
- **`npm install` en échec pendant le build (`EJSONPARSE`)** → `package.json` cassé lors d'une modification : accolades de `scripts` et `allowScripts` mal fermées, `dotenv` et `@types/cors` retirés alors qu'ils sont encore importés, `db:seed` supprimé et scripts `db:*` privés de `-f ../docker-compose.yml --env-file ../.env.docker` (sans eux, Compose lit `api/.env`, où il n'y a pas les ports) → fichier rétabli sur la version du dernier commit, plus `docker:start`.
- **`localhost:4000/` répond 404** → normal : toutes les routes sont sous `/api`.

### À poursuivre

- ~~`start_period` dans le healthcheck de `db`~~ → fait : sur un volume neuf, `up -d` donnait `dependency failed to start: container src-db-1 is unhealthy` (initialisation d'environ 30 s, alors que le healthcheck abandonne au bout d'environ 25 s) → `start_period: 90s`, puis ramené à `30s` (commit `cd42e85`). Pas encore retesté sur un volume neuf (`down -v`) : avec 30 s, la marge est faible si l'initialisation dure près d'une minute.
- ~~**Ligne `test:` du healthcheck à vérifier**~~ → corrigé : guillemet remis après `$$POSTGRES_DB`, la commande redevient un seul élément (`"pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"`, vérifié avec `docker compose config`). Elle avait été modifiée dans le même commit : `[ "CMD-SHELL", "pg_isready", -U $$POSTGRES_USER -d $$POSTGRES_DB" ]`. Les guillemets ne sont plus appariés et `docker compose config` y lit 3 éléments au lieu d'un seul. Avec `CMD-SHELL`, seul le 2ᵉ élément est exécuté : `pg_isready` tourne sans `-U` ni `-d`.
- Route de test `GET /api/` : à remplacer par les vraies routes (`/api/trees`...) et retirer le `console.log`.
- Après ajout d'une dépendance npm : `docker volume rm src_api-node-modules`, puis `up -d --build`.
- Renommer le `WORKDIR` `/src/app.ts` en `/app` (et le bind mount avec).

## 2026-10-26 — Base de données dans Docker et scripts npm

Travail fait en groupe.

### Travail réalisé

- **`docker-compose.yml`** (dans `src/`) : un service `bdd` (PostgreSQL 18, avec healthcheck) et un service `adminer`. `01-schema.sql` et `02-seed.sql` sont montés dans `/docker-entrypoint-initdb.d/` : PostgreSQL les exécute tout seul à la création de la base.
- **Scripts npm de la base** dans `src/api/package.json`, documentés dans le README de l'API :
  - `db:up` : démarre la base et attend qu'elle soit prête ;
  - `db:reset` : supprime tout, puis rejoue le schéma et le seed ;
  - `db:seed` : vide les tables (`TRUNCATE ... RESTART IDENTITY CASCADE`) et réinsère `data/02-seed.sql`, envoyé depuis la machine sur l'entrée de `psql`. Il ne touche pas aux tables elles-mêmes et peut être relancé sans créer de doublons (testé deux fois de suite sur une base jetable : 2 rôles, 10 comptes, 21 arbres) ;
  - `db:psql` : ouvre une console `psql` dans le conteneur.
- La base démarre maintenant correctement : conteneur `bdd` « healthy », 8 tables créées.

### Difficultés

- **`services.volumes.db-data false schema`** → `volumes:` était indenté de 2 espaces : Compose le lisait comme un 3ᵉ service → remis en colonne 0, au même niveau que `services:`.
- **Base démarrée sans aucune table** → les montages pointaient vers `./01-schema.sql`, un fichier qui n'existait pas dans `src/`. Docker a alors créé à la place deux **dossiers vides appartenant à root** → chemins corrigés en `./api/data/...`.
- **Chemins corrigés, mais toujours aucune table** → les logs disaient `Database directory appears to contain a database; Skipping initialization` : les scripts d'init ne tournent qu'avec un volume vide → `docker compose down -v` puis `up -d`.
- **`container src-bdd-1 is unhealthy`** → la première initialisation prend environ une minute sur la machine (création de la base, puis schéma et seed), alors que le healthcheck abandonnait au bout d'environ 25 s (5 essais × 5 s). La base a démarré au lancement suivant ; la piste retenue est `start_period` dans le healthcheck.
- **`depends_on.bdd must be a mapping`** → `bdd:` était écrit sans condition en dessous → repassé en forme liste (`- bdd`).

### À poursuivre

- Les scripts `db:*` visent le service `db`, mais il s'appelle `bdd`. Ils sont aussi lancés depuis `src/api/`, alors que le compose est dans `src/` → choisir un seul nom et pointer vers le bon compose (`-f ../docker-compose.yml` ou autre).
- Supprimer les dossiers vides `src/01-schema.sql/` et `src/02-seed.sql/` (`sudo rmdir`).
- Remettre `:ro` (lecture seule) sur les montages des fichiers SQL.
- Ajouter `start_period` au healthcheck, pour que la première initialisation ne soit plus déclarée « unhealthy ».
- ~~Garder un seul dossier de données : `api/data/` et `api/src/data/` contiennent les mêmes fichiers.~~ → fait le 2026-10-27 (`api/src/data/` conservé).
- Installer l'extension VS Code YAML (Red Hat) : elle signale les erreurs de `docker-compose.yml` pendant la frappe.

## 2026-10-23 — Versions communes et scripts SQL

### Travail réalisé

- **Scripts SQL de la base**, préparés pour la session de lundi (étape 4) :
  - `01-schema.sql` : l'extension `unaccent` et les 8 tables, avec leurs contraintes ;
  - `02-seed.sql` : les rôles, les catégories, les disponibilités, 21 arbres (dont un retiré et un épuisé, pour les tests de l'accueil) et le premier compte admin (mot de passe haché en Argon2).
- Les deux scripts ont été testés sur PostgreSQL 18 dans Docker : tables, données, contraintes et suppressions.

### Décisions (prises avec Loïc)

| Outil                               | Version retenue |
| ----------------------------------- | --------------- |
| Node.js                             | **24 LTS**      |
| PostgreSQL                          | **18**          |
| pg (client PostgreSQL pour Node.js) | **8.23**        |
| TypeScript                          | **5**           |
| Next.js                             | **16**          |

- La même version de Node.js pour tout le monde : elle sera notée dans le README (partie « Prérequis ») et utilisée dans les Dockerfiles de l'API et du front.
- PostgreSQL 18 : dans `docker-compose.yml`, le volume se monte sur `/var/lib/postgresql` (et non plus sur `/var/lib/postgresql/data`).

### À poursuivre

- Annoncer les versions dans le canal de l'équipe (la case Node.js de la checklist en dépend).
- Faire relire les scripts SQL par Mahamadou avant lundi.
- Décider lundi du chemin des photos (`/images/trees/`) et l'annoncer.

## 2026-10-21 — Lieu de plantation et compte actif

### Travail réalisé

- **Lieu de plantation** ajouté au modèle de données. Il était déjà prévu dans le cahier des charges (fiche arbre) et dans les user stories US04 et US41, mais absent des documents de conception.
  - `tree.planting_location` : `VARCHAR(150)`, facultatif.
  - `purchase_line.planting_location` : copie du lieu **au moment de l'achat**, facultative.
  - Mis à jour : entités, entités-propriétés, relations, cardinalités, MCD (et source Mocodo), MLD, MPD, dictionnaire de données, et les 3 schémas Draw.io.
- **`account.is_active`** (`BOOLEAN NOT NULL DEFAULT TRUE`) ajouté aux 3 schémas Draw.io (MCD, MLD, MPD).
- Légende du schéma MLD déplacée : elle passait sur la table `tree`.

### Décisions (prises avec l'équipe sur Discord)

- **Lieu de plantation = simple champ texte** pour le MVP. Il pourra devenir une entité **Lieu** plus tard, si la carte interactive (US33, évolution) a besoin de coordonnées.
- **Lieu figé dans la commande**, comme le nom et le prix : si l'admin modifie le lieu d'un arbre, l'historique des commandes ne change pas.
- **Compte actif (`is_active`)** : géré par l'admin (`PATCH /api/users/:id`, « Modifier l'état d'un compte client »). Un compte est actif dès l'inscription. Un utilisateur désactivé qui se connecte reçoit un **403** : il est bien identifié, mais n'a pas le droit d'accéder au service.

### À poursuivre

- Reporter `is_active` dans les documents texte : entités-propriétés, MCD (et source Mocodo), MLD, dictionnaire de données.
- Préciser où contrôler `is_active` dans l'API : à la connexion, et sur les routes protégées pour une session déjà ouverte.
- Aligner le diagramme de séquence de l'authentification sur le cahier des charges actuel (authentification simplifiée).

## 2026-10-20 — Diagrammes de conception

### Travail réalisé

- Diagramme de séquence de l'authentification (inscription, connexion, route protégée, déconnexion), en Mermaid.
- Diagramme d'architecture de l'application (front Next.js sur Vercel, API Express dans Docker sur mon serveur, PostgreSQL chez Neon), en Mermaid : [[Apothéose/apo-greenroots/docs/conception/diagrammes/01-architecture|architecture]].
- Orthographe de mon prénom corrigée (« Dimitry ») dans le cahier des charges et les diagrammes.

### Décisions (prises avec l'équipe sur Discord)

- L'authentification sera **moins poussée** que dans la première version du diagramme de séquence.
- La séquence la plus complexe du projet est la **validation du panier en commande** (`POST /api/orders`) : 5 tables touchées, règles métier, transaction.
