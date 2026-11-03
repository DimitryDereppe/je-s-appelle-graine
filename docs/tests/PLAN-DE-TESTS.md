# Plan de tests — Je s’appelle Graine

Ce document liste, feature par feature, les cas à vérifier, leur type et le résultat obtenu.

- **Types de test** :
  - **Intégration** : test automatisé de l'API (requête HTTP + base de test), lancé par `npm run test:spec` dans `src/api/`. Fichiers `*.spec.test.ts` rangés à côté du fichier testé.
  - **Manuel** : vérification à la main dans le navigateur, sur le site en ligne.
  - **Audit** : rapport Lighthouse (accessibilité, SEO, bonnes pratiques, performance).
- **Statuts** : ✅ conforme · ❌ non conforme (un problème à corriger, avec sa carte) · ⏳ pas encore testable.
- Pour ajouter une feature : copier un tableau, garder les mêmes colonnes, numéroter les cas `F<n>-<type>-<numéro>`.

## F1 · Accueil (US01)

Critères d'acceptation : voir l'issue #1. Vérifications du 30/10/2026 sur <https://dimitrydereppe-server.eddi.cloud/>.

### Tests d'intégration — `GET /api/trees/featured`

Fichier : `src/api/src/controllers/treeController.spec.test.ts` (branche `back`, PR #78). Les 6 cas passent.

| N°       | Cas                                             | Type        | Attendu                                                                                                | Obtenu      |
| -------- | ----------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ | ----------- |
| F1-INT-1 | 4 arbres disponibles en base                    | Intégration | `200`, 3 arbres seulement                                                                              | ✅          |
| F1-INT-2 | 2 disponibles, 1 en rupture, 1 retiré           | Intégration | `200`, seulement les 2 disponibles                                                                     | ✅          |
| F1-INT-3 | 3 arbres disponibles                            | Intégration | `200`, triés par `id` décroissant                                                                      | ✅          |
| F1-INT-4 | 4 arbres disponibles                            | Intégration | les 3 plus récents, le plus ancien est exclu                                                           | ✅          |
| F1-INT-5 | Aucun arbre en base                             | Intégration | `200` et `[]`                                                                                          | ✅          |
| F1-INT-6 | Aucun arbre disponible (1 en rupture, 1 retiré) | Intégration | `200` et `[]`                                                                                          | ✅          |
| F1-INT-7 | Format d'une vignette                           | Intégration | `price` en nombre ; `photoUrl`, `categoryName`, `plantingLocation` en camelCase ; pas de `description` | ⏳ à écrire |

Tests communs à toute l'API (`src/api/src/app.spec.test.ts`) : `GET /api/health` en `200`, route inconnue en `404` avec `{ error: "Ressource introuvable", status: 404 }`. Les 2 cas passent.

### Tests manuels — page `/`

Navigateur : Firefox 157 (bureau 1280 px et mobile 375 px).

| N°        | Cas                                          | Type   | Attendu                                                                                  | Obtenu                                                                                                                                   |
| --------- | -------------------------------------------- | ------ | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| F1-MAN-1  | Ouvrir l'accueil                             | Manuel | les 3 arbres de `/api/trees/featured` : Chêne vert, Filaire à larges feuilles, Arbousier | ❌ Pin maritime, Pin sylvestre, Pin d'Alep (les 3 plus anciens du catalogue)                                                             |
| F1-MAN-2  | Ordre des vignettes                          | Manuel | le plus récent en premier                                                                | ❌ le plus ancien en premier                                                                                                             |
| F1-MAN-3  | Arbre en rupture ou retiré                   | Manuel | jamais affiché sur l'accueil                                                             | ❌ possible : l'accueil lit le catalogue, qui contient les arbres en rupture                                                             |
| F1-MAN-4  | Contenu d'une vignette                       | Manuel | photo avec texte alternatif, nom, catégorie, prix TTC                                    | ❌ pas de catégorie ; prix affiché `9.9 TTC` (sans `€` ni 2 décimales)                                                                   |
| F1-MAN-5  | Présentation et bouton « Voir le catalogue » | Manuel | texte de présentation, bouton qui mène au catalogue                                      | ❌ présentation OK ; le bouton « Voir nos arbres » est un `<button>` sans lien                                                           |
| F1-MAN-6  | API en panne                                 | Manuel | message d'erreur lisible sur la page                                                     | ❌ la page lance une erreur (`throw new Error`) : page d'erreur de Next.js                                                               |
| F1-MAN-7  | Aucun arbre disponible                       | Manuel | message « aucun arbre disponible »                                                       | ❌ pas de message ; avec moins de 3 arbres, `treesAll[i]` vaut `undefined` et la page plante                                             |
| F1-MAN-8  | Affichage mobile (375 px)                    | Manuel | lisible, pas de défilement horizontal                                                    | ✅ largeur de page = largeur d'écran                                                                                                     |
| F1-MAN-9  | Navigation au clavier (touche Tab)           | Manuel | tous les liens et boutons atteignables, focus visible                                    | ✅ ordre logique (en-tête, bouton, paniers, pied de page), contour de 3 px                                                               |
| F1-MAN-10 | Langue de la page                            | Manuel | `<html lang="fr">`                                                                       | ❌ `lang="en"` : un lecteur d'écran lit le texte avec l'accent anglais                                                                   |
| F1-MAN-11 | Liens de l'en-tête et du pied de page        | Manuel | pas d'erreur 404                                                                         | ⏳ `/qui-sommes-nous`, `/connexion`, `/panier`, `/mentions-legales`, `/politique-de-confidentialite` en 404 (pages des sprints suivants) |

### Audit Lighthouse

Lighthouse 12.8.2, Chromium 156, le 30/10/2026. Objectif de la carte #45 : accessibilité et SEO à 90 ou plus.

| N°       | Catégorie        | Mobile | Bureau | Attendu | Obtenu             |
| -------- | ---------------- | ------ | ------ | ------- | ------------------ |
| F1-AUD-1 | Accessibilité    | 96     | 96     | ≥ 90    | ✅                 |
| F1-AUD-2 | SEO              | 82     | 82     | ≥ 90    | ❌                 |
| F1-AUD-3 | Bonnes pratiques | 93     | 93     | —       | ✅                 |
| F1-AUD-4 | Performance      | 83     | 100    | —       | mobile à améliorer |

Problèmes relevés :

- **SEO et accessibilité** — pas de `<title>` ni de `<meta name="description">` : `layout.tsx` n'exporte pas d'objet `metadata`. C'est ce qui fait perdre le plus de points.
- **Accessibilité** — le lien du logo dans le pied de page a `aria-label="Je m’appelle Graine, accueil"` (faute : « m’appelle »), alors que le texte visible est « Je s’appelle Graine ». Le nom lu par un lecteur d'écran ne correspond plus au texte affiché (`Footer.tsx`, ligne 20).
- **Accessibilité** — la grande image d'accueil a `alt="Arbre"` : un texte plus précis aiderait (« Pin maritime », ou `alt=""` si elle est décorative).
- **Bonnes pratiques** — l'icône « Des arbres sélectionnés » (`arbres-selectionnes.png`, 200 × 263) est affichée en 24 × 24, donc déformée ; erreurs 404 dans la console (liens ci-dessus).
- **Performance mobile** — la grande image d'accueil est chargée en différé (`loading="lazy"`), alors que c'est le plus gros élément visible : affichage complet en 4,7 s. Images des vignettes plus grandes que nécessaire (environ 570 Kio de trop).

## F3 · Authentification (US05, US05b, US07, US20, US21, US40)

Critères d'acceptation : voir l'issue #3 ; contrat d'API : carte #83. Tests de la carte #88, branche `feat/tests-auth`, le 03/11/2026.

### Tests d'intégration — inscription `POST /api/users`

Fichier : `src/api/src/controllers/userController.spec.test.ts`. Les 7 cas passent.

| N°       | Cas                                                  | Type        | Attendu                                                                      | Obtenu |
| -------- | ---------------------------------------------------- | ----------- | ---------------------------------------------------------------------------- | ------ |
| F3-INT-1 | Inscription valide, sans type de compte ni structure | Intégration | `201`, `accountType: "particulier"`, `role: "customer"`, pas de mot de passe | ✅     |
| F3-INT-2 | Mot de passe de 11 caractères                        | Intégration | `400`, « Le mot de passe doit contenir au moins 12 caractères. »             | ✅     |
| F3-INT-3 | Email déjà utilisé                                   | Intégration | `409`, « Cet email est déjà utilisé. »                                       | ✅     |
| F3-INT-4 | Body envoyé comme un formulaire HTML (pas du JSON)   | Intégration | `415` (`validateContentType`, protection CSRF)                               | ✅     |
| F3-INT-5 | Prénom vide, email invalide                          | Intégration | `400`, « Prénom obligatoire. » / « Email invalide. »                         | ✅     |
| F3-INT-6 | Mot de passe enregistré                              | Intégration | haché en Argon2 en base (commence par `$argon2`, jamais en clair)            | ✅     |

### Tests d'intégration — connexion et déconnexion `POST /api/auth`, `DELETE /api/auth`

Fichier : `src/api/src/controllers/authController.spec.test.ts`. Les 11 cas passent.

| N°        | Cas                                    | Type        | Attendu                                                 | Obtenu |
| --------- | -------------------------------------- | ----------- | ------------------------------------------------------- | ------ |
| F3-INT-7  | Connexion valide                       | Intégration | `200`, cookie `accessToken` posé                        | ✅     |
| F3-INT-8  | Options du cookie                      | Intégration | `HttpOnly`, `SameSite=Lax`, `Max-Age` de 24 h, `Path=/` | ✅     |
| F3-INT-9  | Contenu du jeton                       | Intégration | JWT valide avec `userId`, `userRole`, expiration à 24 h | ✅     |
| F3-INT-10 | Mauvais mot de passe                   | Intégration | `401`, sans dire si l'email existe                      | ✅     |
| F3-INT-11 | Email inconnu                          | Intégration | `401`, même message que le mauvais mot de passe         | ✅     |
| F3-INT-12 | Compte désactivé (`is_active = false`) | Intégration | `403`                                                   | ✅     |
| F3-INT-13 | Email invalide                         | Intégration | `400`                                                   | ✅     |
| F3-INT-14 | Mot de passe vide                      | Intégration | `400`                                                   | ✅     |
| F3-INT-15 | Mot de passe absent                    | Intégration | `400`                                                   | ✅     |
| F3-INT-16 | Déconnexion d'un utilisateur connecté  | Intégration | `204`, cookie vidé                                      | ✅     |
| F3-INT-17 | Déconnexion sans cookie                | Intégration | `401` (`isConnected` sur `DELETE /api/auth`)            | ✅     |

Test commun à toute l'API (`src/api/src/app.spec.test.ts`) : un JSON mal formé dans le body répond `400` avec « Les données envoyées sont mal formées. » (et non `500`). Le cas passe.

### Tests d'intégration — utilisateur connecté `GET /api/users/me`

Fichier : `src/api/src/controllers/userController.spec.test.ts`. Les 3 cas passent.

| N°        | Cas                       | Type        | Attendu                                                                                              | Obtenu |
| --------- | ------------------------- | ----------- | ---------------------------------------------------------------------------------------------------- | ------ |
| F3-INT-21 | Utilisateur connecté      | Intégration | `200`, exactement `id`, `firstname`, `lastname`, `email`, `role` (même réponse que `POST /api/auth`) | ✅     |
| F3-INT-22 | Sans cookie               | Intégration | `401`, « Vous devez être connecté. »                                                                 | ✅     |
| F3-INT-23 | Cookie avec un jeton faux | Intégration | `401`, même message que sans cookie                                                                  | ✅     |

### Tests d'intégration — droits

| N°        | Cas                                           | Type        | Attendu                                                                 | Obtenu |
| --------- | --------------------------------------------- | ----------- | ----------------------------------------------------------------------- | ------ |
| F3-INT-18 | Route `/api/admin/...` sans être connecté     | Intégration | `401`, « Vous devez être connecté. »                                    | ✅     |
| F3-INT-19 | Route `/api/admin/...` avec un client         | Intégration | `403`, « Accès réservé à l'administrateur. »                            | ✅     |
| F3-INT-20 | Route `/api/admin/...` avec un administrateur | Intégration | passe `isConnected` et `checkRoles` (aucune route admin encore : `404`) | ✅     |

Fichier : `src/api/src/controllers/userController.spec.test.ts`. Le routeur `adminRouter.ts` est vide en attendant F7, F8 et F9 : le test « administrateur » vérifie seulement que les deux middlewares le laissent passer.

### Tests manuels — pages `/connexion`, `/inscription` et en-tête

| N°       | Cas                                                         | Type   | Attendu                                                                 | Obtenu                                       |
| -------- | ----------------------------------------------------------- | ------ | ----------------------------------------------------------------------- | -------------------------------------------- |
| F3-MAN-1 | Visiteur qui clique sur « Ajouter au panier » (US05)        | Manuel | redirigé vers `/connexion`, avec un lien vers l'inscription             | ⏳ à tester                                  |
| F3-MAN-2 | Connexion réussie après une redirection (US05b)             | Manuel | retour sur la page d'origine                                            | ⏳ à tester                                  |
| F3-MAN-3 | Mauvais identifiants, compte désactivé                      | Manuel | message d'erreur lisible, annoncé aux lecteurs d'écran (`role="alert"`) | ⏳ à tester                                  |
| F3-MAN-4 | En-tête après connexion, puis après rechargement de la page | Manuel | « Bonjour <prénom> » et « Déconnexion »                                 | ⏳ à tester (`GET /api/users/me` disponible) |
| F3-MAN-5 | Déconnexion depuis l'en-tête                                | Manuel | retour à l'état visiteur                                                | ⏳ à tester                                  |
| F3-MAN-6 | Inscription depuis la page `/inscription`                   | Manuel | compte créé, messages 400 et 409 affichés                               | ⏳ page en cours (carte #121)                |
| F3-MAN-7 | Formulaires au clavier et en mobile (375 px)                | Manuel | labels, focus visible, champs obligatoires indiqués en texte            | ⏳ à tester (carte #87)                      |

## F2, F4 à F9

À compléter au fil des sprints.
