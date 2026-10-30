# Déploiement — Je s'appelle Graine

Résumé de la mise en production sur le VPS Kourou fourni par O'Clock (carte #31).

**État au 29/10/2026 :** le déploiement fonctionne. Le site est en ligne en HTTPS sur
<https://dimitrydereppe-server.eddi.cloud>, avec la branche `feat/deployment` (commit `38729f8`),
depuis fusionnée dans `main` (PR #66) : on déploie désormais `main`.

La procédure détaillée, étape par étape et avec le dépannage, est sur le wiki :
[Déployer sur un VPS Kourou, pas à pas](https://owikiclock.duckdns.org/books/follow-pas-a-pas/page/deployer-sur-un-vps-kourou-pas-a-pas).

---

## 1. Architecture de production

```text
Internet ──HTTPS:443 / HTTP:80──▶ nginx ── /api/…        ──▶ api:4000   (Express) ──▶ db:5432 (PostgreSQL)
                                    │  └── tout le reste ──▶ front:3000 (Next.js)
                                    └── /.well-known/acme-challenge/ (vérification Let's Encrypt)
```

- **4 conteneurs** Docker Compose : `db`, `api`, `front`, `nginx`, plus `certbot`, qu'on lance à la demande.
- **Seul Nginx est ouvert sur Internet** (ports 80 et 443). La base, l'API et le front ne sont
  joignables que par le réseau Docker.
- **Un seul nom de domaine** : le navigateur appelle `/api/…` sur la même adresse que les pages,
  donc pas de CORS, et le cookie du JWT reste sur un seul domaine.
- **HTTPS** : certificat Let's Encrypt gratuit, valable 90 jours, obtenu avec Certbot.

### Décision : Nginx et Certbot dans des conteneurs

Plutôt qu'installés directement sur le VPS, pour quatre raisons :

- leur configuration est dans le dépôt et relue en PR : la même pour toute l'équipe ;
- Nginx joint l'API et le front par leur nom de service (`api`, `front`), sans publier leurs ports ;
- toute la production se teste d'abord sur son poste ;
- un VPS neuf se remet en service avec `git clone` puis `docker compose`.

La contrepartie : quelques commandes Certbot de plus qu'avec un `certbot --nginx` (voir la section 3).

## 2. Les fichiers de production

Tous sont dans `src/`. Les fichiers de développement ne changent pas.

| Fichier                       | Rôle                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| `docker-compose.prod.yml`     | Lance les 4 services ; `name: graine` évite d'écraser le projet de dev (`src`)                |
| `api/Dockerfile.prod`         | Compile le TypeScript, puis ne garde que `dist/` et les dépendances de prod                   |
| `front/Dockerfile.prod`       | `next build` en mode `standalone`, puis `node server.js`                                      |
| `front/next.config.ts`        | `output: "standalone"`                                                                        |
| `nginx/default.conf.template` | HTTP renvoyé vers HTTPS, `/api/` vers l'API, le reste vers le front                           |
| `.env.prod.example`           | Modèle du `.env` à remplir sur le VPS (jamais commité)                                        |
| `.gitignore`                  | `!.env.prod.example` (sinon ignoré avec les `.env*`) et `certbot/` (clé privée du certificat) |

Différences avec le dev : pas de code monté, pas d'Adminer, aucun port publié sauf ceux de Nginx, et
pas besoin de Node sur le VPS (il est dans les images).

## 3. Premier déploiement (résumé)

**Avant de commencer :** la VM est démarrée et rendue publique sur la page Kourou VM Cloud. Il te faut
aussi le mot de passe de la VM (pour `sudo`) et une clé SSH **créée sur la VM** et déclarée sur
GitHub (`ssh-keygen -t ed25519`, puis `cat ~/.ssh/id_ed25519.pub`).

Toutes les commandes se lancent sur la VM, **depuis `~/apo-jesappellegraine/src`** :

```bash
# 1. Mettre la VM à jour (toujours apt update d'abord)
sudo apt update && sudo apt upgrade -y

# 2. Vérifier Docker (les paquets d'Ubuntu suffisent)
docker --version && docker compose version

# 3. Récupérer le code (branche main : feat/deployment y est fusionnée, PR #66)
git clone git@github.com:O-clock-Kyoto/apo-jesappellegraine.git
cd apo-jesappellegraine/src

# 4. Remplir le .env (même mot de passe dans POSTGRES_PASSWORD et DATABASE_URL)
cp .env.prod.example .env
openssl rand -hex 32          # mot de passe sans / + @, qui casseraient DATABASE_URL
nano .env                     # Ctrl+O, Entrée, Ctrl+X
chmod 600 .env

# 5. Lancer la base, l'API et le front
docker compose -f docker-compose.prod.yml up -d --build db api front

# 6. Certificat : un essai d'abord (--staging), puis le vrai
docker compose -f docker-compose.prod.yml run --rm -p 80:80 certbot certonly --standalone \
  --staging -d PSEUDO-server.eddi.cloud --email ton.email@exemple.fr --agree-tos --no-eff-email
docker compose -f docker-compose.prod.yml run --rm -p 80:80 certbot certonly --standalone \
  --force-renewal -d PSEUDO-server.eddi.cloud --email ton.email@exemple.fr --agree-tos --no-eff-email

# 7. Démarrer Nginx
docker compose -f docker-compose.prod.yml up -d nginx
```

Dans le `.env` :

- `DOMAINE` s'écrit **sans** `https://` (`PSEUDO-server.eddi.cloud`) ;
- `SITE_URL` s'écrit **avec** (`https://PSEUDO-server.eddi.cloud`).

Utilise le nom en `.eddi.cloud`, celui de la commande SSH, et non celui qu'affiche `hostname`.

## 4. Vérifications

**Depuis ton poste** (résultats relevés le 29/10) :

```bash
curl -s -o /dev/null -w "%{http_code} → %{redirect_url}\n" http://PSEUDO-server.eddi.cloud/api/trees
curl -s -o /dev/null -w "%{http_code}\n" https://PSEUDO-server.eddi.cloud/
curl -s https://PSEUDO-server.eddi.cloud/api/trees/featured
curl -s https://PSEUDO-server.eddi.cloud/api/trees | grep -o '"id":' | wc -l
```

Résultats attendus, ligne par ligne :

1. `301 → https://…/api/trees` : le HTTP est renvoyé vers HTTPS.
2. `200` : la page d'accueil répond, et le certificat est reconnu.
3. Les 3 arbres mis en avant, en JSON.
4. `13` : le catalogue des arbres en vente.

Les ports 3000, 4000, 5432, 5433 et 8080 doivent être **fermés** depuis Internet.

**Sur la VM**, à refaire après chaque déploiement :

| Commande                                                        | Attendu                                                               |
| --------------------------------------------------------------- | --------------------------------------------------------------------- |
| `docker compose -f docker-compose.prod.yml ps`                  | 4 services `Up`, `db` en `(healthy)`                                  |
| `docker compose -f docker-compose.prod.yml logs --tail 5 api`   | `🚀 Server ready at http://localhost:4000`                            |
| `docker compose -f docker-compose.prod.yml logs --tail 5 front` | `- Local: http://localhost:3000`                                      |
| `docker compose -f docker-compose.prod.yml exec nginx nginx -t` | `syntax is ok`, `test is successful`                                  |
| `ss -tln`                                                       | à l'écoute sur `0.0.0.0` : seulement 22, 80 et 443                    |
| `ls -l .env`                                                    | `-rw-------`                                                          |
| `df -h /` et `docker system df`                                 | assez de place ; sinon `docker image prune` et `docker builder prune` |

## 5. Mettre à jour le site

```bash
cd ~/apo-jesappellegraine/src
git pull
docker compose -f docker-compose.prod.yml up -d --build
sleep 10
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

- Seules les images modifiées sont reconstruites, et la base garde ses données (volume `db-data`).
- Un `502` pendant quelques secondes est normal : c'est le temps que le nouveau conteneur démarre.
- Les scripts SQL ne sont joués qu'au **premier** démarrage. **Jamais** de `docker compose down -v`
  en production : `-v` efface la base.

## 6. Pièges rencontrés

| Symptôme                                      | Cause                                             | Solution                                                     |
| --------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| `git clone` : `Permission denied (publickey)` | Pas de clé SSH sur la VM                          | La créer **sur la VM**, déclarer la partie `.pub` sur GitHub |
| `apt install` : série de `404 Not Found`      | Liste des paquets pas à jour                      | `sudo apt update` d'abord                                    |
| `apt install npm` : centaines de paquets      | Node est inutile sur la VM                        | Annuler : Node est dans les images                           |
| `cp: cannot stat '.env.prod.example'`         | Commande lancée hors de `src/`                    | `cd src` ; `ls -a` montre les fichiers cachés                |
| `no configuration file provided`              | Commande lancée hors de `src/`                    | `cd ~/apo-jesappellegraine/src`                              |
| `env file …/src/.env not found`               | Pas de `.env` dans `src/`                         | `cp .env.prod.example .env`                                  |
| Certbot : `Service busy; retry later.`        | Serveur Let's Encrypt surchargé                   | Relancer une ou deux minutes plus tard                       |
| `sudo` demande un mot de passe                | Les fichiers de `certbot/` appartiennent à `root` | Le mot de passe de la VM                                     |
| `/api/trees` en `500`                         | Erreur SQL dans le code, aussi en dev             | Rejouer en dev, corriger le datamapper                       |
| `/api/health` : `Cannot GET` (404)            | Route en commentaire                              | Tester `/api/trees/featured`                                 |
