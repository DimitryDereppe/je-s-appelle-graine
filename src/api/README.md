# README

## IMPORTANT : les requêtes SQL doivent être paramétrées ($1)

## Convention de nommage

- les dossiers en `kebab-case`
- les fichiers en `camelCase`

## Scripts base de données

Ils passent tous par Docker Compose : la base PostgreSQL tourne dans le service `db`.

- `npm run db:up` : démarre le conteneur `db` en arrière-plan (`-d`) et attend
  qu'il soit prêt (`--wait`, s'appuie sur le `healthcheck`) avant de rendre la main.
- `npm run db:reset` : remet la base à zéro **sans recréer le conteneur** :
  1. supprime le schéma `public` et tout ce qu'il contient (`DROP SCHEMA ... CASCADE`) ;
  2. le recrée vide (`CREATE SCHEMA public`) ;
  3. rejoue `01-schema.sql` (les tables) puis `02-seed.sql` (les données de test).

  `ON_ERROR_STOP=1` arrête tout à la première erreur SQL ; `client_min_messages TO warning`
  masque les messages « NOTICE » du `CASCADE`. ⚠️ Toutes les données sont effacées.
- `npm run db:seed` : remet les **données de test** à leur état de départ, sans
  toucher à la structure des tables (plus léger que `db:reset`) :
  1. vide toutes les tables (`TRUNCATE ... CASCADE`) et remet leurs compteurs d'id
     à 1 (`RESTART IDENTITY`) : les id cités dans `02-seed.sql` restent justes ;
  2. réinsère `src/data/02-seed.sql`. Le fichier est envoyé depuis ta machine dans
     l'entrée de `psql` (`< src/data/02-seed.sql` côté npm, `-f -` côté psql =
     « lis le SQL sur l'entrée standard ») : pas besoin qu'il soit monté dans le conteneur.

  On peut le relancer autant de fois qu'on veut : jamais de doublons. ⚠️ Les comptes,
  paniers et commandes créés à la main pendant les tests sont effacés.
  Prérequis : les tables existent déjà (`01-schema.sql` a été joué).
- `npm run db:psql` : ouvre une console `psql` interactive dans le conteneur
  (pour tester une requête à la main ; `\q` pour quitter).

Les identifiants viennent des variables `POSTGRES_USER` / `POSTGRES_DB` du conteneur.
C'est pour ça que la commande est entourée de `sh -c '...'` : les `$` sont alors
lus *dans* le conteneur, pas sur ta machine.
