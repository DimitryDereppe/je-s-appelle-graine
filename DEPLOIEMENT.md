# Déploiement — Je s'appelle Graine

Mise en production sur le VPS Kourou fourni par O'Clock (carte #31).

**Procédure finale (13/11/2026, carte #174).** Site en HTTPS sur
<https://dimitrydereppe-server.eddi.cloud>, branche `main`. Le site se met à jour tout seul à chaque
démarrage de la VM, et le certificat se renouvelle tout seul (section 6).

**Sommaire :** 1. Architecture · 2. Fichiers · 3. Premier déploiement (prérequis, `.env`, pare-feu) · 4. Vérifier · 5. Mettre à jour · 6. Tâches automatiques · 7. Sauvegarder et restaurer la base · 8. Pièges rencontrés

Procédure détaillée, avec le dépannage, sur le wiki (connexion requise) :
[Déployer sur un VPS Kourou, pas à pas](https://owikiclock.duckdns.org/books/follow-pas-a-pas/page/deployer-sur-un-vps-kourou-pas-a-pas).

Dans les commandes, remplace `PSEUDO-server.eddi.cloud` par le nom de ta VM : celui de ta commande
SSH, et non celui qu'affiche `hostname`.

**Depuis le 25/11/2026**, la VM fait tourner le dépôt **public** `DimitryDereppe/je-s-appelle-graine`
(dossier `~/je-s-appelle-graine`), et non plus le dépôt privé de l'équipe
(`O-clock-Kyoto/apo-jesappellegraine`). Le dépôt étant public, la VM le clone en HTTPS, sans clé
SSH. L'ancienne procédure (clé de déploiement) reste dans l'historique Git de ce fichier.

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
  pas de CORS, et le cookie de connexion (jeton JWT) reste sur un seul domaine.
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
| `front/Dockerfile.prod`       | `next build` en mode `standalone` (avec `API_URL`), puis `node server.js`      |
| `nginx/default.conf.template` | HTTP → HTTPS ; `/api/` et `/images/trees/` vers l'API ; le reste vers le front |
| `.env.prod.example`           | Modèle du `.env` à remplir sur la VM (le `.env` n'est jamais commité)          |
| `crontab.prod`                | Les 2 tâches automatiques : certificat et mise à jour au démarrage (section 6) |

Le `.gitignore` de `src/` exclut aussi `certbot/` : il contient la clé privée du certificat.

## 3. Premier déploiement

**Prérequis :**

- la VM (Ubuntu) est démarrée et **rendue publique** sur la page Kourou VM Cloud. Son nom
  (`PSEUDO-server.eddi.cloud`) pointe déjà vers elle : pas de nom de domaine à acheter ni de DNS à
  régler ;
- tu te connectes en SSH (`ssh student@PSEUDO-server.eddi.cloud`) et tu connais le mot de passe de
  la VM (demandé par `sudo`) ;
- Docker et Docker Compose (étape 2) ; Git (présent sur Ubuntu). **Ni Node, ni Nginx, ni
  PostgreSQL à installer sur la VM** : ils sont dans les images Docker ;
- environ 5 Go libres (`df -h /`) pour les images ;
- les secrets à portée de main : mot de passe d'application Gmail, IBAN et adresse d'envoi des
  chèques (rangés avec les accès de l'équipe, jamais dans le dépôt).

### 3.1 Préparer la VM

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

**Pas de clé SSH à créer :** le dépôt est public, la VM le lit en HTTPS. Le `git pull` automatique
de chaque démarrage (section 6) n'a donc besoin d'aucun mot de passe ni d'aucune clé.

### 3.2 Installer le site

```bash
# 3-4. Récupérer le code (HTTPS : dépôt public, rien à configurer)
cd ~
git clone https://github.com/DimitryDereppe/je-s-appelle-graine.git
cd je-s-appelle-graine/src

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

# 9. Pare-feu : section 3.3 ; tâches automatiques : section 6
```

Dans le `.env` :

- même mot de passe dans `POSTGRES_PASSWORD` et dans `DATABASE_URL` ;
- `DOMAINE` s'écrit **sans** `https://` (`PSEUDO-server.eddi.cloud`) ;
- `SITE_URL` s'écrit **avec** (`https://PSEUDO-server.eddi.cloud`) ;
- `JWT_SECRET` : la clé qui signe les jetons de connexion, générée avec `openssl rand -hex 32`. Laissée vide, l'API refuse de démarrer.
- `ALLOWED_ORIGINS` : l'adresse du site **avec** `https://` (la même que `SITE_URL`) ; seul ce site peut appeler l'API depuis un navigateur (CORS).
- `SMTP_*` : l'envoi des emails aux clients (confirmation de commande, paiement reçu, annulation, plantation) par le compte Gmail de l'équipe. Seul `SMTP_PASSWORD` est à remplir : le **mot de passe d'application** (16 lettres à la suite, sans espaces), rangé avec les accès de l'équipe.
- `PAYMENT_*` : les instructions de paiement affichées après une commande et dans l'email de
  confirmation. Virement : `PAYMENT_IBAN`, `PAYMENT_BIC`, `PAYMENT_HOLDER` (titulaire du compte).
  Chèque : `PAYMENT_CHECK_PAYABLE_TO` (ordre) et `PAYMENT_CHECK_ADDRESS` (adresse d'envoi). En
  production, l'API refuse de démarrer si `PAYMENT_IBAN`, `PAYMENT_BIC` ou `PAYMENT_CHECK_ADDRESS`
  est vide : les valeurs par défaut de `src/api/config.ts` (`FR76 0000…`) sont fictives et ne
  servent qu'en développement et en test. `PAYMENT_HOLDER` et `PAYMENT_CHECK_PAYABLE_TO` valent
  « Je s'appelle Graine » s'ils sont vides.

**Variables à ne pas oublier** (sans elles, le site démarre mais une partie ne marche pas) :

| Variable                                               | Si elle est vide ou fausse                                                                               |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `JWT_SECRET`                                           | l'API refuse de démarrer                                                                                 |
| `ALLOWED_ORIGINS`                                      | rien de visible ici (un seul domaine), mais un autre site appelant l'API serait bloqué par le navigateur |
| `DATABASE_URL`                                         | l'API ne joint pas la base : routes en `500`                                                             |
| `SMTP_PASSWORD`                                        | aucun email envoyé (`Invalid login` dans les logs de l'API)                                              |
| `PAYMENT_IBAN`, `PAYMENT_BIC`, `PAYMENT_CHECK_ADDRESS` | l'API refuse de démarrer                                                                                 |

Après **toute** modification du `.env` : `docker compose -f docker-compose.prod.yml up -d` (le
conteneur est recréé et relit le `.env`). Un `restart` garde les anciennes valeurs.
Si l'API a été recréée mais pas Nginx, Nginx garde l'ancienne adresse du conteneur et l'API répond `502` : lancer aussi `docker compose -f docker-compose.prod.yml restart nginx`.

**Pourquoi `--standalone` au premier certificat :** Nginx ne peut pas démarrer sans certificat, car
sa configuration HTTPS pointe dessus. Certbot lance donc son propre petit serveur sur le port 80,
avant Nginx. Pour les renouvellements, Nginx tourne déjà : on passe en `--webroot` (section 6).

### 3.3 Pare-feu

**Ce qui protège déjà :** dans `docker-compose.prod.yml`, seul `nginx` a une ligne `ports:` (80 et
443). `db`, `api` et `front` n'en ont pas : ils ne sont joignables que par le réseau Docker, jamais
depuis Internet. Le contrôle `ss -tln` de la section 4 le vérifie.

**En plus, le pare-feu de la VM (`ufw`)** ferme tout ce qui n'est pas explicitement ouvert, au cas
où un service s'ajouterait un jour par erreur :

```bash
sudo ufw allow OpenSSH        # D'ABORD le port 22 : sinon ta connexion SSH est coupée à l'activation
sudo ufw allow 80/tcp         # HTTP (redirection vers HTTPS, et Let's Encrypt)
sudo ufw allow 443/tcp        # HTTPS
sudo ufw enable               # "Command may disrupt existing ssh connections" : répondre y
sudo ufw status               # attendu : "Status: active", OpenSSH, 80/tcp et 443/tcp en ALLOW (+ v6)
```

`Firewall is active and enabled on system startup` : le pare-feu reste actif après un redémarrage.
**Avant de fermer ta session**, ouvrir un second terminal et refaire `ssh` : s'il se connecte, le
port 22 est bien ouvert.

Testé le 13/11/2026 sur la VM de Dimitry : SSH, HTTP (`301`) et HTTPS (`200`) répondent toujours.

**Attention, Docker passe devant `ufw`** : un port publié par `ports:` dans le compose est ouvert
sur Internet même si `ufw` ne l'autorise pas (Docker écrit ses propres règles). La vraie protection
de la base reste donc **l'absence de `ports:` sur `db`** : ne jamais en ajouter en production.

Si la connexion SSH est coupée par erreur, `ufw` bloque aussi ta reconnexion : d'où la
première ligne, à ne jamais sauter.

## 4. Vérifier

**Depuis ton poste :**

```bash
curl -s -o /dev/null -w "%{http_code} → %{redirect_url}\n" http://PSEUDO-server.eddi.cloud/
curl -s -o /dev/null -w "%{http_code}\n" https://PSEUDO-server.eddi.cloud/
curl -s https://PSEUDO-server.eddi.cloud/api/health
curl -s https://PSEUDO-server.eddi.cloud/api/trees/featured
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" "https://PSEUDO-server.eddi.cloud/_next/image?url=%2Fimages%2Ftrees%2Fpin-maritime.webp&w=640&q=75"
```

Attendu, ligne par ligne :

1. `301 → https://…/` : le HTTP est renvoyé vers HTTPS.
2. `200` : la page d'accueil répond, et le certificat est reconnu.
3. `{"message":"je s'appelle Graine"}` : l'API répond.
4. Les arbres mis en avant, en JSON : l'API lit bien la base.
5. `200 image/jpeg` : le front (composant `<Image>`) récupère bien les photos des arbres auprès de
   l'API. (Next.js choisit le format selon ce qu'accepte le client : `curl` reçoit du JPEG, un
   navigateur du WebP ; l'important est le `200`.)

**Sur la VM**, depuis `~/je-s-appelle-graine/src` :

| Commande                                                                     | Attendu                                     |
| ---------------------------------------------------------------------------- | ------------------------------------------- |
| `docker compose -f docker-compose.prod.yml ps`                               | 4 services `Up`, `db` en `(healthy)`        |
| `docker compose -f docker-compose.prod.yml logs --tail 5 api`                | `🚀 Server ready at http://localhost:4000`  |
| `docker compose -f docker-compose.prod.yml exec nginx nginx -t`              | `syntax is ok`, `test is successful`        |
| `docker compose -f docker-compose.prod.yml run --rm -T certbot certificates` | `Expiry Date` : date de fin du certificat   |
| `ss -tln`                                                                    | sur `0.0.0.0`, seulement 22, 80 et 443      |
| `sudo ufw status`                                                            | `active`, 22, 80 et 443 en `ALLOW`          |
| `ls -l .env`                                                                 | `-rw-------`                                |
| `df -h /`                                                                    | assez de place ; sinon `docker image prune` |
| `docker compose -f docker-compose.prod.yml exec api printenv SMTP_HOST`      | `smtp.gmail.com`                            |

**Les emails :** passer une commande sur le site avec un compte à sa vraie adresse : l'email
« Commande n° X confirmée » arrive (regarder aussi dans les spams : le compte Gmail est récent).

## 5. Mettre à jour le site

**C'est automatique à chaque démarrage de la VM** (section 6). Pour mettre en ligne sans
redémarrer, sur la VM :

```bash
cd ~/je-s-appelle-graine/src
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
- **Si la mise à jour change le schéma ou le seed** (`api/src/data/01-schema.sql`,
  `02-seed.sql`) : `git pull` ne suffit pas, la base de la VM garde l'ancienne structure. Suivre
  [[MISE-A-JOUR-BDD-VM|MISE-A-JOUR-BDD-VM.md]] (sauvegarde d'abord, section 7).
- **Si la mise à jour ajoute une variable** dans `.env.prod.example` : l'ajouter aussi au `.env`
  de la VM (`git pull` ne le touche pas), puis `up -d`.

**Livrer une version** : fusionner `DEV` dans `main` par une PR relue, puis mettre à jour la VM
(redémarrage, ou les commandes ci-dessus), puis refaire les vérifications de la section 4.

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
cd ~/je-s-appelle-graine/src

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

## 7. Sauvegarder et restaurer la base

La base vit dans le volume Docker `db-data` : elle survit aux mises à jour et aux redémarrages,
mais pas à un `down -v`, à une erreur de migration ou à la perte de la VM. D'où une sauvegarde
**avant chaque changement de schéma**, et avant la démo.

**Sauvegarder** (sur la VM, depuis `~/je-s-appelle-graine/src`) :

```bash
docker compose -f docker-compose.prod.yml exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > ~/sauvegarde-bdd-$(date +%F).sql
chmod 600 ~/sauvegarde-bdd-*.sql   # lisible par toi seul : emails et mots de passe hachés des clients
ls -lh ~/sauvegarde-bdd-*.sql      # -rw------- et pas 0 octet
```

- `pg_dump` écrit toute la base (tables et données) sous forme de commandes SQL.
- `exec -T` : lance la commande dans le conteneur `db`, sans terminal, pour que `>` puisse
  récupérer la sortie dans un fichier **de la VM**.
- `sh -c '…'` avec des apostrophes : `$POSTGRES_USER` et `$POSTGRES_DB` sont lus **dans** le
  conteneur (qui les connaît par le `.env`), pas sur la VM.

**Garder une copie hors de la VM** (depuis ton poste) : si la VM est perdue, la sauvegarde l'est
aussi.

```bash
scp student@PSEUDO-server.eddi.cloud:~/sauvegarde-bdd-AAAA-MM-JJ.sql .
```

**Restaurer** : on repart d'une base **vide**, sinon le fichier essaie de recréer des tables qui
existent déjà et s'arrête en erreur.

```bash
cd ~/je-s-appelle-graine/src
docker compose -f docker-compose.prod.yml stop api                      # plus personne n'écrit dans la base
docker compose -f docker-compose.prod.yml exec -T db sh -c \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"'
docker compose -f docker-compose.prod.yml exec -T db sh -c \
  'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < ~/sauvegarde-bdd-AAAA-MM-JJ.sql
docker compose -f docker-compose.prod.yml start api
```

- `DROP SCHEMA public CASCADE` vide la base (toutes les tables) sans supprimer le volume.
- `<` fait l'inverse de `>` : le fichier est envoyé à `psql`, qui rejoue les commandes SQL.
- `ON_ERROR_STOP=1` : `psql` s'arrête à la première erreur au lieu de continuer à moitié.
- Vérifier ensuite avec la section 4 (`/api/trees/featured`, se connecter, voir ses commandes).

**Tester une sauvegarde sans toucher à la base du site** : la restaurer dans une base à part,
`restore_test`, créée dans le même conteneur, comparer, puis la supprimer. Une sauvegarde jamais
restaurée n'est pas une sauvegarde vérifiée.

```bash
docker compose -f docker-compose.prod.yml exec -T db sh -c 'createdb -U "$POSTGRES_USER" restore_test'
docker compose -f docker-compose.prod.yml exec -T db sh -c \
  'psql -q -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d restore_test' < ~/sauvegarde-bdd-AAAA-MM-JJ.sql
docker compose -f docker-compose.prod.yml exec -T db sh -c \
  'psql -tA -U "$POSTGRES_USER" -d restore_test -c "SELECT count(*) FROM tree"'   # = nombre d'arbres du site
docker compose -f docker-compose.prod.yml exec -T db sh -c 'dropdb -U "$POSTGRES_USER" restore_test'
```

Testé le 13/11/2026 sur la VM de Dimitry : sauvegarde de 21 Ko, restauration sans erreur, mêmes
nombres d'arbres (21), de catégories (3) et d'utilisateurs que la base du site.

## 8. Pièges rencontrés

| Symptôme                                                                                          | Cause                                                                                                                                | Solution                                                                                                         |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `apt install` : série de `404 Not Found`                                                          | Liste des paquets pas à jour                                                                                                         | `sudo apt update` d'abord                                                                                        |
| `apt install npm` : centaines de paquets                                                          | Node est inutile sur la VM                                                                                                           | Annuler : Node est dans les images                                                                               |
| `docker` : `permission denied` … `docker.sock`                                                    | Groupe `docker` pas encore pris en compte                                                                                            | `exit`, puis se reconnecter en SSH                                                                               |
| `no configuration file provided`                                                                  | Commande lancée hors de `src/`                                                                                                       | `cd ~/je-s-appelle-graine/src`                                                                                   |
| `env file …/src/.env not found`                                                                   | Pas de `.env` dans `src/`                                                                                                            | `cp .env.prod.example .env`                                                                                      |
| Certbot : `Timeout during connect`                                                                | VM pas rendue publique (après un démarrage)                                                                                          | La rendre publique sur Kourou VM Cloud, relancer                                                                 |
| Certbot : `Service busy; retry later.`                                                            | Serveur Let's Encrypt surchargé                                                                                                      | Relancer une ou deux minutes plus tard                                                                           |
| Règle ajoutée au template Nginx sans effet                                                        | `nginx -s reload` ne relit pas le template                                                                                           | `docker compose -f docker-compose.prod.yml restart nginx`                                                        |
| `502` qui dure après `up -d` (l'API est « Server ready »)                                         | Nginx garde l'adresse de l'ancien conteneur `api`                                                                                    | `docker compose -f docker-compose.prod.yml restart nginx`                                                        |
| `502` ou `500` juste après une mise à jour                                                        | Les conteneurs redémarrent                                                                                                           | Attendre 30 secondes                                                                                             |
| `mise-a-jour.log` : `Not possible to fast-forward`                                                | Des commits ont été faits sur la VM                                                                                                  | `git status` pour les voir ; ne pas coder sur la VM                                                              |
| Photos des arbres absentes ; `/_next/image?url=…` en `500` (`internal response is invalid`)       | `API_URL` absent pendant `next build` : les `rewrites` de `next.config.ts` sont figés au build, `env_file` ne compte qu'au démarrage | `ARG API_URL` / `ENV API_URL` avant `npm run build` dans `front/Dockerfile.prod`, puis `up -d --build front`     |
| Email non reçu ; logs de l'API : `Email non envoyé (SMTP_HOST absent)`                            | `SMTP_HOST` vide, ou `.env` modifié sans recréer le conteneur                                                                        | Remplir le `.env`, puis `docker compose -f docker-compose.prod.yml up -d api` (`restart` ne relit pas le `.env`) |
| Email non reçu ; logs de l'API : `Email de confirmation non envoyé` avec `Invalid login` ou `535` | Mauvais mot de passe : celui du compte au lieu du mot de passe d'application, ou espaces                                             | Recopier les 16 lettres à la suite dans `SMTP_PASSWORD`, puis `up -d api`                                        |
| Email reçu dans les spams                                                                         | Compte Gmail récent, sans réputation                                                                                                 | « Ce n'est pas du spam » et ajouter l'adresse aux contacts ; avant la démo, s'envoyer une ou deux commandes      |
| `ufw enable` : connexion SSH coupée                                                               | Port 22 pas autorisé avant l'activation                                                                                              | Toujours `sudo ufw allow OpenSSH` avant `ufw enable`                                                             |
| Restauration : `relation … already exists`                                                        | Base pas vidée avant de rejouer la sauvegarde                                                                                        | Section 7 : `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`, puis relancer                                   |
| Une route de l'API en `500`                                                                       | Erreur dans le code (elle existe aussi en dev)                                                                                       | La reproduire en dev et la corriger                                                                              |
