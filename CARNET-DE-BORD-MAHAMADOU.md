# Carnet de bord — Mahamadou

Suivi de mon travail sur Je s’appelle Graine. Le suivi de l'équipe est dans le [carnet de bord Je s’appelle Graine](CARNET-DE-BORD-JE-S-APPELLE-GRAINE.md).

## 2026-10-30 — Présentation du sprint 1

### Travail réalisé

- **Présentation du sprint 1** (#38) avec Fabrice : le projet, l'organisation, l'initialisation, puis la feature F1 :
  - présentation du back de l'accueil ;
  - démo de l'accueil en ligne.

### Décisions

- La présentation ne montre que l'accueil.

## 2026-10-29 — Gestion des erreurs de l'API

### Travail réalisé

- **Gestion des erreurs de l'API** (#20) avec Fabrice, sur la branche `feat/error-handling` (PR #67 vers `back`, puis PR #68 de `back` vers `main`) :
  - création du `globalErrorHandler` : une erreur prévue renvoie son statut et son message, une erreur imprévue renvoie 500 sans détail technique ;
  - ajout de `notFoundMiddleware` pour les routes inconnues (404) et regroupement des deux middlewares dans [src/api/src/middlewares/errorMiddleware.ts](src/api/src/middlewares/errorMiddleware.ts) ;
  - création du middleware `validateId` ([src/api/src/middlewares/commonMiddleware.ts](src/api/src/middlewares/commonMiddleware.ts)) : il renvoie 400 si l'id n'est pas un entier positif, et il est branché sur `GET /api/trees/:id`.

### Décisions

- Les messages d'erreur de l'API sont en français, avec le champ `status`.
- Les cartes du sprint 1 ne traitent que les erreurs du sprint 1 : chaque feature ajoute ensuite ses propres erreurs.

## 2026-10-28 — Réglages des conteneurs et du Docker Compose

### Travail réalisé

- Derniers réglages des conteneurs et du `docker-compose.yml`, à partir des remarques de Fabrice.
- **Création du `treeRouter`** ([src/api/src/routers/treeRouter.ts](src/api/src/routers/treeRouter.ts)) avec les routes `GET /api/trees` (tous les arbres) et `GET /api/trees/featured` (arbres de l'accueil).
- **Tests des routes avec REST Client** dans VS Code ([src/api/test/test.tree.http](src/api/test/test.tree.http)).

## 2026-10-27 — Initialisation du front

### Travail réalisé

- **Initialisation du front** en session commune, sous la direction du lead front (Loïc) :
  - mise en place de Next.js et des dépendances du front : Next.js, React, TypeScript et ESLint ;
  - outils communs au projet : Husky, lint-staged et Prettier ;
  - conteneurisation du front avec Docker et ajout du service `front` au `docker-compose.yml`.

## 2026-10-26 — Initialisation du back

### Travail réalisé

- **Initialisation du back** en pair programming, sous la direction du lead back (Dimitry) :
  - création des données (`data`), du seed et du schéma de la base ;
  - mise en place du DataMapper ;
  - installation des dépendances du back : Express, pg (connexion à PostgreSQL), cors et dotenv, avec TypeScript et tsx pour le développement ;
  - conteneurisation de la base de données, d'Adminer et de l'API avec Docker ;
  - création d'un `docker-compose.yml` qui relie tous les conteneurs (`db`, `adminer`, `api`) ;
  - création d'une route de test (`GET /api/health`) pour vérifier que le back fonctionne.

## Du 2026-10-21 au 2026-10-23 — Modèle de données et maquettes

### Travail réalisé

- **Conception du modèle de données** avec l'équipe :
  - participation à la conception du MCD, du MLD et du MPD en proposant mes idées ;
  - relecture des trois modèles ;
  - travail sur les cardinalités du MCD.
- **Wireframe de la page Panier**.
- **Maquettes** : apport de mon expertise sur la partie graphique des maquettes.

## 2026-10-20 — Cœur du projet

### Travail réalisé

- Échanges avec l'équipe sur le cœur du projet : le thème et la direction à prendre
