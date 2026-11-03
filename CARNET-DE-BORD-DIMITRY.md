# Carnet de bord — Dimitry (Tech Lead Back)

Suivi de mon travail sur Je s’appelle Graine. Les décisions notées ici ont été prises avec l'équipe sur Discord ; le suivi de l'équipe est dans le [[Apothéose/apo-jesappellegraine/CARNET-DE-BORD-JE-S-APPELLE-GRAINE|carnet de bord Je s’appelle Graine]].

## 2026-11-03 (suite) — Carte #84 : email déjà utilisé (409) et hachage argon2

Branche `feat/userRouter`, commits `5b8e798` (suppression du `.gitkeep` de `middlewares/`) et `e65f496` (409), pas encore poussés. Fichier : `src/api/src/controllers/userController.ts`.

**Résultat** : un email déjà en base renvoie `409` « Cet email est déjà utilisé. » ; un nouvel email passe en `201`. Le hachage du mot de passe est écrit mais pas encore commité (il ne sert qu'avec l'`INSERT` de l'étape 5).

### Travail réalisé

- **Email unique** (commit `e65f496`) : `accountDatamapper.findByEmail(email)` réutilisé ; `if (existingAccount) throw new ConflictError(...)`. `findByEmail` renvoie un compte ou `undefined`, et `undefined` est *falsy* : le `if` suffit.
- **Hachage** (non commité) : `const hashedPassword = await argon2.hash(password);`, placé **après** la vérification de l'email. `password` remis dans la déstructuration du résultat de Zod.
- **`.gitkeep`** : supprimés de `controllers/` et `middlewares/`, qui contiennent maintenant des fichiers ; gardé dans `services/`, encore vide.

### Décisions

- **`409 Conflict` et non `401`** : le visiteur n'a rien à prouver, sa demande entre en conflit avec un compte existant.
- **Pas de contrôle `isActive` à l'inscription** : il a du sens à la connexion, pas pour un compte qui n'existe pas encore.
- **Hacher après le contrôle de l'email** : argon2 est volontairement lent ; inutile de payer ce coût pour une demande refusée.
- **Commit du 409 seul, hachage gardé en local** : avec `--max-warnings=0`, une variable `hashedPassword` (ou un import `argon2`) inutilisée bloque le commit. Le hachage sera commité avec l'`INSERT`.

### Difficultés

- **`500` pour un nouvel email** : bloc `isActive` recopié de `login` ; `findByEmail` renvoyait `undefined`, et lire `undefined.isActive` faisait planter. En plus, le `if` n'était pas fermé : la réponse `201` était dedans (`}}` en fin de fonction).
- **Ligne insérée au milieu d'une instruction** : `const hashedPassword = ...` placé entre `const { ... } =` et `await registerBodySchema.parseAsync(...)`.
- **Commit bloqué par lint-staged** : `'argon2' is defined but never used` une fois la ligne du hachage commentée.

### À poursuivre (carte #84)

- **Étape 5** : `accountDatamapper.create` — `INSERT INTO account (...) VALUES ($1, ...)` paramétré, `role_id` via une sous-requête sur `role` (`name = 'customer'`) sans `1` en dur, `RETURNING` des 6 champs du contrat avec alias camelCase et **sans** `password`. Dans `register` : appeler `create` avec `hashedPassword`, répondre `201` avec la ligne renvoyée (`id` compris). Commiter alors hachage + `INSERT` ensemble.
- **Étape 7** : middleware `415` (POST, PUT, PATCH seulement) + classe d'erreur 415 dans `errors.ts`.
- **Étape 8** : tests d'intégration (`201` sans mot de passe, `400`, `409`, `415`).
- PR vers `back-F3` (`Closes #84` si tous les critères sont remplis), relecteur `loicRoch`.

## 2026-11-03 (matin) — Carte #84 : inscription `POST /api/users`, route et validation Zod

Branche `feat/userRouter` (partie de `back-F3`), commits `d0a63cd` et `3c68601` (pas encore poussés). Fichiers : `src/api/src/routers/userRouter.ts` (nouveau), `src/api/src/routers/index.router.ts`, `src/api/src/controllers/userController.ts` (nouveau), `src/api/test/test.user.http` (nouveau).

**Résultat** : `POST /api/users` répond et valide le body selon le contrat de la carte #83 : `201` avec les données validées (sans le mot de passe) ou `400` avec un message en français. Rien n'est encore enregistré en base.

### Travail réalisé

- **Routeur `userRouter`** : `router.post("/users", register)`, branché dans `index.router.ts` comme `treeRouter` et `authRouter`. Le chemin est `/users`, sans `/api`, que `app.ts` ajoute déjà (`app.use("/api", apiRouter)`). Les routes des cartes suivantes (`/users/me`…) sont gardées en commentaire comme mémo.
- **Schéma Zod `registerBodySchema`** (commit `3c68601`) :
  - `firstname`, `lastname` : `z.string({ error })` pour un champ absent, `.min(1, { error })` pour un champ vide ;
  - `email` : `z.email()` ;
  - `password` : `.min(12)` avec son propre message (« Le mot de passe doit contenir au moins 12 caractères. ») ;
  - `accountType` : `z.enum(["particulier", "association", "entreprise"]).default("particulier")`, mêmes valeurs que le `CHECK` de la table `account` ;
  - `organizationName` : `.optional().nullable()` (absent ou `null`).
- **Réponse provisoire** : `201` avec les champs validés, `organizationName ?? null` pour que la clé apparaisse toujours (une valeur `undefined` disparaît du JSON).
- **`test.user.http`** : 10 requêtes nommées (`### code attendu · cas`) : 3 cas `201`, 5 cas `400`, `409` (email d'alice) et `415` (body en `text/plain`) pour les étapes suivantes.
- **Vérifications** : les 7 cas `201`/`400` donnent le code et le message attendus ; ESLint passe.

### Décisions

- **Un routeur `userRouter` à part plutôt que dans `authRouter`** : `/users` est une ressource (les comptes), `/auth` la session. Un fichier par responsabilité (SoC).
- **Deux messages par champ texte obligatoire** : avec Zod 4, le message de `z.string({ error })` s'applique à toutes les erreurs du champ si la règle n'a pas le sien. Sans message sur `.min(12)`, un mot de passe trop court affichait « Mot de passe obligatoire. ».
- **Zod refuse les mêmes valeurs que la base** : une valeur hors du `CHECK` donne un `400` clair, au lieu d'une erreur PostgreSQL en `500`.
- **Le mot de passe n'est jamais renvoyé**, même dans la réponse provisoire (contrat #83, entête § 12).

### Difficultés

- **API plantée au démarrage** : `TypeError: argument handler is required` (`userRouter.ts:5`). Les lignes `router.get("/users/me")` n'avaient pas de fonction ; Express refuse une route sans *handler*. Solution : ne garder que la route qui a un controller, les autres en commentaire.
- **`tsx` n'a pas relancé le serveur** après la correction : le processus avait planté au démarrage. Solution : `docker restart src-api-1`, puis lire `docker logs --tail 10 src-api-1`.
- **Branche créée depuis `front-F3`** (12 commits du front en trop) : rattrapé avant le premier commit avec `git stash -u`, `git switch back-F3`, `git branch -D`, `git switch -c`, `git stash pop`. Vérification : `git log --oneline back-F3..HEAD` vide.
- **Schéma défini mais jamais appliqué** : tout passait en `200`, même un mot de passe de 5 caractères. Il manquait `parseAsync(req.body)`.
- **Confusion règle / valeur** dans la première version du schéma (`firstname: "John"`) : le schéma décrit des règles, les valeurs d'exemple vont dans le body de `test.user.http`.

### À poursuivre (carte #84)

- **Étape 3** : email déjà utilisé → `409` (`accountDatamapper.findByEmail` + `ConflictError`).
- **Étape 4** : hacher le mot de passe (`argon2.hash`) ; remettre `password` dans la déstructuration.
- **Étape 5** : `accountDatamapper.create` (`INSERT` paramétré, `role_id` du rôle `customer` sans le coder en dur, `RETURNING` sans le mot de passe) ; réponse `201` avec l'`id`.
- **Étape 7** : middleware `415` pour les requêtes non JSON, limité à POST, PUT et PATCH (le `DELETE /api/auth` de la déconnexion n'a pas de body).
- **Étape 8** : tests d'intégration (`201` sans mot de passe, `400`, `409`, `415`).
- Écart avec le contrat dans `login` : « Ce compte est désactivé, veuillez contacter l'administrateur. » au lieu de « Ce compte est désactivé. ».

## 2026-11-02 (fin de journée) — Carte #86 : en-tête connecté, déconnexion, page de connexion à la maquette

Branche `feat/formulaires-connexion-inscription`, commits `aa62b94`, `aba6336` et `7d2bb4d` (pas encore poussés). Fichiers : `src/front/src/components/header/Header.tsx` et `header.module.css`, `src/front/src/app/connexion/page.tsx`, `LoginForm.tsx` et `page.module.css` (nouveau).

**Résultat** : l'en-tête affiche « Bonjour {prénom} » et un bouton « Déconnexion » pour une personne connectée, et « Connexion » pour un visiteur (US20, US21). La page `/connexion` suit la maquette v7. Rien ne fonctionne encore de bout en bout : l'API n'a aucune route d'authentification.

### Travail réalisé

- **État connecté** (commit `aa62b94`) : state `user` (`useState<User | null>(null)`) et `useEffect` qui appelle `GET /api/users/me` au premier affichage. `200` → `setUser(data)` ; `401` ou API injoignable → `null`, sans message d'erreur. « Connexion » sort du tableau `navigationLinks` et s'affiche sous condition : `{user ? (prénom + bouton) : <Link>}`, avec un fragment `<>…</>`.
- **Déconnexion** (commit `aba6336`) : `handleLogout` appelle `DELETE /api/auth`, puis `setUser(null)`, ferme le menu mobile et renvoie vers `/` (`router.push`).
- **Page de connexion à la maquette** (commit `7d2bb4d`) : maquette v7 page 4 ([maquette](docs/design/maquettes/maquette-complete-je-sappelle-graine-v7.pdf)) préférée au wireframe, plus ancien. Sur-titre « Votre espace », trait terracotta sous le titre (`::after`), « * (champs obligatoires) », photo `acceuil.png` à droite sur ordinateur et au-dessus en mobile (`order`).
- **En-tête à la maquette** : « Connexion » et « Bonjour … » en texte simple. Un cadre vert ajouté plus tôt a été retiré.
- **Correctif mobile** : sous 375 px, l'icône panier sortait de l'écran. Le logo avait `flex: 0 0 auto` et ne pouvait pas rétrécir. Passé à `flex: 0 1 auto` + `min-width: 0`, et nom du site en `font-size: clamp(1rem, 5vw, 1.25rem)`.
- **Vérifications** : ESLint (`--max-warnings=0`), `tsc --noEmit` et Prettier passent. Rendu vérifié dans Firefox (Playwright) à 320, 375 et 1280 px.

### Décisions

- **Le front ne lit jamais le cookie JWT** : il est `httpOnly`, donc invisible pour `document.cookie`, ce qui protège le token d'un script malveillant (XSS). Le navigateur l'envoie tout seul, et seule l'API peut dire qui est connecté (`GET /api/users/me`) ou supprimer le cookie (`DELETE /api/auth`, réponse `204` avec un cookie expiré).
- **`GET /api/users/me` renvoie `200`, pas `201`** : `201 Created` répond à une création (`POST`) ; un `GET` ne fait que lire.
- **Après la déconnexion, `setUser(null)` est obligatoire** : React ne sait rien du cookie et ne réaffiche le composant que si un state change.
- **`Refs #86` et non `Closes #86` dans la PR** : la carte se fermerait à la fusion alors que deux critères « Fini quand » ne sont pas remplis (bout en bout, clavier).

### Difficultés

- **Commit refusé par husky / lint-staged** : `'user' is assigned a value but never used`. Avec `--max-warnings=0`, un seul avertissement bloque le commit. Solution : faire l'étape suivante, qui utilise `user`, avant de commiter, plutôt que `--no-verify`.
- **Même erreur une 2e fois** : le fichier avait changé après le `git add` (`git status` : `MM`). Lint-staged ne vérifie que la version indexée ; il fallait réindexer.
- **Connexion impossible avec les comptes de `bdd-arbres.json`** : l'API répond `404 {"error":"Ressource introuvable"}` à `POST /api/auth`. Seules `/health` et `/trees…` existent. Le formulaire a donc affiché le message générique, comme prévu.

### À poursuivre

- **Routes de l'API à créer** (à répartir avec le trinôme, pas de carte vue) : `POST /api/auth`, `GET /api/users/me`, `DELETE /api/auth`.
- **Ouvrir la PR de la branche** : description préparée (`Refs #86`), relecteur `loicRoch` (cf. carte).
- **Tester au clavier** (Tab / Entrée) la page et l'en-tête, puis de bout en bout quand l'API sera prête.
- Le commit `7d2bb4d` a deux titres collés dans son message : à corriger avant de pousser si souhaité.
- La page `/inscription` n'existe pas : « Créer un compte » mène à une 404.
- Aucun message si la déconnexion échoue : à décider avec le trinôme.
- Le dossier `.playwright-mcp/` (captures de Playwright) n'est pas dans le `.gitignore`.

## 2026-11-02 (soir, suite) — Carte #86 : retour après la connexion (US06)

Branche `feat/formulaires-connexion-inscription`. Commit `b7dce3e` : `connexion/LoginForm.tsx`, `connexion/page.tsx` et `arbres/AddToCartButton.tsx` (dans `src/front/src/app/`).

**Résultat** : après une connexion réussie, l'utilisateur revient sur la page d'où il venait, filtres compris (ex. `/arbres?category=fruitier`). L'évolution US06 du cahier des charges est donc faite en avance sur le MVP.

### Travail réalisé

- **Cahier des charges relu** ([[Apothéose/apo-jesappellegraine/docs/specifications/CAHIER-DES-CHARGES-JE-S-APPELLE-GRAINE|cahier des charges]] §parcours d'achat, [[Apothéose/apo-jesappellegraine/docs/specifications/user-stories|user stories]] US05, US05b, US06) : la page où renvoyer après la connexion n'est pas fixée ; le retour automatique est une **évolution** (US06).
- **`AddToCartButton.tsx`** : sur un 401/403, envoie vers `/connexion?next=<page actuelle>` (`window.location.pathname + window.location.search`, encodé avec `encodeURIComponent`). Remplace `next=/trees`, une page qui n'existe pas.
- **`connexion/page.tsx`** : lit `next` dans `searchParams` (même modèle que `arbres/page.tsx`) et le passe en prop à `LoginForm`.
- **`LoginForm.tsx`**, après une réponse réussie, dans l'ordre :
  1. `next` présent et adresse du site → `router.push(next)` ;
  2. sinon, s'il y a une page précédente (`window.history.length > 1`) → `router.back()` ;
  3. sinon → `router.push("/")`.
- **Vérifications** : `tsc --noEmit` et ESLint passent ; `/connexion?next=...` répond 200. Pas de test en navigateur (Firefox de Playwright pas installé, `POST /api/auth` absente).

### Décisions

- **Implémenter US06 (retour sur la page d'origine) dès maintenant, alors qu'elle est classée en évolution** :
  - **Ce que disent les documents** : le cahier des charges ne fixe pas la page où renvoyer après la connexion pour le MVP (le client « revient sur la fiche de l'arbre » lui-même) ; US05b (MVP) demande seulement de pouvoir « accéder au panier » une fois connecté ; US06 (Évo) demande le retour automatique « pour reprendre mon achat là où je l'avais laissé ». La carte #86, elle, dit « après connexion, retour vers le panier ».
  - **Options écartées** :
    - **page fixe `/`** (accueil) : le visiteur perd sa place dans le catalogue et ses filtres, il doit tout refaire pour ajouter son arbre ;
    - **retour vers le panier** (texte de la carte) : la page `/panier` n'existe pas encore, et le panier serait vide puisque l'ajout a été refusé avant la connexion ;
    - **`router.back()` seul** (première version) : simple, mais renvoie hors du site quand on arrive sur `/connexion` depuis un e-mail ou un moteur de recherche, et ne fait rien dans un onglet neuf.
  - **Pourquoi US06** : c'est la seule option qui ramène le visiteur au geste qu'il était en train de faire (ajouter un arbre au panier), donc qui ne casse pas le parcours d'achat. Le coût est faible (une dizaine de lignes) parce que `AddToCartButton` passait déjà un paramètre `next` (vers `/trees`, inexistant) et que le modèle `searchParams` existe déjà dans `arbres/page.tsx`.
  - **`router.back()` et l'accueil gardés en secours** quand `next` est absent ou refusé.
  - **Validé par le trinôme (Fabrice, Shanna) le 02/11** : la carte #86 dit maintenant « après connexion, retour vers la page d'origine, filtres compris (US06) » au lieu de « retour vers le panier ».
- **`next` vérifié avant la redirection** : il doit commencer par `/`, mais ni par `//` ni par `/\` (que le navigateur lit comme l'adresse d'un autre site). Sans ce contrôle, un lien piégé `/connexion?next=https://faux-site.fr` renverrait l'utilisateur, juste connecté, vers un site pirate.
- **`searchParams` côté page serveur plutôt que `useSearchParams`** : reprend un modèle déjà présent dans le projet, et évite le `<Suspense>` que Next.js exige autour de `useSearchParams`.

### Difficultés

- **`/home` n'existe pas** : dans l'App Router, chaque dossier de `src/app/` est une adresse ; la page d'accueil (`src/app/page.tsx`) est `/`.
- **Un `else` jamais atteint** : `if (response.ok) ... else ...` après le `if (!response.ok) return;` — la condition à tester était « y a-t-il une page où revenir ? », pas « la réponse est-elle bonne ? ».

### À poursuivre

- Prévenir l'équipe front de la modification de `AddToCartButton.tsx`.
- Tester quand `POST /api/auth` existera : depuis `/arbres?category=...` → retour au même filtre ; `/connexion` tapé dans un onglet neuf → `/` ; `next=//exemple.com` → pas de sortie du site.
- Limite connue : sans `next`, `router.back()` peut ramener hors du site (arrivée depuis un e-mail ou Google).

## 2026-11-02 (soir) — Carte #86 : page de connexion (front)

Branche `feat/formulaires-connexion-inscription`, fichier `src/front/src/app/connexion/LoginForm.tsx`.

**Résultat** : la page `/connexion` envoie l'e-mail et le mot de passe à `POST /api/auth` et affiche un message clair pour chaque cas d'erreur. Elle ne redirige pas encore après une connexion réussie.

### Travail réalisé

- **Formulaire statique** (commit `57088d4`) : champs e-mail et mot de passe, lien vers `/inscription`.
- **Interception de l'envoi** avec `<form action={handleLogin}>` (commit `84a329d`).
- **Message d'erreur** (commit `9dd24e2`) : état `errorMessage` (`useState`), affiché dans un `<p role="alert">` au-dessus du bouton et vidé au début de `handleLogin`.
- **Appel à l'API** (commit `b3d1322`) : `fetch` en `POST` et en JSON, vérification `typeof` des champs avant l'envoi, messages pour le 401 (identifiants incorrects) et le 403 (compte bloqué), `try/catch` avec un message générique.
- **Correction du cas `!response.ok`** (commit `2a2da2f`) : un `throw` suivi d'un `return` jamais exécuté. Le `catch` sans paramètre perdait le message du `throw` et affichait « Une erreur est survenue. ». Le bloc reprend la forme du 401/403 : `setErrorMessage("Quelque chose n’a pas fonctionné.")` puis `return`.

### Décisions

- **Le `catch` est réservé au serveur injoignable** : `fetch` ne lève pas d'erreur pour un 404 ou un 500 (c'est une réponse) ; il en lève une seulement quand aucune réponse n'arrive.

### Difficultés

- **Code après un `throw`** : `throw` quitte le bloc `try` tout de suite et saute dans le `catch` ; le `return` placé après ne s'exécute jamais.

### À poursuivre

- **Étape 5 — redirection après connexion réussie** :
  1. rediriger vers une page fixe (`useRouter` + `router.push`, comme dans `AddToCartButton.tsx`) ;
  2. lire le paramètre `next` de l'adresse pour revenir à la page d'origine ;
  3. n'accepter qu'un `next` qui commence par `/` (pas de redirection vers un autre site).
- **`AddToCartButton.tsx` ligne 30** envoie vers `/connexion?next=/trees`, mais la page des arbres est `/arbres` (pas de dossier `trees` dans `src/app/`).
- **La route `POST /api/auth` n'existe pas encore dans l'API** (ni sur `main`, ni sur `back`) : elle répond 404 pour l'instant. Tester les cas 401, 403 et la connexion réussie quand elle sera faite.

## 2026-11-02 (après-midi) — Production : build de l'API cassé par les tests

Branche `fix/build-api-sans-tests` (commit `74ec70e`), créée depuis `main`.

**Résultat** : l'image de production de l'API se construit à nouveau (testé en local avec `Dockerfile.prod`). Sur la VM, rien n'a changé : le site tourne toujours avec l'ancienne image et l'ancienne base, qui sont cohérentes entre elles.

### Travail réalisé

- **Mise à jour de la VM tentée** (passage des valeurs en français) : `docker compose -f docker-compose.prod.yml up -d --build` a échoué au build de l'API (`TS2307: Cannot find module '../test/index.ts'`).
- **Correction** :
  - `src/api/tsconfig.build.json` : reprend `tsconfig.json` sans `test/` ni les `*.spec.test.ts` / `*.unit.test.ts` ;
  - `npm run build` lance `tsc -p tsconfig.build.json` ; `Dockerfile.prod` copie ce fichier ;
  - `.dockerignore` : `tests` corrigé en `test`.
- **Tests** :
  - erreur reproduite en local en compilant sans `test/`, comme dans l'image ;
  - après correction : `build`, `typecheck` (tests compris) et `lint` passent ;
  - image construite avec `Dockerfile.prod` : aucun fichier de test dans `dist/`, photos présentes ; conteneur démarré sur la base locale → `/api/health`, `/api/trees/featured` et une photo en `200`.
- **Guide** « mettre à jour la bdd vm apres modifs.md » (pas encore commité) : quand et comment mettre à jour la base de la VM après une modification du schéma ou du seed (recréer la base, ou migration SQL).

### Décisions

- **Un `tsconfig.build.json` à part** plutôt que d'exclure les tests de `tsconfig.json` : `npm run typecheck` continue de vérifier les tests.
- **Réinstallation complète de la VM** plutôt qu'une remise à zéro de la base : ce n'est pas un vrai site, et sur une VM neuve PostgreSQL joue lui-même le schéma et le seed en français.

### Difficultés

- **Commandes lancées depuis `~` sur la VM** : `open /home/student/docker-compose.prod.yml: no such file or directory`. Le chemin `-f` est lu à partir du dossier courant ; il faut d'abord `cd ~/apo-jesappellegraine/src`.
- **Le build marchait sur ma machine** : `test/` y existe. Dans l'image, seul `src/` est copié, et `tsc` compile tous les `.ts`, tests compris.
- **Ne pas recréer la base avant de réparer le build** : la base passerait en français alors que l'ancienne image de l'API cherche encore `'available'` (accueil vide).

### À poursuivre

- Pousser `fix/build-api-sans-tests` et faire passer la PR vers `main`.
- Puis réinstaller la VM (DEPLOIEMENT.md, section 3) et vérifier : accueil (`id` 20, 19, 16), catalogue (18 arbres), `SELECT * FROM availability` en français.
- Prévenir l'équipe : même build cassé sur leur VM tant que la correction n'est pas dans `main`.
- Décider du nom et de la branche du guide de mise à jour de la base, puis le commiter.

## 2026-11-02 (suite) — Dépendances npm, ménage des branches et carnet

Branches `back` (PR #126) et `docs/carnet-dimitry`.

**Résultat** : les dépendances sont dédoublonnées et npm évite les doublons pour toute l'équipe (`prefer-dedupe`). Il ne reste que 4 branches : `main`, `Front`, `back` et `docs/carnet-dimitry`.

### Travail réalisé

- **Audit des dépendances** (racine, `src/api`, `src/front`) : tous les paquets déclarés sont utilisés, `npm ls` ne signale aucun paquet en trop, manquant ou de mauvaise version.
- **`npm dedupe`** (commit `2c1551c`) : dans l'API, `globals` passe de 17.13.0 à 17.14.0 ; dans le front, 2 copies en double sont retirées et `@eslint-community/eslint-utils` n'existe plus qu'en 4.9.1.
- **`directories.test`** de `src/api/package.json` corrigé : `"tests"` → `"test"`, le vrai nom du dossier.
- **Réinstallation propre** (`npm ci`) dans les 3 dossiers, et `src/front/.next` local supprimé (70 Mo, recréé par `npm run build`).
- **`.npmrc` avec `prefer-dedupe=true`** dans les 3 dossiers (commit `53fd6cf`) : npm réutilise une version déjà installée quand elle convient, au lieu d'en ajouter une autre.
- **Vérifications** : `typecheck` et `lint` de l'API et du front, les 15 tests d'intégration passent.
- **Ménage des branches** : 9 branches locales et 6 sur GitHub supprimées, toutes entièrement fusionnées dans `main` (aucun commit perdu).
- **Deux branches de sauvegarde comparées avec `main`, puis supprimées** :
  - `sauvegarde-stash-erd` : le MCD est identique à celui de `main` (38 formes, mêmes libellés, mêmes positions ; seul le format, compressé, change). Le lien README ajouté menait à `divers/08-erd.md`, hors du dépôt.
  - `sauvegarde-carnet-dimitry` : le tableau de versions du README est déjà dans `main`, mais l'entrée du carnet du 23/10 (jeu de données JSON, photos et crédits) n'existait plus nulle part.
- **Carnet** : branche reconstruite à partir de `main`, entrée du 23/10 récupérée (liens mis à jour, points « À poursuivre » vérifiés au 02/11), titre « Carte #114 » et 2 points « À poursuivre » de l'entrée du 30/10 (soir) rétablis.

### Décisions

- **`prefer-dedupe` dans un `.npmrc` commité** plutôt qu'un `npm dedupe` dans le hook `pre-commit` : le hook modifierait le `package-lock.json` pendant le commit, et `npm find-dupes` ne renvoie pas d'erreur quand il trouve un doublon.
- **`npm audit` non corrigé** : la faille modérée de `minimatch` vient d'ESLint, qui ne sert qu'en développement. `npm audit fix --force` installerait ESLint 4.0.0, qui casserait la configuration : on attend une mise à jour d'ESLint.
- **Seules les branches entièrement fusionnées dans `main` sont supprimées** ; `Front` (9 commits de Loïc pas encore dans `main`) est gardée.
- **Anciennes entrées du carnet** : on ne les réécrit pas, mais on rétablit ce qu'une fusion a effacé et on note l'état d'un point « À poursuivre » avec sa date.
- **Le carnet est poussé en fin de journée seulement.**

### Difficultés

- **`git pull` bloqué par des fichiers non fusionnés** : un `git stash pop` du stash « maj carnet » (fait sur `back`) avait créé un conflit dans le carnet. Son contenu était déjà dans la branche (commit `d8c1f74`) → fichier remis comme dans `HEAD` (`git restore --source=HEAD --staged --worktree`), stash supprimé.
- **`git restore` : « ne correspond à aucun fichier connu »** : le terminal n'était pas à la racine du dépôt, et Git lit un chemin à partir du dossier courant.
- **`git pull` : « impossible de trouver la référence distante »** : la branche avait été supprimée sur GitHub après la fusion de la PR #117 (`[disparue]` dans `git status`).
- **Branche `back` recréée sur GitHub par erreur** : supprimée après la PR #125, mais `git fetch` sans `--prune` gardait l'ancienne référence locale `origin/back`.
- **Fusion `18d2d43` (`docs/installation-docker`)** : la résolution de conflit avait remis l'ancien titre « Déploiement » et effacé 2 points « À poursuivre » de l'entrée du 30/10 (soir). Un premier contrôle par `grep '^[+-][^+-]'` ne les voyait pas, car ces lignes commencent par un tiret.

### À poursuivre

- Prévenir Loïc : `welcomePage` a été supprimée sur GitHub (entièrement dans `main`).
- Carte #114 : la PR #118 a été fusionnée sans relecture enregistrée sur GitHub.
- Suivre la mise à jour d'ESLint qui corrigera la faille `minimatch`.
- Fin de journée : pousser `docs/carnet-dimitry` et ouvrir la PR vers `main`.

## 2026-11-02 — Valeurs métier en français

Branche `feat/deployment` (commit `abeb3b0`, fusionné dans `main` par la PR #124), puis `back` pour les tests (commit `c4c2719`).

**Résultat** : les valeurs que le client peut voir sont maintenant en français, dans la base, le code et la documentation. Les rôles (`customer`, `admin`), que le client ne voit jamais, restent en anglais.

### Travail réalisé

- **Nouvelles valeurs** :
  - `availability.name` : `disponible`, `en rupture de stock`, `retiré` ;
  - `purchase.status` : `en attente`, `payée`, `plantée`, `annulée` ;
  - `account.account_type` : `particulier`, `association`, `entreprise` ;
  - `purchase.payment_method` : `virement`, `chèque`.
- **Code** : `01-schema.sql` (`DEFAULT` et `CHECK`), `02-seed.sql`, `bdd-arbres.json`, `treeDatamapper.ts` (`= 'disponible'` pour l'accueil, `<> 'retiré'` pour le catalogue), `treeController.ts` (404 si `"retiré"`) et le type `availabilityName`.
- **Doc** :
  - [[Apothéose/apo-jesappellegraine/docs/conception/modele-de-donnees/00-dictionnaire-de-donnees|dictionnaire de données]], [[Apothéose/apo-jesappellegraine/docs/conception/modele-de-donnees/06-mld|MLD]], [[Apothéose/apo-jesappellegraine/docs/conception/modele-de-donnees/07-mpd|MPD]] et le SVG drawio du MPD ;
  - [[Apothéose/apo-jesappellegraine/docs/specifications/CAHIER-DES-CHARGES-JE-S-APPELLE-GRAINE|cahier des charges]], user stories, entités et diagrammes `.puml` 02, 03 et 04.
- **« Épuisé » devient « en rupture de stock »** partout, pour que la doc emploie le même mot que la base.
- **Tests** dans une base temporaire (schéma et seed chargés, puis base supprimée) :
  - 13 arbres disponibles, 5 en rupture, 3 retirés ;
  - l'accueil renvoie les arbres 20, 19 et 16, et le catalogue 18 arbres ;
  - 7 particuliers, 2 entreprises, 1 association ;
  - une commande payée par `chèque` est acceptée et prend le statut `en attente` ; une commande payée par `check` est refusée par le `CHECK` ;
  - `typecheck` et `lint` passent.
- **Tests d'intégration** (`test/index.ts` et `treeController.spec.test.ts`) : `createTree` crée par défaut un arbre `"disponible"`, et les arbres de test passent en `"en rupture de stock"` ou `"retiré"`. Avant : 6 tests sur 15 échouaient ; après : **les 15 passent**.

### Décisions

- **Tout ce qui est affiché au client passe en français**, avec l'équipe : le front pourra afficher la valeur telle quelle, sans table de traduction.
- **`paid` et `planted` traduits aussi**, pour ne pas avoir une liste de statuts à moitié en anglais.
- **Les noms de colonnes ne changent pas** (`paid_at`, `planted_at`, `cancelled_at`) : seules les valeurs changent.
- **Les anciennes entrées des carnets ne changent pas** : ce sont des historiques.

### Difficultés

- **Code et base doivent changer ensemble** : avec les anciennes valeurs encore en base, l'accueil serait vide, les arbres retirés apparaîtraient dans le catalogue et leur fiche ne renverrait plus 404.
- **`db:seed` ne suffit plus** : il ne recrée pas le schéma, donc les anciennes contraintes `CHECK` refuseraient `'particulier'`. Il faut `db:reset`.
- **Tests d'intégration en échec** : `createTree` crée lui-même la ligne `availability` avec le nom qu'on lui donne (`"available"` par défaut). Le code filtrant sur `'disponible'`, aucun arbre de test ne correspondait.

### À poursuivre

- Prévenir l'équipe : `npm run db:reset` après le pull.
- **Urgent — production** : le changement est déjà dans `main` (PR #124). Au prochain redémarrage de la VM, le cron `@reboot` récupère `main` sans toucher à la base : accueil vide, arbres retirés visibles. Écrire et passer la migration (supprimer les `CHECK`, `UPDATE` des valeurs, recréer les `CHECK`) avant, ou ne pas redémarrer la VM d'ici là.
- Réexporter les PNG des diagrammes 02, 03 et 04 avec l'extension PlantUML (Java absent de la machine).

## 2026-10-30 (soir) — Carte #114 : certificat renouvelé et site mis à jour automatiquement

Branche `docs/renouvellement-certificat` (commit `5b70c69`), créée depuis `main`.

**Résultat** : sur la VM, deux tâches cron tournent. Elles ont été testées en conditions réelles, y compris après un redémarrage.

### Travail réalisé

- **[[Apothéose/apo-jesappellegraine/DEPLOIEMENT|DEPLOIEMENT.md]], section « Mettre à jour le site »** : `restart nginx` remplace `nginx -s reload`.
  - L'image Nginx ne remplace `${DOMAINE}` dans le `.template` qu'au **démarrage** du conteneur.
  - Un `reload` relit l'ancienne configuration : une nouvelle règle (comme `/images/trees/`) serait ignorée.
  - Cette erreur venait du guide d'origine (commit `1dc6150`, écrit avec Claude).
- **`src/crontab.prod`**, installé sur la VM avec `crontab crontab.prod` :
  - **toutes les heures, à la minute 17** : `certbot renew --webroot`, puis `nginx -s reload` → `~/renouvellement-certificat.log` ;
  - **au démarrage (`@reboot`)** : `sleep 60`, `git pull --ff-only origin main`, `up -d --build`, `restart nginx` → `~/mise-a-jour.log`.
- **Clé SSH `~/.ssh/deploy_graine` sur la VM**, sans phrase de passe. Le dépôt de la VM l'utilise grâce à `git config core.sshCommand`.
- **DEPLOIEMENT.md simplifié et vérifié** : une seule clé pour le clone et le cron, une section « Tâches automatiques (cron) », des pièges mis à jour.
- **Tests** :
  - en local, sur une copie de la config de prod, dans les conditions de cron (environnement vide, pas de terminal) ;
  - sur la VM, essai à blanc du renouvellement : `Congratulations, all simulated renewals succeeded` ;
  - à 17h20, passage réel de cron : `Certificate not yet due for renewal` (expiration le 27/01/2027), puis Nginx rechargé ;
  - redémarrage à 17h35:44 : mise à jour lancée à 17h36:52, site et API en `200`.

### Décisions

- **Toutes les heures plutôt qu'une heure fixe** : la VM s'éteint chaque jour, et cron ne rattrape pas un passage manqué. Tant qu'il reste plus de 30 jours, Certbot ne fait rien, donc ça ne coûte rien. La minute 17 évite les heures pile, comme le demande Let's Encrypt.
- **`--webroot` pour renouveler** : le premier certificat a été obtenu en `--standalone`, qui a besoin du port 80, déjà pris par Nginx.
- **Clé ajoutée à mon compte GitHub**, faute de mieux : une _Deploy key_ en lecture seule demande un admin du dépôt, et nous n'avons que le droit WRITE. La doc recommande la _Deploy key_ pour les collègues.
- **Aucun mot de passe dans le dépôt** : le mot de passe commun des VM n'aide pas pour `git pull`, et il serait lisible sur GitHub.

### Difficultés

- **Premier essai de renouvellement** : `Timeout during connect`, parce que la VM n'était pas rendue publique.
- **`git pull` sous cron** : `Permission denied (publickey)`. La clé d'origine de la VM a une phrase de passe, et personne n'est là pour la taper.
- **Push refusé vers `main`** : la branche avait été créée avec `git switch -c … origin/main`, donc elle suivait `main`. VS Code a poussé vers `main`.
- **Doc périmée** : l'API renvoie 18 arbres et non 13, `/api/health` fonctionne, `/images/trees/` part vers l'API, et le JWT n'existe pas encore.

### À poursuivre

- `git push -u origin docs/renouvellement-certificat`, puis la PR vers `main`.
- Carte #114 : ajouter l'étape « si Docker n'est pas installé » (étape 2 du chap. 3). → **Fait** (commit `5a54291`, PR #118).
- Carte #114 : PR relue dans le groupe, puis approuvée par quelqu'un d'un autre groupe. → PR #118 fusionnée le 02/11, **sans relecture enregistrée sur GitHub**.
- Supprimer la clé `deploy-graine` de mon compte GitHub quand la VM ne sert plus, ou la remplacer par une _Deploy key_ ajoutée par un admin.
- Collègues : installer `crontab.prod` sur leur VM (DEPLOIEMENT.md, section 6).

## 2026-10-30 (après-midi) — Carte #45 : audit Lighthouse de l'accueil et plan de tests

Branche `docs/plan-de-tests`, créée depuis `main`. Les tests d'intégration du matin sont sur `back` (PR #78, entrée « Tests d'intégration de l'API » sur cette branche).

**Résultat** : accessibilité **96** ✅, SEO **82** ❌ (objectif : 90), en mobile comme en bureau.

### Travail réalisé

- **Audit Lighthouse** (12.8.2) du site en ligne, mobile et bureau :
  - accessibilité 96, SEO 82, bonnes pratiques 93 ;
  - performance : 83 en mobile, 100 en bureau.
- **Vérification manuelle avec Firefox** (Playwright, 1280 px et 375 px) : arbres affichés, contenu des vignettes, navigation au clavier, largeur sur mobile, erreurs 404.
- **Plan de tests créé** : `docs/tests/PLAN-DE-TESTS.md`, relié depuis le README.
  - Colonnes : n°, cas, type, attendu, obtenu.
  - Pour F1 : 7 cas d'intégration (6 ✅, 1 à écrire), 11 cas manuels et l'audit Lighthouse.

### Décisions

- **Audit lancé dans un conteneur Docker jetable** (`node:22-bookworm` + Chromium). PageSpeed Insights avait épuisé son quota du jour, et le Chrome téléchargé ne démarrait pas dans le terminal isolé.
- **Lien du plan de tests en Markdown classique dans le README**, comme les autres liens : il doit fonctionner sur GitHub.

### Difficultés

- **L'accueil n'affiche pas les bons arbres** :
  - `page.tsx` appelle `/api/trees` (le catalogue) et garde les 3 premiers ;
  - en ligne, il affiche donc Pin maritime, Pin sylvestre et Pin d'Alep (ids 1, 2, 3, les plus anciens) ;
  - `/api/trees/featured` renvoie Chêne vert, Filaire à larges feuilles et Arbousier (ids 20, 19, 16) ;
  - un arbre en rupture peut apparaître, puisque le catalogue les inclut.
- **Autres écarts avec les critères de F1** :
  - pas de catégorie sur les vignettes ;
  - prix affiché `9.9 TTC` (sans `€` ni 2 décimales) ;
  - bouton « Voir nos arbres » sans lien ;
  - pas d'état d'erreur ni de message « aucun arbre » ;
  - la page plante s'il y a moins de 3 arbres (`treesAll[i]` vaut `undefined`).
- **SEO** : pas de `<title>` ni de `<meta description>`, car `layout.tsx` n'exporte pas de `metadata`. Et `lang="en"` sur un site en français.
- **Accessibilité** :
  - `aria-label="Je m’appelle Graine, accueil"` dans `Footer.tsx` (faute : « m’appelle ») ;
  - `alt="Arbre"` sur l'image d'accueil, peu précis.
- **Bonnes pratiques et performance** :
  - icône `arbres-selectionnes.png` (200 × 263) déformée en 24 × 24 ;
  - image d'accueil chargée en différé (`loading="lazy"`), alors que c'est le plus gros élément visible : 4,7 s sur mobile.
- **Carte #19 fermée, mais le plan de tests n'existait sur aucune branche.**

### À poursuivre

- Créer les cartes pour le front (Loïc et Shanna) :
  - accueil branché sur `/featured`, avec les états erreur et vide ;
  - vignette : catégorie et prix en `€` ;
  - `metadata` et `lang="fr"` ;
  - petits correctifs d'accessibilité et d'images.
- Écrire le test F1-INT-7 : format d'une vignette (`price` en nombre, champs en camelCase).
- Commit et PR de `docs/plan-de-tests`, puis cocher « Plan de tests à jour pour F1 » sur la carte #45.
- Relancer l'audit après les correctifs du front.
- Supprimer l'image Docker `node:22-bookworm` si elle ne sert plus.

## 2026-10-30 — Le nouveau front n'apparaissait pas sur le VPS

### Travail réalisé

- Branche `fix/front-build-prod` (commit `238904a`, poussée) : `export const dynamic = "force-dynamic"` dans
  `src/front/src/app/page.tsx`, et `COPY --from=build /app/public ./public` dans `src/front/Dockerfile.prod`.
- `API_URL` retiré pour lancer `npm run build` en local : le build passe, `/` est rendu à la demande (`ƒ`).

### Difficultés

- Site en ligne sans en-tête ni pied de page, `/trees` en 404 → la VM était encore sur `feat/deployment`
  (`1dc6150`) → passer sur `main`.
- Sur `main`, `docker compose up --build` échouait : `TypeError: Invalid URL`, `input: 'undefined/api/trees'` →
  l'accueil (composant serveur, `revalidate: 60`) était pré-rendu pendant `next build`, alors que `env_file` ne
  sert qu'au lancement du conteneur et que `api` n'est pas joignable pendant un `docker build` → rendu à la
  requête (`force-dynamic`). L'ancien conteneur `front` restait en service.
- `public/` (logo, icônes) n'était pas copié dans l'image `standalone` → ligne `COPY` décommentée.

### À poursuivre

- Ouvrir la PR `fix/front-build-prod` → `main`, puis redéployer `main` sur la VM.

## 2026-10-30 — Tests d'intégration de l'API

Branche `feat/test-setup`.

**✅ Les 15 tests d'intégration passent** (`npm run test:spec`, environ 5 s).

### Travail réalisé

- **Motif des tests entre guillemets** dans `src/api/package.json` (commit `a8a64d4`) : `"./**/*.spec.test.ts"`. Node lit lui-même les `**`, sans que le shell interprète le motif avant lui.
- **Tests de `GET /api/trees/featured`** (commit `3f3a776`, puis compléments) :
  - 3 arbres maximum ;
  - seulement les arbres `available` (ni `out_of_stock`, ni `withdrawn`) ;
  - tri par `id` décroissant ;
  - le plus ancien disparaît quand il y a plus de 3 arbres (`map` + `includes`) ;
  - `200` et `[]` sans arbre, ou sans arbre disponible.
- **Tests de `GET /api/trees`** : `withdrawn` exclu, `out_of_stock` inclus, tri par `id` croissant, `200` et `[]` sans arbre.
- **Tests de `GET /api/trees/:id`** :
  - `200` avec la `description` ;
  - `404` pour un arbre `withdrawn` et pour un id inexistant (`999`) ;
  - `400` et `"Identifiant invalide"` pour `abc`.
- **`src/api/src/app.spec.test.ts`** (nouveau fichier, à côté de `app.ts`) : `GET /api/health` en `200`, route inconnue en `404` avec `{ error: "Ressource introuvable", status: 404 }`.
- **Rangement de `treeController.spec.test.ts`** : un seul `describe("treeController")` qui contient les 3 routes, et le titre de chaque test en français au-dessus de son `it`.

### Décisions

- **Tests d'intégration rangés à côté du fichier testé**, suffixe `.spec.test.ts`. Le dossier `test/` ne contient que les outils partagés : `requester`, `createTree()`, `global-setup.ts`, `.env.test`.
- **BDD de test en mémoire vive** : `--tmpfs /var/lib/postgresql` dans le `docker run` de `test/config/global-setup.ts`. Sans risque : la base est supprimée à la fin des tests.
- **Objets pliés pour une seule propriété, dépliés à partir de deux**, à la main. Aucune option Prettier ne compte les propriétés, et l'idée d'une règle ESLint (`@stylistic/object-curly-newline`) est abandonnée.

### Difficultés

- **Tous les tests annulés** (`cancelled`), avec `PostgreSQL indisponible après 10 tentatives` puis `ECONNRESET` :
  - Docker range ses données sur le disque dur à plateaux (`/mnt/donnees/docker`, sur `sdb`) ;
  - au premier démarrage, PostgreSQL force l'écriture de ses fichiers sur le disque : environ 45 s au total ;
  - `waitForDatabase()` n'attend que 10 s.
  - Avec `--tmpfs`, PostgreSQL démarre en 3 s.
- **`Cannot find package 'axios'`** : déclaré dans `devDependencies`, mais pas encore installé → `npm install` dans `src/api/`.
- **Valeurs de `availability` sans guillemets** (`availability: available`) : JavaScript les lisait comme des variables qui n'existent pas.
- **Message d'erreur attendu faux** : `"invalid id"` alors que `validateId` renvoie `"Identifiant invalide"`.
- **Deux `describe("treeController")`** : le `});` qui fermait le premier était placé avant le bloc `/api/trees`.

### À poursuivre

- Test de `GET /api/trees/:id` pour un arbre `out_of_stock` (attendu : `200`).
- Test du format de la réponse : `price` en nombre, `photoUrl` et `categoryName` en camelCase.
- Ouvrir la PR `feat/test-setup` → `main`. La branche est partie avant l'entrée du 30/10 sur le front : il faudra garder les deux entrées du carnet au moment de la fusion.

## 2026-10-29 — Catalogue `findAllCatalog`, Docker de production et déploiement sur le VPS

Le matin, branche `feat/datamappers/accueil`, fusionnée deux fois dans `back` (09:56 et 11:09). L'après-midi, branche `feat/deployment`, qui part du dernier merge.

**✅ Le déploiement fonctionne.** Le site est en ligne en HTTPS sur le VPS Kourou, avec la branche `feat/deployment` (commit `38729f8`), et tous les tests passent.

### Travail réalisé

- **`findAll` renommée `findAllCatalog`** (commits `4af6ded` 09:47, `eb0df6f` 09:52, même message) :
  - `treeDatamapper.ts` : jointure `JOIN availability ON tree.availability_id = availability.id` ajoutée à la requête du catalogue ;
  - `treeController.ts` : `getAllTrees` appelle `treeDatamapper.findAllCatalog()`.
- **Merge dans `back`** (commit `4e03f6e`, 09:56) : `feat/datamappers/accueil` et `origin`, avec le carnet de Shanna (PR #65).
- **Dockerfile du front** (commit `5351488`, 10:14) : `RUN npm run build` remplace `RUN mkdir -p .next`. Le build crée aussi `.next` au nom de `node`, dont hérite le volume `.next` du dev.
- **Catalogue limité aux arbres en vente** (commit `7651267`, 11:07) :
  - colonnes préfixées par `tree.` (`tree.id`, `tree.name`…) ;
  - `WHERE availability.name = 'available'`.
  - Vérifié : `GET /api/trees` répond en 200, avec 13 arbres, tous `availabilityId: 1`.
- **Merge dans `back`** (commit `12a44b9`, 11:09).
- **Docker de production** (commit `38729f8`, carte #31), d'après la page wiki « Déployer sur un VPS Kourou, pas à pas » :
  - `src/docker-compose.prod.yml` : 4 services (`db`, `api`, `front`, `nginx`), plus `certbot` lancé à la demande (profil `outils`), et `name: graine` ;
  - `src/api/Dockerfile.prod` et `src/front/Dockerfile.prod` : construction en deux étapes, utilisateur `node` ;
  - `src/nginx/default.conf.template` : HTTP renvoyé vers HTTPS, `/api/` vers l'API, le reste vers le front ;
  - `src/.env.prod.example` ;
  - `output: "standalone"` dans `next.config.ts` ;
  - `!.env.prod.example` et `certbot/` dans `src/.gitignore` ;
  - pile testée d'abord en local, sous un autre nom de projet Docker (images de 177 Mo pour l'API, 209 Mo pour le front).
- **Déploiement sur le VPS** (<https://dimitrydereppe-server.eddi.cloud>) :
  - clé SSH créée sur la VM ;
  - clone, puis `git fetch` et `git switch feat/deployment` ;
  - `.env` rempli (`chmod 600`) ;
  - `up -d --build db api front` ;
  - certificat d'essai (`--staging`), puis vrai certificat Let's Encrypt ;
  - `up -d nginx`.
- **Vérifications** :
  - depuis Internet :
    - certificat Let's Encrypt reconnu, valable jusqu'au 27/01/2027 ;
    - `http://…/api/trees` renvoie `301` vers HTTPS ;
    - `https://…/` répond `200` ;
    - `/api/trees` renvoie 13 arbres, `/api/trees/featured` répond `200` ;
    - ports 3000, 4000, 5432, 5433 et 8080 fermés ;
  - sur la VM :
    - 4 conteneurs `Up`, `db` en `(healthy)` ;
    - `nginx -t` OK ;
    - seuls 22, 80 et 443 sont à l'écoute sur `0.0.0.0` ;
    - `restart: unless-stopped` sur les 4 conteneurs ;
    - 21 arbres en base.
- **Documentation** :
  - `docs/specifications/CAHIER-DES-CHARGES-JE-S-APPELLE-GRAINE.md` (justification des choix) et `docs/conception/diagrammes/01-architecture.md` : décision Nginx et Certbot en conteneur ;
  - Follow « Déployer sur un VPS Kourou » mis à jour (local et wiki, page 152) : chemins `src/`, pièges, check-list de vérifications sur la VM.

### Décisions

- **Nginx et Certbot dans des conteneurs**, et non installés sur le VPS (cf. cahier des charges et architecture). Raisons :
  - leur configuration est versionnée dans le dépôt et relue en PR ;
  - Nginx joint l'API et le front par leur nom de service (`api`, `front`) sur le réseau Docker, sans que leurs ports soient publiés ;
  - la pile de production se teste d'abord en local ;
  - un VPS neuf se remet en service avec `git clone` puis `docker compose`.
  - Contrepartie : quelques commandes Certbot de plus qu'un `certbot --nginx` (`--standalone`, puis `--webroot` et une tâche cron).
- **`name: graine` dans le compose de prod** : sans ce nom, Compose prendrait le nom du dossier (`src`), le même que le dev, et remplacerait les conteneurs de dev si on lançait la prod sur son poste.
- **Pas de Node sur le VPS** : il tourne dans les images.
- **Tester une branche sur le VPS avant de la fusionner** : elle doit être poussée, puis récupérée avec `git fetch` et `git switch`.

### Difficultés

- **`/api/trees` en 500 après `eb0df6f`** : `syntax error at or near "availability"`, en dev comme en prod.
  - Le premier `JOIN` avait été placé après le `;` de `FROM tree;`, donc hors de la requête.
  - En voulant corriger, le `;` est devenu une virgule (`FROM tree,`). Or un `JOIN` suit directement la table, sans virgule.
  - Une fois la virgule retirée, `id` et `name` devenaient ambigus : les tables `tree` et `availability` ont toutes les deux ces colonnes. D'où le préfixe `tree.` partout, comme dans `findFeatured()`.
- **Sur le VPS** :
  - `git clone` : `Permission denied (publickey)`, parce qu'il n'y avait pas encore de clé SSH sur la VM ;
  - `apt install npm` : série de `404 Not Found`, parce que la liste des paquets n'était pas à jour (`apt update` d'abord). Et npm était de toute façon inutile ;
  - `cp .env.prod.example .env` : `cannot stat`, commande lancée à la racine alors que le fichier est dans `src/` ;
  - Certbot `--staging` : `Service busy; retry later.`, serveur de test de Let's Encrypt surchargé. Ça a marché en relançant.
- **Écarts avec le wiki** :
  - SQL dans `api/src/data/` ;
  - `index.ts` et `config.ts` à copier dans l'image de l'API ;
  - pas de dossier `public/` dans le front ;
  - la vérification `config --env-file …` échoue (`env_file: .env` obligatoire).

### À poursuivre

- **PR de `feat/deployment`** vers `back` / `main`, avec les deux documents (`docs/`) à commiter.
- **Sur le VPS** : renouvellement automatique du certificat (`--dry-run`, puis ligne cron avec le chemin `…/src`) et sauvegarde de la base. `crontab -l` est encore vide.
- **À valider avec l'équipe** : le seed dit que `out_of_stock` doit rester « visible, non commandable ». Or le catalogue masque maintenant les 5 arbres en rupture. Deux options : `WHERE availability.name <> 'withdrawn'` (18 arbres), ou mettre à jour le commentaire du seed.
- `/api/health` est en commentaire dans `index.router.ts` : à rétablir, c'est le test de déploiement le plus simple.
- Les photos des arbres ne sont pas servies (`express.static`). Il faudra ensuite copier les images dans `Dockerfile.prod`.
- Mot de passe admin à changer en production quand argon2 et la connexion seront en place.

## 2026-10-28 (après-midi) — Datamapper `tree` et routes `/api/trees` de l'accueil

Branche `feat/datamappers/accueil`, PR #61 fusionnée à 15:44 (après la PR #60 `.gitignore`, fusionnée à 10:29).

### Travail réalisé

- **`src/api/src/datamappers/treeDatamapper.ts`** (commit `23c7469`) : objet `treeDatamapper` avec deux méthodes qui interrogent la base via `pool.query` :
  - `findAll()` : tous les arbres ;
  - `findFeatured()` : les arbres mis en avant sur la page d'accueil.
- **Types** dans `src/api/src/@types/index.d.ts` (commit `8797a2b`) : `ITree` et `IFeaturedTree`, importés dans le datamapper pour typer les retours (`Promise<ITree[]>`, `Promise<IFeaturedTree[]>`).
- **Commentaires** dans le datamapper (commit `70833ad`) : rôle de chaque méthode, ligne par ligne pour la requête SQL.
- **Export nommé** (commit `73a8ed0`) : `export const treeDatamapper` à la place de `export default`, comme les autres modules du projet (`export const router`...), et pour éviter un conflit au merge avec le controller.
- **Merge de `origin/feat/router-acceuil`** dans ma branche (commit `2c7d781`) : récupère le controller (Fabrice, `878277f`) et le router `tree` (Mahamadou, `80ef8f9`) pour tester la chaîne complète route → controller → datamapper → base.
- **Corrections après le merge** (commit `479da8d`) :
  - `treeRouter.ts` : routes écrites `/trees` et `/trees/featured` au lieu de `/api/trees...`. Le préfixe `/api` est déjà ajouté par `app.use("/api", ...)` dans `app.ts` ; sinon l'adresse devenait `/api/api/trees`.
  - `app.ts` : suppression du second `app.use("/api", treeRouter)`, le router `tree` étant déjà branché dans `index.router.ts`.
  - `findFeatured()` réécrite d'après le vrai schéma : jointure `tree.availability_id = availability.id`, filtre `availability.name = 'available'`, `ORDER BY tree.id` (sans tri, PostgreSQL ne garantit aucun ordre), `LIMIT 3`. Colonnes préfixées par `tree.` parce que `availability` a aussi des colonnes `id` et `name`.
  - Prix renvoyé en nombre : `CAST(price AS FLOAT)` dans les deux requêtes. `price` est en `NUMERIC`, que `pg` renvoie en texte (`"9.90"`).
  - `IFeaturedTree` aligné sur les colonnes réellement renvoyées (`photo_url`, `category_id`).
  - `test/test.tree.http` : requête `GET http://localhost:4000/api/trees/featured`.

### Difficultés

- **Première version de `findFeatured()` incompatible avec le schéma** : elle supposait une table `availability` avec `tree_id`, `is_available`, `start_date` et `end_date`, alors que c'est `tree` qui pointe vers `availability` (`availability_id`), et `availability` ne contient qu'un statut (`name`). La requête contenait aussi `trees.id` (table `tree` au singulier) et deux `WHERE` à la suite (il faut un seul `WHERE` avec `AND`).
- **Route introuvable après le merge** : le préfixe `/api` était écrit à la fois dans `app.ts` et dans `treeRouter.ts` → `/api/api/trees`.

### À poursuivre

- Le commit `9b72536` (message avec les commentaires du Dockerfile sur une ligne) est maintenant poussé et fusionné : on ne le corrige plus avec `--amend`, on le laisse tel quel.
- Fabrice a ensuite passé les réponses en camelCase et ajouté `planting_location` (`b693daa`, `826a432`, PR #63) : vérifier que `IFeaturedTree` correspond toujours aux colonnes renvoyées.
- Toujours en attente : CORS avec l'origine du front, emplacement de `db-client.ts`, `src/package-lock.json` vide.

## 2026-10-28 — Conteneurs front et API sous l'utilisateur `node`

Travail solo, avec l'aval du groupe.

### Travail réalisé

- **Diagnostic « Cannot GET » et « connexion échouée »** : db, adminer et api tournaient, mais le conteneur `front` était resté à l'état `Created`, sans jamais démarrer. Cause : `failed to bind host port 0.0.0.0:3000/tcp: address already in use`. Le port 3000 était déjà occupé par un autre programme au moment du `up`.
  - Le `Cannot GET /` sur le port 4000 est la page 404 par défaut d'Express. Toutes les routes sont sous `/api` (`/api/health`, `/api/trees`), donc ce n'est pas une panne.
- **Front reconstruit** avec l'image à jour (`USER node`, commit `b28e153`) :
  - commandes : `rm -sf front`, puis `docker volume rm src_front-next src_front-node-modules`, puis `up -d --build front` ;
  - vérifié : `docker compose exec front whoami` → `node`.
- **Dockerfile de l'API** (commit `9b72536`), même modèle que le front :
  - `RUN chown node:node /api` puis `USER node` ;
  - `--chown=node:node` sur les `COPY`, parce que `COPY` écrit en root même après `USER`.
  - Image reconstruite (`npm run build` passe), conteneur recréé, `whoami` → `node`.
- **Ports** : `API_HOST_PORT` remis à `4000` dans `.env.docker` (il valait `4001`), cohérent avec `API_URL=http://localhost:4000/api/`. État vérifié : front sur 3000 (200), api sur 4000, db sur 5433, adminer sur 8080.
- **`.gitignore`** (commits `a813e13`, `6249bd7`) : exceptions `!.env.example` et `!.env.docker.example`, pour que les modèles d'environnement soient suivis par git alors que les `.env*` sont ignorés.

### Difficultés

- **Pre-commit en échec avec `EACCES: permission denied, open '.../src/front/next-env.d.ts'`** :
  - `next-env.d.ts` et `.next` appartenaient à root. Ils avaient été créés le 27/10 à 17:00 par le conteneur front, dont l'image (construite à 16:59) tournait encore en root. La correction `USER node` n'est arrivée qu'à 23:16, et une image ne change pas tant qu'on ne la reconstruit pas.
  - Le hook lance `npm --prefix src/front run typecheck`, donc `next typegen`, qui réécrit `next-env.d.ts` → refusé.
  - Débloqué avec `sudo chown -R $USER:$USER src/front/next-env.d.ts src/front/.next`. Le premier essai a échoué (« Aucun fichier ou dossier de ce nom ») parce que la commande n'était pas lancée depuis la racine du dépôt : les chemins relatifs partent du dossier courant (`pwd`).
- **Les volumes nommés gardent les propriétaires de leurs fichiers** : un volume rempli par root reste à root après la reconstruction de l'image. Il faut supprimer les volumes du service concerné (pas `down -v`, qui efface aussi `db-data`).
- `docker compose ps` lancé sans `--env-file .env.docker` affiche des dizaines d'avertissements « variable is not set » et échoue (`no port specified`).

### À poursuivre

- Revoir le message du commit `9b72536`, qui contient les commentaires du Dockerfile collés sur une seule ligne (à corriger avant la PR, par exemple `git commit --amend` tant qu'il n'est pas poussé).
- Vérifier si les doublons `api/data/` et `api/public/` (cf. 27/10) reviennent encore maintenant que l'ancienne image `src-api` a été remplacée.
- Toujours en attente : CORS avec l'origine du front, emplacement de `db-client.ts`, `src/package-lock.json` vide.

## 2026-10-27 — Un seul dossier de données (`api/src/data`)

### Travail réalisé

- Suppression des doublons `src/api/data/` et `src/api/public/` (`git rm -r`, 49 fichiers) :
  - `data/` contenait les mêmes fichiers que `src/data/` (sans `db-client.ts`, utilisé par le routeur) ;
  - `public/` contenait les images en double (`public/images/` et `public/public/images/`), toutes déjà présentes dans `src/public/`, et aucun code n'y faisait référence.
- Chemins mis à jour vers `src/data/` : montages `initdb.d` de `docker-compose.yml` (lignes 37-38), script `db:seed` de `package.json` et `README.md`. Vérifié avec `docker compose config --quiet`.
- Question réglée au passage : pas besoin de `DROP TABLE` en tête de `01-schema.sql`. `initdb.d` ne s'exécute que sur un volume vide, et `db:reset` fait déjà `DROP SCHEMA public CASCADE` avant de rejouer le schéma.
- **État final (commit `d33dcc2`)** : données dans `src/api/src/data/`, images dans `src/api/src/public/`. Fichiers ramenés avec `git mv` : git les voit comme renommés (`R`), l'historique est conservé.
- **`src/api/.gitignore`** : ajout de `/data/` et `/public/`. Le `/` au début limite la règle aux dossiers situés à côté du `.gitignore` (`src/api/data`, `src/api/public`). Sans lui, git ignorerait aussi `src/api/src/data` et `src/api/src/public`.
- **Dossiers des couches de l'API** créés dans `src/api/src/` d'après le [[docs/conception/diagrammes/01-architecture|diagramme d'architecture]] : `middlewares/`, `controllers/`, `services/`, `datamappers/`. Chacun contient un `.gitkeep`, parce que git ne suit pas les dossiers vides.
- Vérifié sur un volume neuf (`down -v` puis `up -d`) : 8 tables et 21 arbres chargés depuis `api/src/data/`.
- **`src/.env.docker.example`** (commit `d33dcc2`) : ajout d'un bloc `# API` avec `NODE_ENV`, `DATABASE_URL` (hôte `db`, le nom du service Compose), `API_PORT=4000` et `API_HOST_PORT=4001`. Le modèle reflète maintenant les variables lues par le service `api`.

### Difficultés

- Risque repéré avant la suppression : `docker-compose.yml` montait encore `./api/data/...`. Sans mise à jour, Docker aurait recréé des dossiers vides appartenant à root à la place des fichiers SQL, comme le 2026-10-26 → chemins corrigés dans le même commit.
- **Les doublons réapparaissent après chaque commit de nettoyage**, en fichiers non suivis (`??`) : à 07:50 après le commit de 07:44, à 09:10 et à 09:20. Les fichiers sont complets, m'appartiennent (pas à root) et sont écrits un par un, environ 0,4 s par fichier. Ils correspondent exactement au contenu de l'ancienne image `src-api` (construite le 26/10 à 16:49) : `data/`, `public/images`, `public/public`, `src/data`, `src/public`.
  - Cause non trouvée. Ce n'est ni git (rien dans le reflog), ni le conteneur (il tourne en root et l'API n'écrit aucun fichier), ni un outil de synchronisation.
  - J'ai d'abord pensé à `docker compose up -d`, mais la séquence `down -v` puis `up -d` lancée depuis un autre shell ne les recrée pas : testée 4 fois.
  - Piste restante : un programme lancé depuis VS Code (extension Docker, Container Tools ou Dev Containers ?).
  - Parade : la règle `.gitignore` ci-dessus. Même s'ils reviennent, git ne les affiche plus.
  - Ils sont revenus une fois de plus à 09:30 (`api/data/` et `api/public/`, après le commit de 09:19). Cette fois `git status --ignored` les marque `!!` (ignorés) et non plus `??` : la parade fonctionne.
- Au passage, aller-retour sur l'emplacement des données (`api/data` ↔ `api/src/data`) entre les commits `13d2acd`, `af8fbb6` et `d33dcc2`.

### À poursuivre

- ~~Retester sur un volume neuf que le schéma et le seed sont bien chargés depuis `api/src/data/`~~ → fait (8 tables, 21 arbres).
- Trouver ce qui recrée les dossiers : lancer `ls api ; docker compose --env-file=.env.docker up -d ; ls api` dans le terminal de VS Code, puis dans un terminal hors de VS Code, et comparer.
- Reconstruire l'image (`up -d --build`) : celle du 26/10 contient encore `data/`, `public/public`, `src/errors` et `src/lib`.
- Placer `db-client.ts` (actuellement dans `src/data/`) : il relève plutôt des datamappers ou d'un dossier de configuration de la base.
- **CORS, maintenant que le front existe** (Next.js initialisé par Loïc dans `src/front/`, commits `db5cee2` et `e9c776a`) : `app.ts` appelle `cors()` sans option, donc toutes les origines sont acceptées, et `config.allowedOrigins` (`ALLOWED_ORIGINS`, `*` par défaut) n'est lu nulle part. À brancher avec l'origine du front (`http://localhost:3000` en dev, port par défaut de Next.js).
- `src/package-lock.json` vide (`"packages": {}`) ajouté par `db5cee2`, sans `package.json` à côté : sans doute un `npm install` lancé depuis `src/`. À signaler à Loïc avant de le supprimer.

## 2026-10-26 — API dans Docker : démarrage, rechargement automatique et première requête

### Travail réalisé

- **Service `api` du compose** (`src/docker-compose.yml`), en mode développement :
  - bind mount `./api:/src/app.ts` (le `WORKDIR` du Dockerfile) et `command: ["npm", "run", "dev"]` : `tsx watch` relance l'API à chaque sauvegarde, sans `--build` (testé : `[tsx] change in ./src/app.ts Restarting...` puis `Server ready`) ;
  - volume nommé `api-node-modules` monté sur `node_modules`, pour que le `node_modules` de la machine ne recouvre pas celui de l'image ;
  - `depends_on` avec `condition: service_healthy` : l'API attend que `pg_isready` réponde.
- **`src/api/.dockerignore`** complété (`dist`, `node_modules`, `.env*`, tests, README...).
- **Script `docker:start`** ajouté dans `package.json` (le `CMD` du Dockerfile) : il lance le code compilé et reste prévu pour la prod.
- **Première requête vers la base depuis l'API** :
  - `src/api/src/data/db-client.ts` crée un client `pg` à partir de `DATABASE_URL` et se connecte au démarrage ;
  - route de test `GET /api/` dans `index.router.ts` : elle exécute `SELECT * FROM tree;` et renvoie les lignes en JSON.

### Difficultés

- **Conteneur `src-api` en `Restarting (1)` et rien sur `localhost:4000`** → `npm error Missing script: "docker:start"` : le `CMD` appelait un script absent de `package.json` → script ajouté.
- **API plantée au premier lancement** avec `the database system is starting up` (code `57P03`) → `depends_on: - db` attend que le conteneur soit démarré, pas que PostgreSQL soit prêt → `condition: service_healthy`.
- **`npm install` en échec pendant le build (`EJSONPARSE`)** → `package.json` cassé lors d'une modification : accolades de `scripts` et `allowScripts` mal fermées, `dotenv` et `@types/cors` retirés alors qu'ils sont encore importés, `db:seed` supprimé et scripts `db:*` privés de `-f ../docker-compose.yml --env-file ../.env.docker` (sans eux, Compose lit `api/.env`, où il n'y a pas les ports) → fichier rétabli sur la version du dernier commit, plus `docker:start`.
- **`localhost:4000/` répond 404** → normal : toutes les routes sont sous `/api`.

### À poursuivre

- ~~`start_period` dans le healthcheck de `db`~~ → fait : sur un volume neuf, `up -d` donnait `dependency failed to start: container src-db-1 is unhealthy` (initialisation d'environ 30 s, alors que le healthcheck abandonne au bout d'environ 25 s) → `start_period: 90s`, puis ramené à `30s` (commit `cd42e85`). Pas encore retesté sur un volume neuf (`down -v`) : avec 30 s, la marge est faible si l'initialisation dure près d'une minute.
- ~~**Ligne `test:` du healthcheck à vérifier**~~ → corrigé : guillemet remis après `$$POSTGRES_DB`, la commande redevient un seul élément (`"pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"`, vérifié avec `docker compose config`). Elle avait été modifiée dans le même commit : `[ "CMD-SHELL", "pg_isready", -U $$POSTGRES_USER -d $$POSTGRES_DB" ]`. Les guillemets ne sont plus appariés et `docker compose config` y lit 3 éléments au lieu d'un seul. Avec `CMD-SHELL`, seul le 2ᵉ élément est exécuté : `pg_isready` tourne sans `-U` ni `-d`.
- Route de test `GET /api/` : à remplacer par les vraies routes (`/api/trees`...) et retirer le `console.log`.
- Après ajout d'une dépendance npm : `docker volume rm src_api-node-modules`, puis `up -d --build`.
- Renommer le `WORKDIR` `/src/app.ts` en `/app` (et le bind mount avec).

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
- ~~Garder un seul dossier de données : `api/data/` et `api/src/data/` contiennent les mêmes fichiers.~~ → fait le 2026-10-27 (`api/src/data/` conservé).
- Installer l'extension VS Code YAML (Red Hat) : elle signale les erreurs de `docker-compose.yml` pendant la frappe.

## 2026-10-23 — Jeu de données JSON et photos des arbres

### Travail réalisé

- **Jeu de données en JSON** : [bdd-arbres.json](src/api/src/data/bdd-arbres.json), tiré de [[Apothéose/divers/bdd arbres|bdd arbres]]. Il reprend les noms de tables et de colonnes du [[Apothéose/apo-jesappellegraine/docs/conception/modele-de-donnees/00-dictionnaire-de-donnees|dictionnaire de données]] : `role`, `availability`, `category`, `account`, `tree`.
  - **10 comptes** : 5 admins (Dimitry, Loïc, Shanna, Mahamadou, Fabrice) et 5 clients de test, dont 2 bloqués (`is_active: false`). Les clients couvrent les 3 types de compte : particulier, association, entreprise.
  - **21 arbres répartis** : 13 disponibles, 5 en rupture (If, Sorbier, Chêne tauzin, Chêne-liège, Olivier sauvage), 3 retirés (Épicéa, Laurier noble, Pin parasol). Chaque lieu garde au moins 2 arbres disponibles.
- **Photos des arbres** : [src/api/src/public/images/trees/](src/api/src/public/images/trees/) (copie dans [src/front/public/images/trees/](src/front/public/images/trees/)).
  - 21 photos d'arbres **entiers**, prises sur **Wikimedia Commons** : 19 sous licence CC BY ou CC BY-SA, 2 dans le domaine public. Elles remplacent les anciennes photos Pexels et Commons, qui montraient souvent seulement un détail (écorce, baies, feuilles).
  - Converties en **WebP**, 1200 px maximum sur le plus grand côté, de 180 à 440 Ko chacune.
  - Les noms de fichiers suivent le chemin `/images/trees/<arbre>.webp` attendu par le seed SQL. Les `photo_url` du JSON ont été mis à jour : les 21 fichiers existent bien.
  - Les crédits (auteur, licence, page source) sont dans [[Apothéose/apo-jesappellegraine/src/api/src/public/images/trees/CREDITS|CREDITS]] et `credits.json`.

### Décisions

- **Les crédits des photos sont obligatoires** pour les licences CC BY et CC BY-SA : il faut citer l'auteur et la licence (avec un lien). Comme les photos ont été redimensionnées et converties, il faut aussi le signaler (« redimensionnée »).
- **Les crédits restent hors de la table `tree`** pour l'instant : le dictionnaire de données n'a pas de colonne pour l'auteur ou la licence.
- **Les mots de passe du JSON sont en clair** (comptes de test seulement). Un script qui lirait ce JSON devrait les hacher avec Argon2 avant l'`INSERT`.

### À poursuivre

- Aligner `02-seed.sql` sur le JSON : le seed n'a qu'un admin et seulement 2 arbres non disponibles (20 retiré, 21 épuisé). → **Fait** (vérifié le 02/11 : 10 comptes, 13 disponibles, 5 en rupture de stock, 3 retirés).
- Remplacer les noms de famille provisoires (« GreenRoots ») des 4 autres admins dans le JSON. → **Fait** (vérifié le 02/11).
- Copier `public/images/trees/` dans le dossier du front. → **Fait** (vérifié le 02/11 : 21 photos dans `src/front/public/images/trees/`).
- Choisir où stocker les crédits des photos (fichier à part ou colonne dans `tree`) et les afficher sous chaque photo. → Stockés dans `CREDITS.md` et `credits.json` ; **pas encore affichés** dans le front (au 02/11).
- Mettre à jour la section « Photos » de [[Apothéose/divers/bdd arbres|bdd arbres]], qui décrit encore les anciennes photos. → **Toujours à faire** au 02/11 (la section parle encore de Pexels).

## 2026-10-23 — Versions communes et scripts SQL

### Travail réalisé

- **Scripts SQL de la base**, préparés pour la session de lundi (étape 4) :
  - `01-schema.sql` : l'extension `unaccent` et les 8 tables, avec leurs contraintes ;
  - `02-seed.sql` : les rôles, les catégories, les disponibilités, 21 arbres (dont un retiré et un épuisé, pour les tests de l'accueil) et le premier compte admin (mot de passe haché en Argon2).
- Les deux scripts ont été testés sur PostgreSQL 18 dans Docker : tables, données, contraintes et suppressions.

### Décisions (prises avec Loïc)

| Outil                               | Version retenue |
| ----------------------------------- | --------------- |
| Node.js                             | **24 LTS**      |
| PostgreSQL                          | **18**          |
| pg (client PostgreSQL pour Node.js) | **8.23**        |
| TypeScript                          | **5**           |
| Next.js                             | **16**          |

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
