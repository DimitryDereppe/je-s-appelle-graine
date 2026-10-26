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
- `npm run db:psql` : ouvre une console `psql` interactive dans le conteneur
  (pour tester une requête à la main ; `\q` pour quitter).

Les identifiants viennent des variables `POSTGRES_USER` / `POSTGRES_DB` du conteneur.
C'est pour ça que la commande est entourée de `sh -c '...'` : les `$` sont alors
lus *dans* le conteneur, pas sur ta machine.
