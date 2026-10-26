# Installation — Je s'appelle Graine

Deux façons de lancer le projet :

- **[Chapitre 1 — Docker](#chapitre-1--installation-avec-docker-recommandé)** (recommandé) : la BDD, Adminer et l'API tournent dans Docker.
- **[Chapitre 2 — API en local](#chapitre-2--lancer-lapi-en-local-optionnel)** (optionnel) : la BDD reste dans Docker, l'API tourne sur ta machine.

---

# Chapitre 1 — Installation avec Docker (recommandé)

## Étape 1 — Installer les outils

| Outil | Version attendue |
| - | - |
| Git | récente |
| Docker + Docker Compose | Compose **v2.1 minimum** (`docker compose`, sans tiret) |
| Node.js + npm | **v24.x** |

Selon ton système :

- **Linux** : [Docker Engine + plugin Compose](https://docs.docker.com/engine/install/).
- **Windows** : installer WSL2 (`wsl --install` dans PowerShell en admin), puis **au choix** :
  - [Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/) avec l'intégration WSL activée (*Settings → Resources → WSL integration*) ;
  - ou [Docker Engine directement dans Ubuntu (WSL)](https://docs.docker.com/engine/install/ubuntu/), sans Docker Desktop.

  ⚠️ Lancer toutes les commandes dans le **terminal WSL** et cloner le projet dans `~/...` (pas dans `/mnt/c/...`).
- **macOS** : [Docker Desktop pour Mac](https://docs.docker.com/desktop/setup/install/mac-install/) (version **Apple Silicon** ou **Intel** selon ton Mac), puis **lancer l'application**.

Vérifier :

```bash
git --version            # git version 2.x
docker compose version   # Docker Compose version v2.x.x
node --version           # v24.x.x
```

> Si seul `docker-compose` (avec tiret) fonctionne, c'est Compose v1 : mettre Docker à jour.

## Étape 2 — Cloner le projet

```bash
git clone git@github.com:O-clock-Kyoto/apo-jesappellegraine.git
cd apo-jesappellegraine/src
```

## Étape 3 — Créer le fichier `.env.docker`

```bash
cp .env.docker.example .env.docker
```

Le compléter avec **toutes** ces variables :

```dotenv
# BDD
POSTGRES_USER=graine
POSTGRES_PASSWORD=choisir_un_mot_de_passe
POSTGRES_DB=graine
POSTGRES_PORT=5433

# ADMINER
ADMINER_PORT=8080

# API
NODE_ENV=development
API_PORT=4000
DATABASE_URL=postgres://graine:choisir_un_mot_de_passe@db:5432/graine
```

> ⚠️ Le mot de passe de `DATABASE_URL` doit être le même que `POSTGRES_PASSWORD`.

## Étape 4 — Lancer le projet

Depuis `src/` :

```bash
docker compose --env-file .env.docker up -d --build
```

Le premier lancement prend 30 s à 1 min (création de la BDD et des données de test).

## Étape 5 — Vérifier

```bash
curl http://localhost:4000/api/health
```

Réponse attendue : `ok`.

| Service | Adresse |
| - | - |
| API | <http://localhost:4000/api> |
| Adminer | <http://localhost:8080> — Système `PostgreSQL`, Serveur `db`, identifiants de `.env.docker` |

## Étape 6 — Installer les dépendances pour VS Code

Les dépendances de l'API sont installées **dans le conteneur**, pas sur ta machine. Sans cette étape, l'API fonctionne mais VS Code souligne les imports en rouge (`Cannot find module 'express'`) et l'autocomplétion ne marche pas.

```bash
cd api
npm install
```

> À refaire à chaque fois qu'une dépendance est ajoutée au `package.json`.

✅ **L'environnement de dev est prêt.** Le code modifié dans `src/api/` est rechargé automatiquement.

---

## Au quotidien

Depuis `src/` :

| Commande | Effet |
| - | - |
| `docker compose --env-file .env.docker up -d` | Démarrer le projet |
| `docker compose --env-file .env.docker down` | Arrêter le projet (données conservées) |
| `docker compose --env-file .env.docker logs -f api` | Voir les logs de l'API |

Depuis `src/api/` :

| Commande | Effet |
| - | - |
| `npm run db:seed` | Remettre les données de test à zéro |
| `npm run db:reset` | Recréer les tables + données de test (après une modif de `01-schema.sql`) ⚠️ efface tout |
| `npm run db:psql` | Ouvrir une console SQL (`\q` pour quitter) |

Détails des scripts : [`src/api/README.md`](src/api/README.md).

## Dépannage

| Problème | Solution |
| - | - |
| `Cannot connect to the Docker daemon` | Lancer Docker Desktop (Linux / WSL sans Desktop : `sudo service docker start`) |
| `The "API_PORT" variable is not set` | Vérifier que `.env.docker` contient toutes les variables de l'[étape 3](#étape-3--créer-le-fichier-envdocker) |
| `port is already allocated` | Port déjà utilisé : changer sa valeur dans `.env.docker` |
| Modif des fichiers SQL non prise en compte | `npm run db:reset` |
| Nouvelle dépendance absente du conteneur | Depuis `src/` : `docker compose --env-file .env.docker down`, `docker volume rm src_api-node-modules`, puis `docker compose --env-file .env.docker up -d --build` |

---

# Chapitre 2 — Lancer l'API en local (optionnel)

Utile surtout pour le débogueur de VS Code. **Prérequis : chapitre 1 terminé.**

## Étape 1 — Créer `src/api/.env`

```bash
cd src/api
cp .env.example .env
```

Modifier `DATABASE_URL` : l'API est sur ta machine, donc `localhost:5433` (et non `db:5432`) :

```dotenv
DATABASE_URL=postgres://graine:choisir_un_mot_de_passe@localhost:5433/graine
PORT=4000
```

## Étape 2 — Installer les dépendances

Obligatoire dans ce mode (déjà fait si tu as suivi l'étape 6 du chapitre 1) :

```bash
npm install
```

## Étape 3 — Arrêter l'API Docker et lancer l'API locale

```bash
docker compose -f ../docker-compose.yml --env-file ../.env.docker stop api
npm run dev
```

Vérifier : `curl http://localhost:4000/api/health` → `ok`.

## Revenir à Docker

`Ctrl + C` pour arrêter l'API locale, puis depuis `src/` :

```bash
docker compose --env-file .env.docker up -d
```
