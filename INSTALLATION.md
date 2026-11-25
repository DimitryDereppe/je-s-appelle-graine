# Guide d'installation — Je s'appelle Graine

Ce guide explique comment installer le projet et vérifier qu'il fonctionne. Il y a deux manières de le faire tourner, au choix :

|                 | 1. Tout en Docker         | 2. En local (base en Docker)                             |
| --------------- | ------------------------- | -------------------------------------------------------- |
| Base de données | Docker                    | Docker                                                   |
| API             | Docker                    | ta machine (`npm run dev`)                               |
| Front           | Docker                    | ta machine (`npm run dev`)                               |
| Pour qui        | **la manière par défaut** | déboguer dans VS Code, logs directement dans le terminal |

Commence par l'[installation commune](#installation-commune), puis suis le chapitre de ton choix : 1. Tout en Docker ou 2. En local (base en Docker).

Ensuite, garde sous la main :

- [3. Au quotidien](#3-au-quotidien) : les comptes pour essayer, les commandes utiles, les tests, les emails, et quoi faire après un `git pull` ;
- le [dépannage](#dépannage).

> ⚠️ **Toutes les commandes `docker compose` se lancent depuis `src/`, avec `--env-file .env.docker`.** Sans lui, Docker ne trouve aucune variable : il affiche `The "…" variable is not set` puis `no port specified`.

---

## Installation commune

### Prérequis

Toutes les commandes de ce guide sont les mêmes sous Windows (WSL) et macOS. Seule l'installation des outils change.

**Windows**

- **WSL 2** (Ubuntu). Toutes les commandes se lancent dans le terminal Ubuntu.
- **Docker Desktop**, avec l'intégration WSL activée pour Ubuntu (Settings → Resources → WSL integration).
- **Node.js 24** installé **dans WSL** (par exemple avec `nvm install 24`).
- **Git**, configuré avec ton nom et ton e-mail.
- **VS Code**, avec l'extension WSL. Ouvre le projet avec `code .` depuis le terminal Ubuntu.

> ⚠️ Clone le dépôt dans le système de fichiers de WSL (`~/...`), **pas** dans `/mnt/c/...`. Sous `/mnt/c`, le rechargement automatique ne marche pas, tout est lent, et les droits des fichiers posent problème.

**macOS**

- **Docker Desktop pour Mac**, en choisissant la version de ta puce : Apple (M1, M2…) ou Intel. Dans Settings → General, garde **VirtioFS** pour le partage de fichiers.
- **Node.js 24**, par exemple avec `nvm install 24` ou `brew install node@24`.
- **Git** : il est installé avec les outils de développement Apple (`xcode-select --install`). Configure ton nom et ton e-mail.
- **VS Code**. Pour pouvoir l'ouvrir avec `code .` : palette de commandes → « Shell Command: Install 'code' command in PATH ».
- Clone le dépôt où tu veux dans ton dossier personnel (`~/...`).

**Dans les deux cas**, `node -v` doit afficher `v24.x`. Node est nécessaire sur ta machine même avec Docker : les vérifications de Husky (Prettier, ESLint, TypeScript) s'exécutent au moment du commit. VS Code s'en sert aussi pour l'autocomplétion.

### Cloner le dépôt

```bash
git clone https://github.com/DimitryDereppe/je-s-appelle-graine.git
cd je-s-appelle-graine
```

### Installer les dépendances (avant Docker !)

```bash
npm install
npm --prefix src/api ci
npm --prefix src/front ci
mkdir -p src/api/node_modules src/front/node_modules src/front/.next
```

- `npm install` à la racine installe **Husky**, lint-staged et Prettier, et active les hooks Git.
- `npm ci` installe exactement les versions du `package-lock.json` : les mêmes chez tout le monde.
- `mkdir -p` s'assure que les dossiers `node_modules` et le cache du front (`.next`) existent à ton nom. Le compose y monte des volumes Docker : si un dossier manque, Docker le crée au nom de `root`, et ensuite `npm install` ou Husky n'ont plus le droit d'y écrire. `-p` ne fait rien si le dossier existe déjà.

> Pendant l'installation, npm peut afficher des avertissements (`npm warn`). Ils sont **normaux** et ne bloquent rien :
>
> - `deprecated eslint@9…` : ESLint 9 n'est plus maintenu, mais il fonctionne. La mise à jour vers ESLint 10 est prévue plus tard ;
> - `install-scripts … unrs-resolver` : npm demande d'approuver le script d'installation d'un paquet utilisé par ESLint. Rien à faire, ESLint fonctionne sans.
>
> L'installation a réussi si npm affiche `added … packages` et `found 0 vulnerabilities`, sans aucune ligne `npm error`.

> ⚠️ **L'ordre compte.** Si tu lances Docker avant ces commandes, Docker crée des dossiers `node_modules` vides sur ta machine, et Husky refuse tous tes commits (`next: not found`). Sous WSL, ces dossiers sont en plus au nom de `root` et non modifiables. Pour réparer, voir le [dépannage](#fichiers-au-nom-de-root-eacces-next-not-found).

Vérifie que les hooks sont actifs :

```bash
git config core.hooksPath
```

La commande doit afficher `.husky/_`.

### Créer le fichier d'environnement Docker

Ce fichier sert dans les deux manières de travailler : la base de données tourne toujours dans Docker.

```bash
cp src/.env.docker.example src/.env.docker
```

Ouvre `src/.env.docker` dans VS Code et remplace `A_REMPLIR` par le mot de passe de la base, **aux deux endroits** : dans `POSTGRES_PASSWORD` et dans `DATABASE_URL`.

Ce fichier n'est jamais commité : il est dans le `.gitignore`.

---

## 1. Tout en Docker

Les 4 services tournent dans Docker :

| Service   | Rôle                                  | Adresse sur ta machine                        |
| --------- | ------------------------------------- | --------------------------------------------- |
| `front`   | Next.js, rechargement automatique     | `http://localhost:3000` (`FRONT_HOST_PORT`)   |
| `api`     | Express + TypeScript (`tsx watch`)    | `http://localhost:4000/api` (`API_HOST_PORT`) |
| `db`      | PostgreSQL 18                         | `localhost:5433` (`POSTGRES_PORT`)            |
| `adminer` | Interface web pour la base de données | `http://localhost:8080` (`ADMINER_PORT`)      |

Le code reste sur ta machine : il est « branché » dans les conteneurs.

### 1.1 Lancer le projet

Toutes les commandes Docker se lancent **depuis le dossier `src/`** :

```bash
cd src
docker compose --env-file .env.docker up -d --build
```

Le premier lancement prend quelques minutes. Docker construit les images, puis PostgreSQL crée la base et joue `01-schema.sql` et `02-seed.sql`.

### 1.2 Vérifier que tout fonctionne

```bash
docker compose --env-file .env.docker ps
```

Les 4 services doivent être `Up`, et `db` doit être `(healthy)`. Ensuite, dans le navigateur :

| Test                   | Adresse                            | Résultat attendu                            |
| ---------------------- | ---------------------------------- | ------------------------------------------- |
| Front                  | `http://localhost:3000`            | la page d'accueil, avec la liste des arbres |
| API en direct          | `http://localhost:4000/api/health` | `{"message":"je s'appelle Graine 🌲"}`      |
| API à travers le front | `http://localhost:3000/api/health` | la même réponse                             |
| Données de l'API       | `http://localhost:4000/api/trees`  | la liste des arbres en JSON                 |
| Adminer                | `http://localhost:8080`            | une page de connexion                       |

Pour te connecter à Adminer :

- Système : `PostgreSQL` ;
- Serveur : `db` ;
- Utilisateur, mot de passe et base : ceux de ton `.env.docker`.

Pour tout arrêter (les données de la base sont conservées) :

```bash
docker compose --env-file .env.docker down
```

---

## 2. En local (base en Docker)

Seule la base de données tourne dans Docker. L'API et le front tournent sur ta machine, chacun dans son terminal.

| Service | Où         | Adresse                                                |
| ------- | ---------- | ------------------------------------------------------ |
| `front` | ta machine | `http://localhost:3000`                                |
| `api`   | ta machine | `http://localhost:4050/api` (`PORT` du `src/api/.env`) |
| `db`    | Docker     | `localhost:5433` (`POSTGRES_PORT`)                     |

### 2.1 Créer les fichiers d'environnement locaux

Ces deux fichiers ne sont jamais commités. Leurs modèles (`.env.example`) le sont.

**L'API** (depuis `src/api/`) :

```bash
cp .env.example .env
```

Ouvre `src/api/.env` et remplace `a_remplir` par le mot de passe de la base (le même que dans `src/.env.docker`). Il contient :

```dotenv
NODE_ENV=development
PORT=4050
DATABASE_URL=postgres://graine:a_remplir@localhost:5433/graine
ALLOWED_ORIGINS=http://localhost:3000
```

- `PORT=4050` : un port différent de celui de l'API Docker (4000), pour éviter tout conflit.
- `ALLOWED_ORIGINS` : l'adresse du front, le seul site autorisé à appeler l'API depuis un navigateur (CORS).
- `PAYMENT_*` : les instructions de paiement affichées après une commande. Laisse-les vides en dev : l'API prend des valeurs fictives (`config.ts`).
- Pas de `JWT_SECRET` ni de `SMTP_*` en dev : l'API prend une clé de secours, et les emails sont affichés dans le terminal (voir [3.4](#34-les-emails-en-développement)). Les vraies valeurs ne sont que dans le `.env` du VPS (`DEPLOIEMENT.md`).
- Dans `DATABASE_URL`, l'hôte est `localhost` et le port `5433`. Depuis ta machine, tu passes par le port publié par Docker (`POSTGRES_PORT`). L'hôte `db` et le port `5432` ne marchent qu'entre conteneurs.

**Le front** (depuis `src/front/`) :

```bash
cp .env.example .env.local
```

Il contient l'adresse de ton API locale :

```dotenv
API_URL=http://localhost:4050
```

Le front relaie `/api/...` vers cette adresse (voir `next.config.ts`).

Ces fichiers ne gênent pas le mode tout en Docker : Docker définit ses propres variables, et elles passent avant celles des fichiers `.env`.

### 2.2 Lancer le projet

**1. Arrête l'API et le front Docker** s'ils tournent, depuis `src/`. Sinon ils occupent les ports.

```bash
docker compose --env-file .env.docker stop api front
```

**2. Démarre la base seule**, depuis `src/api/` :

```bash
npm run db:up
```

La commande rend la main quand la base est prête.

**3. Lance l'API**, toujours depuis `src/api/` :

```bash
npm run dev
```

**4. Lance le front** dans un **deuxième terminal**, depuis `src/front/` :

```bash
npm run dev
```

### 2.3 Vérifier que tout fonctionne

| Test                   | Adresse                            | Résultat attendu                            |
| ---------------------- | ---------------------------------- | ------------------------------------------- |
| Front                  | `http://localhost:3000`            | la page d'accueil, avec la liste des arbres |
| API en direct          | `http://localhost:4050/api/health` | `{"message":"je s'appelle Graine 🌲"}`      |
| API à travers le front | `http://localhost:3000/api/health` | la même réponse                             |
| Données de l'API       | `http://localhost:4050/api/trees`  | la liste des arbres en JSON                 |

Au démarrage, le front affiche `Environments: .env.local` : c'est le signe que ton fichier est bien lu.

Pour tout arrêter :

1. `Ctrl+C` dans les deux terminaux ;
2. depuis `src/`, `docker compose --env-file .env.docker down` pour arrêter la base.

---

## 3. Au quotidien

### 3.1 Les comptes pour essayer

La base est remplie par `02-seed.sql` :

- **Clients :** `alice@test.fr`, `charlie@test.fr`, `eve@test.fr`, mot de passe `Client12345!` ;
- **Comptes désactivés** (la connexion répond 403) : `bob@test.fr`, `david@test.fr`, même mot de passe ;
- **Administrateurs :** un compte par membre de l'équipe (`prenom@graine.fr`). Les mots de passe sont partagés en privé dans l'équipe : ils ne vont **jamais** dans le dépôt, ni dans un fichier `.http`.

### 3.2 Les commandes de la base

Depuis `src/api/`, base lancée (Docker ou `npm run db:up`) :

| Commande           | Ce qu'elle fait                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| `npm run db:seed`  | remet les données de test (vide les tables, rejoue `02-seed.sql`) : tes commandes sont effacées |
| `npm run db:reset` | recrée toute la base : tables (`01-schema.sql`) et données de test                              |
| `npm run db:psql`  | ouvre `psql` dans la base, pour lancer une requête à la main (`\q` pour sortir)                 |

Ces commandes ne touchent qu'à la base de développement, jamais à celle des tests.

### 3.3 Lancer les tests et les vérifications

Depuis `src/api/`, **Docker lancé** :

```bash
npm test
```

- `npm test` lance les tests unitaires (`*.unit.test.ts`), puis les tests d'intégration (`*.spec.test.ts`).
- Les tests d'intégration créent leur **propre base** dans un conteneur `graine_test` (port 5434, `test/config/.env.test`), puis la suppriment : ils ne touchent jamais à ta base de développement.
- Un test ne lance que sa feature : `npx tsx --test --env-file=./test/config/.env.test --import ./test/config/global-setup.ts --experimental-test-isolation=none src/controllers/cartController.spec.test.ts`.

Les vérifications que Husky refait à chaque commit, à lancer avant d'ouvrir une PR :

```bash
npm --prefix src/api run typecheck
npm --prefix src/front run typecheck
npm --prefix src/front run lint
npm --prefix src/front run build
```

### 3.4 Les emails en développement

En dev, aucun vrai email n'est envoyé : sans `SMTP_HOST`, l'API affiche l'email (destinataire, objet, texte) dans son terminal.

- Tout en Docker : `docker compose --env-file .env.docker logs -f api` depuis `src/` (`Ctrl+C` pour sortir) ;
- En local : directement dans le terminal de l'API.

On ne met pas de `SMTP_*` en dev : les tests enverraient de vrais emails. Les vrais envois ne se font qu'en production (`DEPLOIEMENT.md`).

### 3.5 Après un `git pull`

Regarde ce qui a changé et fais seulement ce qui correspond :

| Ce qui a changé                                         | À faire                                                                                                                                                                    |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| du code seulement                                       | rien : l'API et le front se rechargent tout seuls                                                                                                                          |
| `src/api/package-lock.json` (une dépendance de l'API)   | `npm --prefix src/api ci`, puis, en Docker, depuis `src/` : `docker compose --env-file .env.docker exec api npm ci` et `docker compose --env-file .env.docker restart api` |
| `src/front/package-lock.json` (une dépendance du front) | `npm --prefix src/front ci`, puis, en Docker : `docker compose --env-file .env.docker exec front npm ci` et `docker compose --env-file .env.docker restart front`          |
| `01-schema.sql` ou `02-seed.sql`                        | `npm run db:reset` depuis `src/api/` (⚠️ efface tes données de dev)                                                                                                        |
| un `.env.example`                                       | compare avec ton `.env` et ajoute les nouvelles lignes                                                                                                                     |

> **Pourquoi `npm ci` deux fois en Docker ?** Les conteneurs gardent leurs propres `node_modules` dans un volume Docker. Ni `git pull` ni `up --build` ne les mettent à jour : sans le `npm ci` dans le conteneur, l'API plante au démarrage avec `Cannot find package '…'`.

Pour voir ce qui a changé dans le dernier `git pull` :

```bash
git diff --stat HEAD@{1} HEAD
```

---

## Dépannage

### `The "…" variable is not set` / `no port specified`

La commande `docker compose` a été lancée sans `--env-file .env.docker`, ou ailleurs que dans `src/`. Relance-la depuis `src/`, avec `--env-file .env.docker`.

### L'API ne répond plus après un `git pull` : `Cannot find package '…'`

Une dépendance a été ajoutée, mais pas dans le conteneur. Le message est dans `docker compose --env-file .env.docker logs api`. Depuis `src/` :

```bash
docker compose --env-file .env.docker exec api npm ci
docker compose --env-file .env.docker restart api
```

Même chose pour le front, avec `front` à la place de `api`.

### `port is already allocated` / `address already in use`

Un autre programme utilise déjà ce port : Live Share, l'API ou le front de l'autre manière (Docker et local en même temps), ou un ancien conteneur.

- Arrête ce qui tourne en double.
- Sinon, change le port concerné : dans `src/.env.docker` en Docker, dans `src/api/.env` pour l'API locale. Pour le front en local : `npm run dev -- -p 3002`.

> **Live Share** occupe les ports 3000 et 3001 de la machine qui partage la session. En Docker, mets alors `FRONT_HOST_PORT=3002` dans `src/.env.docker` et ouvre `http://localhost:3002`.

### Fichiers au nom de root (`EACCES`, `next: not found`)

Docker a été lancé avant les `npm ci`. Sous macOS, Docker Desktop donne toujours les fichiers à ton utilisateur : les mêmes commandes marchent, sans `sudo`. Depuis `src/` :

```bash
docker compose --env-file .env.docker down
sudo rm -rf api/node_modules front/node_modules front/.next front/next-env.d.ts
docker volume rm src_api-node-modules src_front-node-modules src_front-next
npm --prefix api ci && npm --prefix front ci && mkdir front/.next
docker compose --env-file .env.docker up -d --build
```

Sous WSL, `sudo` est nécessaire parce que ces fichiers appartiennent à `root`. Les données de la base sont conservées.

### Commit refusé : `EACCES: permission denied, mkdir '…/src/front/.next/types'`

Le compose a créé `src/front/.next` sur ta machine, vide et au nom de `root`, pour y monter le cache du front. Le hook `pre-commit` vérifie les types du front et doit écrire dans ce dossier. Depuis la racine du dépôt :

```bash
sudo chown -R $USER:$USER src/front/.next
```

Puis relance ton commit. À faire une seule fois : Docker garde ensuite ce dossier tel quel. Sous macOS, ce problème n'arrive pas.

### `npm install` refusé : `EACCES: permission denied, mkdir '…/node_modules/…'`

Même cause : Docker a créé `src/api/node_modules` ou `src/front/node_modules` sur ta machine, vides et au nom de `root`, pour y monter les volumes des conteneurs. Ça arrive quand ces dossiers n'existaient pas au premier `docker compose up` (nouveau clone, ou `node_modules` supprimé). Depuis la racine du dépôt :

```bash
sudo chown -R $USER:$USER src/api/node_modules src/front/node_modules src/front/.next
```

Puis relance ton installation (`npm --prefix src/front ci`, `npm --prefix src/api ci`). Les conteneurs ne sont pas touchés : ils utilisent leurs propres volumes.

### En local, `/api` à travers le front ne répond pas

- Vérifie que `src/front/.env.local` existe et contient le bon port de l'API (celui du `PORT` de `src/api/.env`).
- Relance le `npm run dev` du front : le relais est calculé au démarrage.

### En local, l'API ne se connecte pas à la base

- Vérifie que la base tourne : `npm run db:up` depuis `src/api/`.
- Dans `src/api/.env`, l'adresse doit être `localhost:5433`, pas `db:5432`.
- Le mot de passe doit être le même que dans `src/.env.docker`.

### `password authentication failed`

- Vérifie que le mot de passe est le même partout : `POSTGRES_PASSWORD` et `DATABASE_URL` dans `src/.env.docker`, plus `DATABASE_URL` dans `src/api/.env` en local.
- Si tu as changé le mot de passe **après** le premier lancement, l'ancien est resté dans la base. Il faut la recréer : voir la section suivante.

### Tout recréer de zéro

⚠️ Cette commande **efface les données de la base** :

```bash
docker compose --env-file .env.docker down -v
docker compose --env-file .env.docker up -d --build
```

La base est recréée avec le schéma et les données de test.
