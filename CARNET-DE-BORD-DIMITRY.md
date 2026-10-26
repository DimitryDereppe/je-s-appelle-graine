# Carnet de bord — Dimitry (Tech Lead Back)

Suivi de mon travail sur Je s’appelle Graine. Les décisions notées ici ont été prises avec l'équipe sur Discord ; le suivi de l'équipe est dans le [[Apothéose/apo-greenroots/CARNET-DE-BORD-JE-S-APPELLE-GRAINE|carnet de bord Je s’appelle Graine]].

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
- Garder un seul dossier de données : `api/data/` et `api/src/data/` contiennent les mêmes fichiers.
- Installer l'extension VS Code YAML (Red Hat) : elle signale les erreurs de `docker-compose.yml` pendant la frappe.

## 2026-10-23 — Versions communes et scripts SQL

### Travail réalisé

- **Scripts SQL de la base**, préparés pour la session de lundi (étape 4) :
  - `01-schema.sql` : l'extension `unaccent` et les 8 tables, avec leurs contraintes ;
  - `02-seed.sql` : les rôles, les catégories, les disponibilités, 21 arbres (dont un retiré et un épuisé, pour les tests de l'accueil) et le premier compte admin (mot de passe haché en Argon2).
- Les deux scripts ont été testés sur PostgreSQL 18 dans Docker : tables, données, contraintes et suppressions.

### Décisions (prises avec Loïc)

| Outil | Version retenue |
| --- | --- |
| Node.js | **24 LTS** |
| PostgreSQL | **18** |
| pg (client PostgreSQL pour Node.js) | **8.23** |
| TypeScript | **5** |
| Next.js | **16** |

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
