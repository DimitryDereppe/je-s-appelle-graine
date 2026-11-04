# Carnet de bord — Mahamadou

Suivi de mon travail sur Je s’appelle Graine. Le suivi de l'équipe est dans le [carnet de bord Je s’appelle Graine](CARNET-DE-BORD-JE-S-APPELLE-GRAINE.md).

## 2026-11-04 — Catalogue côté front : filtre, recherche et message « aucun résultat »

### Travail réalisé

- **Fusion de la PR #147** (`feat/tree`) dans `main` : le back du catalogue (filtre par catégorie et recherche par nom) est disponible pour toute l'équipe.
- **Page catalogue `/arbres`** (US02, US03, US03b, US03c, US03d) sur la branche `feat/front-catalogue` :
  - **filtre par catégorie** (US03) : la page lit `?categorie=` dans l'URL, construit les paramètres de l'API avec `URLSearchParams` et appelle `GET /api/trees?category=:id` ;
  - **recherche par nom** (US03b) : un formulaire HTML (`method="get"`) envoie `?recherche=` ; la page le transmet à l'API en `?search=` ;
  - **barre de recherche dans le header** : nouveau composant `SearchBar` (client) qui lit l'URL avec `useSearchParams`, placé dans un `<Suspense>` pour que le build passe ; `key` sur le champ pour qu'il se mette à jour quand l'URL change ;
  - **combinaison des deux filtres** (US03c) : les boutons radio recopient la recherche en cours, et la barre de recherche renvoie la catégorie avec un champ caché ;
  - **message quand aucun arbre ne correspond** (US03d) : le message reprend le texte cherché, avec un lien « Voir tous nos arbres » ;
  - **CSS responsive du header** : sur grand écran, la recherche est sous le menu et a la même largeur ; sur mobile, elle prend toute une ligne sous le logo.
- Correction des liens du catalogue, qui pointaient vers `/trees` au lieu de `/arbres`.

### Décisions

- L'URL du site suit le cahier des charges et reste en français (`/arbres?categorie=2&recherche=chene`). L'URL de l'API reste en anglais (`/api/trees?category=2&search=chene`).
- La recherche est placée dans le header : on peut chercher depuis n'importe quelle page, et on arrive sur le catalogue.

### Difficultés rencontrées

- Sous Windows, le conteneur Docker du front ne voyait pas mes modifications : la page affichait l'ancien code. Solution : redémarrer le conteneur (`docker restart src-front-1`).
- Erreurs TypeScript `Cannot find name` : en remplaçant du code, j'avais effacé des lignes qui créaient des variables (`router`, `useState`).
- Sur mobile, le header débordait sous 560 px, car un `<input>` refuse de rétrécir dans un conteneur flex. Solution : `flex-wrap: wrap` et `min-width: 0`.

## 2026-11-03 — Catalogue côté back : tests et refactorisation

### Travail réalisé

- **Tests d'intégration compatibles Windows** : correction de `global-setup.ts` pour que les tests de l'API tournent aussi sous Windows.
- **Tests de la recherche par nom** : 7 tests sur `GET /api/trees?search=` dans [treeController.spec.test.ts](src/api/src/controllers/treeController.spec.test.ts).
- **Refactorisation du catalogue filtré** : une seule requête SQL, où chaque filtre (catégorie, recherche) est facultatif, au lieu de plusieurs fonctions. Cela simplifie le contrôleur, le datamapper et le routeur.
- Fusion de `feat/tree` dans `feat/front-catalogue`, pour démarrer le front du catalogue avec le back à jour.

### Décisions

- La recherche ignore les accents et les majuscules (`unaccent` + `ILIKE`), et les caractères `%` et `_` tapés par l'utilisateur sont échappés.

## 2026-11-02 — Catalogue côté back : filtre par catégorie et recherche par nom

### Travail réalisé

- Mise à jour de mon carnet de bord jusqu'au 30/10.
- **Filtre du catalogue par catégorie** (US03), sur la branche `feat/tree` :
  - route `GET /api/trees?category=:id` ;
  - middleware `validateCategoryQuery` ([src/api/src/middlewares/commonMiddleware.ts](src/api/src/middlewares/commonMiddleware.ts)) : il renvoie 400 si la catégorie n'est pas un entier positif ;
  - fonction `findByCategory` dans le datamapper.
- **Recherche d'un arbre par son nom** (US03b), combinable avec la catégorie (US03c) :
  - route `GET /api/trees?search=:texte`, qui peut s'ajouter à `?category=` ;
  - middleware `validateSearchQuery` : il renvoie 400 si la recherche n'est pas un seul texte, ou si elle dépasse 100 caractères ;
  - fonction `findBySearch` dans le datamapper : la recherche trouve un nom même partiel, sans tenir compte des accents ni des majuscules (`unaccent` + `ILIKE`) ; les caractères spéciaux `%` et `_` tapés par l'utilisateur sont échappés ;
  - ajout de requêtes de test dans [src/api/test/test.tree.http](src/api/test/test.tree.http).

### Décisions

- Les arbres retirés du catalogue n'apparaissent jamais dans les résultats, même avec un filtre.
- Une recherche vide, ou faite seulement d'espaces, revient à ne pas filtrer.

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
