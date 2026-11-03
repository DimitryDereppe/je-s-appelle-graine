# Déploiement — Je s'appelle Graine

Mise en production sur le VPS Kourou fourni par O'Clock (carte #31).

**État au 30/10/2026 :** en ligne en HTTPS sur <https://dimitrydereppe-server.eddi.cloud>, branche
`main`. Le site se met à jour tout seul à chaque démarrage de la VM, et le certificat se renouvelle
tout seul (section 6).

Procédure détaillée, avec le dépannage, sur le wiki (connexion requise) :
[Déployer sur un VPS Kourou, pas à pas](https://owikiclock.duckdns.org/books/follow-pas-a-pas/page/deployer-sur-un-vps-kourou-pas-a-pas).

Dans les commandes, remplace `PSEUDO-server.eddi.cloud` par le nom de ta VM : celui de ta commande
SSH, et non celui qu'affiche `hostname`.

---

## 1. Architecture

```text
Internet ──HTTPS:443 / HTTP:80──▶ nginx ── /api/… et /images/trees/… ──▶ api:4000   (Express) ──▶ db:5432 (PostgreSQL)
                                    │  └── tout le reste ──────────────▶ front:3000 (Next.js)
                                    └── /.well-known/acme-challenge/ (vérification Let's Encrypt)
```

- **4 conteneurs** Docker Compose : `db`, `api`, `front`, `nginx`. Plus `certbot`, lancé seulement
  quand on en a besoin.
- **Seul Nginx est ouvert sur Internet** (ports 80 et 443). La base, l'API et le front ne sont
  joignables que par le réseau Docker.
- **Un seul nom de domaine** : le navigateur appelle `/api/…` à la même adresse que les pages. Donc
  pas de CORS, et les futurs cookies de connexion resteront sur un seul domaine.
- **HTTPS** : certificat Let's Encrypt gratuit, valable 90 jours, obtenu avec Certbot.

Nginx et Certbot sont dans des conteneurs plutôt qu'installés sur la VM : leur configuration est
dans le dépôt (la même pour toute l'équipe, relue en PR), et une VM neuve se remet en service avec
`git clone` puis `docker compose`.

## 2. Les fichiers de production

Tous sont dans `src/`. Les fichiers de développement ne changent pas.

| Fichier                       | Rôle                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `docker-compose.prod.yml`     | Lance les 4 services ; `name: graine` évite d'écraser le projet de dev (`src`) |
| `api/Dockerfile.prod`         | Compile le TypeScript, ne garde que `dist/` et les dépendances de prod         |
| `front/Dockerfile.prod`       | `next build` en mode `standalone`, puis `node server.js`                       |
| `nginx/default.conf.template` | HTTP → HTTPS ; `/api/` et `/images/trees/` vers l'API ; le reste vers le front |
| `.env.prod.example`           | Modèle du `.env` à remplir sur la VM (le `.env` n'est jamais commité)          |
| `crontab.prod`                | Les 2 tâches automatiques : certificat et mise à jour au démarrage (section 6) |

Le `.gitignore` de `src/` exclut aussi `certbot/` : il contient la clé privée du certificat.

## 3. Premier déploiement

**Avant de commencer :** la VM est démarrée et **rendue publique** sur la page Kourou VM Cloud, et
tu connais le mot de passe de la VM (demandé par `sudo`).

### 3.1 Préparer la VM et la clé SSH

```bash
# 1. Mettre la VM à jour (toujours apt update d'abord)
sudo apt update && sudo apt upgrade -y

# 2. Vérifier Docker : chaque commande doit afficher une version
docker --version && docker compose version
```

**Si Docker n'est pas installé** (`command not found`) :

```bash
sudo apt install -y docker.io docker-compose-v2   # paquets Docker d'Ubuntu (ils suffisent)
sudo usermod -aG docker $USER                     # t'ajoute au groupe docker : docker sans sudo
exit                                              # se déconnecter : le groupe compte à la connexion suivante
ssh student@PSEUDO-server.eddi.cloud              # depuis ton poste : se reconnecter à la VM
docker run hello-world                            # attendu : "Hello from Docker!"
```

Le groupe `docker` sert aussi aux tâches automatiques (section 6) : cron lance `docker` sans `sudo`.

```bash
# 3. Créer la clé SSH de la VM pour GitHub, SANS phrase de passe (-N ""), puis l'afficher
ssh-keygen -t ed25519 -N "" -C "deploy-graine" -f ~/.ssh/deploy_graine
cat ~/.ssh/deploy_graine.pub
```

**Pourquoi sans phrase de passe :** le dépôt est privé, et la VM fait un `git pull` toute seule à
chaque démarrage (section 6). Personne n'est là pour taper une phrase de passe : avec une, GitHub
répond `Permission denied (publickey)`. Ne jamais écrire de mot de passe dans le dépôt à la place.

**Déclarer la clé sur GitHub** (la ligne `ssh-ed25519 …` affichée par `cat`) :

- **de préférence**, en _Deploy key_ : dépôt → _Settings_ → _Deploy keys_ → _Add deploy key_, titre =
  nom de la VM, **sans** cocher _Allow write access_. La clé ne peut alors que **lire** ce dépôt.
  Seul un **admin** du dépôt (l'équipe O'Clock) peut le faire : lui envoyer la ligne. C'est la
  partie publique, elle peut circuler ;
- **sinon**, dans ton compte : ta photo → _Settings_ → _SSH and GPG keys_ → _New SSH key_. Pas
  besoin d'admin, mais la clé ouvre alors **tout** ton compte : la supprimer de GitHub quand la VM
  ne sert plus.

### 3.2 Installer le site

```bash
# 4. Récupérer le code avec cette clé
#    (-c : Git enregistre dans ce dépôt qu'il doit toujours utiliser cette clé)
#    À la première connexion, SSH demande "continue connecting (yes/no)?" : répondre yes
cd ~
git clone -c core.sshCommand="ssh -i ~/.ssh/deploy_graine -o IdentitiesOnly=yes" \
  git@github.com:O-clock-Kyoto/apo-jesappellegraine.git
cd apo-jesappellegraine/src

# 5. Remplir le .env
cp .env.prod.example .env
openssl rand -hex 32          # génère un mot de passe sans / + @ (ils casseraient DATABASE_URL)
nano .env                     # enregistrer : Ctrl+O, Entrée ; quitter : Ctrl+X
chmod 600 .env                # lisible par toi seul

# 6. Lancer la base, l'API et le front
docker compose -f docker-compose.prod.yml up -d --build db api front

# 7. Obtenir le certificat : un essai sur le serveur de test (--staging), puis le vrai
#    (--force-renewal : remplace le certificat d'essai par le vrai, sans poser de question)
docker compose -f docker-compose.prod.yml run --rm -p 80:80 certbot certonly --standalone \
  --staging -d PSEUDO-server.eddi.cloud --email ton.email@exemple.fr --agree-tos --no-eff-email
docker compose -f docker-compose.prod.yml run --rm -p 80:80 certbot certonly --standalone \
  --force-renewal -d PSEUDO-server.eddi.cloud --email ton.email@exemple.fr --agree-tos --no-eff-email

# 8. Démarrer Nginx
docker compose -f docker-compose.prod.yml up -d nginx

# 9. Installer les tâches automatiques : voir la section 6
```

Dans le `.env` :

- même mot de passe dans `POSTGRES_PASSWORD` et dans `DATABASE_URL` ;
- `DOMAINE` s'écrit **sans** `https://` (`PSEUDO-server.eddi.cloud`) ;
- `SITE_URL` s'écrit **avec** (`https://PSEUDO-server.eddi.cloud`) ;
- `JWT_SECRET` : la clé qui signe les jetons de connexion, générée avec `openssl rand -hex 32`. Laissée vide, l'API refuse de démarrer.

**Pourquoi `--standalone` au premier certificat :** Nginx ne peut pas démarrer sans certificat, car
sa configuration HTTPS pointe dessus. Certbot lance donc son propre petit serveur sur le port 80,
avant Nginx. Pour les renouvellements, Nginx tourne déjà : on passe en `--webroot` (section 6).

**Dépôt déjà cloné avec une autre clé ?** Enregistrer la nouvelle clé dans le dépôt existant :

```bash
cd ~/apo-jesappellegraine
git config core.sshCommand "ssh -i ~/.ssh/deploy_graine -o IdentitiesOnly=yes"
git fetch origin main         # attendu : "main -> FETCH_HEAD", sans "Permission denied"
```

## 4. Vérifier

**Depuis ton poste :**

```bash
curl -s -o /dev/null -w "%{http_code} → %{redirect_url}\n" http://PSEUDO-server.eddi.cloud/
curl -s -o /dev/null -w "%{http_code}\n" https://PSEUDO-server.eddi.cloud/
curl -s https://PSEUDO-server.eddi.cloud/api/health
curl -s https://PSEUDO-server.eddi.cloud/api/trees/featured
```

Attendu, ligne par ligne :

1. `301 → https://…/` : le HTTP est renvoyé vers HTTPS.
2. `200` : la page d'accueil répond, et le certificat est reconnu.
3. `{"message":"je s'appelle Graine"}` : l'API répond.
4. Les arbres mis en avant, en JSON : l'API lit bien la base.

**Sur la VM**, depuis `~/apo-jesappellegraine/src` :

| Commande                                                                     | Attendu                                     |
| ---------------------------------------------------------------------------- | ------------------------------------------- |
| `docker compose -f docker-compose.prod.yml ps`                               | 4 services `Up`, `db` en `(healthy)`        |
| `docker compose -f docker-compose.prod.yml logs --tail 5 api`                | `🚀 Server ready at http://localhost:4000`  |
| `docker compose -f docker-compose.prod.yml exec nginx nginx -t`              | `syntax is ok`, `test is successful`        |
| `docker compose -f docker-compose.prod.yml run --rm -T certbot certificates` | `Expiry Date` : date de fin du certificat   |
| `ss -tln`                                                                    | sur `0.0.0.0`, seulement 22, 80 et 443      |
| `ls -l .env`                                                                 | `-rw-------`                                |
| `df -h /`                                                                    | assez de place ; sinon `docker image prune` |

## 5. Mettre à jour le site

**C'est automatique à chaque démarrage de la VM** (section 6). Pour mettre en ligne sans
redémarrer, sur la VM :

```bash
cd ~/apo-jesappellegraine/src
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml restart nginx
```

- Seules les images modifiées sont reconstruites. La base garde ses données (volume `db-data`).
- **`restart nginx`, et pas `nginx -s reload`.** Nginx ne fabrique sa configuration à partir du
  template (en y remplaçant `${DOMAINE}`) qu'au **démarrage** du conteneur. Un `reload` relit
  l'ancienne configuration : une règle ajoutée au template serait ignorée.
- Un `502` ou un `500` pendant quelques secondes est normal : les conteneurs redémarrent.
- **Jamais** de `docker compose down -v` en production : `-v` efface la base. Les scripts SQL ne
  sont joués qu'au tout premier démarrage.

## 6. Tâches automatiques (cron)

**cron** est le service Linux qui lance des commandes tout seul : à heure fixe, ou au démarrage de
la machine. Nos deux lignes sont dans [src/crontab.prod](src/crontab.prod) :

| Quand                             | Ce qui est fait                                                                  | Résultat dans                     |
| --------------------------------- | -------------------------------------------------------------------------------- | --------------------------------- |
| Toutes les heures, à la minute 17 | Renouvelle le certificat s'il expire dans moins de 30 jours, puis recharge Nginx | `~/renouvellement-certificat.log` |
| À chaque démarrage de la VM       | Section 5 : `git pull` de `main`, reconstruction, relance                        | `~/mise-a-jour.log`               |

**Pourquoi toutes les heures :** la VM s'éteint automatiquement chaque jour, et cron ne rattrape pas
un passage manqué. À heure fixe (ex. 3h00), la ligne tomberait VM éteinte. Ça ne coûte rien : tant
qu'il reste plus de 30 jours, Certbot ne fait rien (`Certificate not yet due for renewal`). La
minute 17 plutôt que l'heure pile : Let's Encrypt demande d'éviter les heures rondes.

**Pourquoi `--webroot` pour renouveler :** le mode `--standalone` du premier certificat a besoin du
port 80, que Nginx occupe. Avec `--webroot`, Certbot dépose un fichier de preuve dans
`certbot/www`, et c'est Nginx qui le montre à Let's Encrypt sur `/.well-known/acme-challenge/`.

**Installer** (une seule fois, après la section 3) :

```bash
cd ~/apo-jesappellegraine/src

# 1. Essai à blanc du renouvellement (serveur de test : le vrai certificat n'est pas touché)
docker compose -f docker-compose.prod.yml run --rm -T certbot renew --webroot -w /var/www/certbot --dry-run
#    attendu : "Congratulations, all simulated renewals succeeded"

# 2. Installer les deux lignes
crontab -l                    # doit répondre "no crontab" : l'étape suivante REMPLACE la crontab
crontab crontab.prod
crontab -l                    # affiche le contenu de crontab.prod

# 3. Tester la mise à jour au démarrage
sudo reboot
#    attendre 2 à 3 minutes, rendre la VM publique si besoin, se reconnecter, puis :
tail -20 ~/mise-a-jour.log    # attendu : la date, "Already up to date." (ou la liste des
                              # fichiers mis à jour), puis les conteneurs "Started"
```

**Lire les lignes de `crontab.prod`** :

- `17 * * * *` : minute 17, toutes les heures, tous les jours (`*` = n'importe laquelle).
  `@reboot` : au démarrage de la VM.
- `&&` : la commande suivante ne s'exécute que si la précédente a réussi.
- `{ … ; } >> fichier.log 2>&1` : la sortie **et** les erreurs (`2>&1`) de toutes les commandes
  entre accolades sont ajoutées au log. `date` en tête de chaque passage le date.
- `-T` : sous cron, il n'y a pas de terminal ; sans `-T`, Docker Compose peut refuser de se lancer.
- `sleep 60` : au démarrage, laisse au réseau et à Docker le temps d'être prêts.
- `git pull --ff-only` : avance seulement si la VM n'a pas de commits à elle ; sinon s'arrête au
  lieu de fusionner.

Si `crontab.prod` change dans le dépôt, refaire `crontab crontab.prod` : cron ne relit pas le
fichier tout seul.

## 7. Pièges rencontrés

| Symptôme                                                    | Cause                                                    | Solution                                                  |
| ----------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------- |
| `apt install` : série de `404 Not Found`                    | Liste des paquets pas à jour                             | `sudo apt update` d'abord                                 |
| `apt install npm` : centaines de paquets                    | Node est inutile sur la VM                               | Annuler : Node est dans les images                        |
| `docker` : `permission denied` … `docker.sock`              | Groupe `docker` pas encore pris en compte                | `exit`, puis se reconnecter en SSH                        |
| `git clone` ou `git pull` : `Permission denied (publickey)` | Clé absente de GitHub, ou avec phrase de passe sous cron | Section 3.1                                               |
| `no configuration file provided`                            | Commande lancée hors de `src/`                           | `cd ~/apo-jesappellegraine/src`                           |
| `env file …/src/.env not found`                             | Pas de `.env` dans `src/`                                | `cp .env.prod.example .env`                               |
| Certbot : `Timeout during connect`                          | VM pas rendue publique (après un démarrage)              | La rendre publique sur Kourou VM Cloud, relancer          |
| Certbot : `Service busy; retry later.`                      | Serveur Let's Encrypt surchargé                          | Relancer une ou deux minutes plus tard                    |
| Règle ajoutée au template Nginx sans effet                  | `nginx -s reload` ne relit pas le template               | `docker compose -f docker-compose.prod.yml restart nginx` |
| `502` ou `500` juste après une mise à jour                  | Les conteneurs redémarrent                               | Attendre 30 secondes                                      |
| `mise-a-jour.log` : `Not possible to fast-forward`          | Des commits ont été faits sur la VM                      | `git status` pour les voir ; ne pas coder sur la VM       |
| Une route de l'API en `500`                                 | Erreur dans le code (elle existe aussi en dev)           | La reproduire en dev et la corriger                       |
