# Mettre à jour la base de la VM après une modification du schéma ou du seed

À faire **chaque fois qu'une PR fusionnée dans `main` modifie** `src/api/src/data/01-schema.sql` ou
`src/api/src/data/02-seed.sql`.

**Pourquoi ?** PostgreSQL ne joue ces deux scripts **qu'au tout premier démarrage** de la base (volume
`db-data` vide). Ensuite, ni `git pull` ni `docker compose up -d --build` ne touchent à la base :
le cron `@reboot` met le code à jour, mais la base garde son ancienne structure et ses anciennes valeurs.

**Exemple (02/11/2026) :** les valeurs de disponibilité sont passées de `available` à `disponible`
(PR #124). Avec le nouveau code et l'ancienne base, l'API cherche `'disponible'` et ne trouve rien :
l'accueil est vide, et les arbres retirés réapparaissent dans le catalogue.

Pour le reste du déploiement, voir [[Apothéose/je-s-appelle-graine/DEPLOIEMENT|DEPLOIEMENT.md]].

---

## 1. Choisir la méthode

| La base de la VM contient…                                       | Méthode                                          |
| ---------------------------------------------------------------- | ------------------------------------------------ |
| seulement les données du seed (personne n'a rien saisi en ligne) | **A. Recréer la base** (section 2)               |
| des données à garder (comptes créés en ligne, commandes)         | **B. Migration SQL** (section 3), à faire relire |

Dans le doute : faire la sauvegarde (étape 2.2), puis regarder ce qu'il y a dans la base.

---

## 2. Méthode A : recréer la base

Toutes les commandes se lancent **sur la VM**.

### 2.1. Se connecter et récupérer le code

```bash
ssh student@PSEUDO-server.eddi.cloud
cd ~/je-s-appelle-graine/src
git pull origin main
```

Le `git pull` doit passer **avant** de recréer la base : le conteneur `db` lit `01-schema.sql` et
`02-seed.sql` directement dans le dossier du dépôt sur la VM (montés dans
`/docker-entrypoint-initdb.d/`). Sans le pull, on recréerait l'ancienne version.

### 2.2. Sauvegarder la base

```bash
docker compose -f docker-compose.prod.yml exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > ~/sauvegarde-bdd-$(date +%F).sql
```

- `pg_dump` écrit toute la base sous forme de commandes SQL ; `>` les enregistre dans un fichier
  de la VM (`$(date +%F)` ajoute la date du jour au nom).
- En cas de problème, rejouer ce fichier restaure la base.

### 2.3. Recréer les tables et les données

```bash
docker compose -f docker-compose.prod.yml exec -T db sh -c 'psql -q -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DROP SCHEMA public CASCADE" -c "CREATE SCHEMA public" -f /docker-entrypoint-initdb.d/01-schema.sql -f /docker-entrypoint-initdb.d/02-seed.sql'
```

- `DROP SCHEMA public CASCADE` supprime toutes les tables (et ce qui en dépend) ;
  `CREATE SCHEMA public` recrée l'espace vide.
- Les deux `-f` rejouent le schéma puis le seed.
- `-v ON_ERROR_STOP=1` arrête tout à la première erreur.
- Les guillemets simples `'...'` font lire `$POSTGRES_USER` et `$POSTGRES_DB` **dans le conteneur**,
  où ces variables existent.
- C'est la même commande que `npm run db:reset` en local.

> **Pas de `docker compose down -v`** : la base serait aussi recréée, mais tous les services
> s'arrêteraient. La commande ci-dessus ne touche qu'aux tables.

### 2.4. Mettre l'application à jour

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml restart nginx
```

### 2.5. Vérifier

| Commande (sur la VM)                                                                                                                   | Résultat attendu                              |
| -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `docker compose -f docker-compose.prod.yml exec db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT * FROM availability"'` | `disponible`, `en rupture de stock`, `retiré` |
| `curl -s https://PSEUDO-server.eddi.cloud/api/trees/featured`                                                                          | 3 arbres, `id` 20, 19 et 16                   |
| `curl -s https://PSEUDO-server.eddi.cloud/api/trees`                                                                                   | 18 arbres (les 3 retirés n'apparaissent pas)  |

Puis ouvrir le site : 3 arbres sur l'accueil.

> Le seed recrée les 10 comptes de test avec leurs mots de passe d'origine : un mot de passe changé
> en ligne est réinitialisé.

---

## 3. Méthode B : migration SQL (données à garder)

Une **migration** est un script SQL qui fait passer une base existante à la nouvelle structure
**sans perdre ses données**. Le script est rangé dans le dépôt (par exemple
`src/api/src/data/migrations/AAAA-MM-JJ-description.sql`) pour que chacun puisse le jouer sur sa VM.

### 3.1. Règles d'écriture

- **Tout ou rien** : entourer le script de `BEGIN;` … `COMMIT;`. Si une ligne échoue, PostgreSQL
  annule tout : la base n'est jamais à moitié migrée.
- **Pour changer les valeurs autorisées par un `CHECK`**, toujours dans cet ordre :
  1. supprimer l'ancienne contrainte ;
  2. traduire les valeurs (`UPDATE`) ;
  3. recréer la contrainte ;
  4. changer la valeur par défaut si besoin (`ALTER COLUMN … SET DEFAULT …`).

  Exemple :

  ```sql
  ALTER TABLE purchase DROP CONSTRAINT purchase_status_check;
  UPDATE purchase SET status = 'en attente' WHERE status = 'pending';
  ALTER TABLE purchase ADD CONSTRAINT purchase_status_check CHECK (status IN ('en attente', 'payée', 'plantée', 'annulée'));
  ```

- **Cibler une ligne par sa valeur, pas par son `id`** (`WHERE name = 'available'`, pas
  `WHERE id = 1`) : les `id` peuvent différer d'une base à l'autre.
- Le nom d'une contrainte se lit avec `\d nom_de_la_table` dans `psql`.

### 3.2. Tester en local d'abord

Sur une base locale qui a encore l'ancienne structure (avant tout `npm run db:reset`) :

```bash
cd src
docker compose --env-file .env.docker exec -T db sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < api/src/data/migrations/AAAA-MM-JJ-description.sql
```

Le fichier est envoyé à `psql` par `<` (entrée standard) : le conteneur ne voit pas les fichiers de
la machine, donc un `\i chemin` lancé dans `npm run db:psql` ne le trouverait pas.

Vérifier ensuite l'API locale (accueil, catalogue, fiche d'un arbre retiré → 404).

### 3.3. Lancer en production

Sur la VM, **à enchaîner sans attendre** (entre deux, code et base ne sont pas d'accord) :

```bash
cd ~/je-s-appelle-graine/src
git pull origin main
# sauvegarde : même commande qu'en 2.2
docker compose -f docker-compose.prod.yml exec -T db sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < api/src/data/migrations/AAAA-MM-JJ-description.sql
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml restart nginx
```

Puis les vérifications de la section 2.5.

---

## 4. À ne pas oublier

- **Chaque membre de l'équipe a sa VM** : chacun doit faire la mise à jour, sinon son site cassera
  au prochain redémarrage (cron `@reboot`).
- **En local aussi** : `npm run db:reset` (pas `db:seed`, qui ne recrée pas les contraintes).
- **Prévenir l'équipe** dans la PR qui modifie le schéma ou le seed : « base à mettre à jour, voir
  ce guide ».
