# Carnet de bord — Dimitry (Tech Lead Back)

Suivi de mon travail sur Je s’appelle Graine. Les décisions notées ici ont été prises avec l'équipe sur Discord ; le suivi de l'équipe est dans le [[Apothéose/apo-jesappellegraine/CARNET-DE-BORD-JE-S-APPELLE-GRAINE|carnet de bord Je s’appelle Graine]].

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
