# Plan de tests — Je s’appelle Graine

Ce document liste, feature par feature, les cas à vérifier, leur type et le résultat obtenu.

- **Types de test** :
  - **Unitaire** : test automatisé d'une seule fonction (un middleware, un utilitaire…), appelée directement, sans serveur ni base de données. Lancé par `npm run test:unit` dans `src/api/`. Fichiers `*.unit.test.ts` rangés à côté du fichier testé.
  - **Intégration** : test automatisé de l'API (requête HTTP + base de test), lancé par `npm run test:spec` dans `src/api/`. Fichiers `*.spec.test.ts` rangés à côté du fichier testé.
  - **Manuel** : vérification à la main dans le navigateur, sur le site en ligne.
  - **Audit** : rapport Lighthouse (accessibilité, SEO, bonnes pratiques, performance).
- **Statuts** : ✅ conforme · ❌ non conforme (un problème à corriger, avec sa carte) · ⏳ pas encore testable.
- Pour ajouter une feature : copier un tableau, garder les mêmes colonnes, numéroter les cas `F<n>-<type>-<numéro>` (`UNI`, `INT`, `MAN`, `AUD`).

## F1 · Accueil (US01)

Critères d'acceptation : voir l'issue #1. Première vérification le 30/10/2026 sur le VPS ; revérifié le 10/11/2026 en local, sur le code de `DEV`.

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

Revérifiés le 10/11/2026 : page servie en local, Chromium (mobile 412 px et bureau 1350 px).

| N°        | Cas                                        | Type   | Attendu                                               | Obtenu                                                                                                                   |
| --------- | ------------------------------------------ | ------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| F1-MAN-1  | Ouvrir l'accueil                           | Manuel | les 3 arbres de `/api/trees/featured`                 | ✅ Chêne vert, Filaire à larges feuilles, Arbousier                                                                      |
| F1-MAN-2  | Ordre des vignettes                        | Manuel | le plus récent en premier                             | ✅ du plus récent au plus ancien (id 20, 19, 16)                                                                         |
| F1-MAN-3  | Arbre en rupture ou retiré                 | Manuel | jamais affiché sur l'accueil                          | ✅ l'accueil lit `/api/trees/featured`, qui ne renvoie que les arbres disponibles (F1-INT-2)                             |
| F1-MAN-4  | Contenu d'une vignette                     | Manuel | photo avec texte alternatif, nom, catégorie, prix TTC | ✅ photo, nom, catégorie, lieu de plantation, prix « 19,50 € TTC »                                                       |
| F1-MAN-5  | Présentation et bouton « Voir nos arbres » | Manuel | texte de présentation, bouton qui mène au catalogue   | ✅ mène à `/arbres`. À corriger : un `<button>` est placé dans le lien (deux éléments cliquables l'un dans l'autre)      |
| F1-MAN-6  | API en panne                               | Manuel | message d'erreur lisible sur la page                  | ✅ dans le code : « Impossible de charger les arbres pour le moment. » et lien vers le catalogue (non provoqué en local) |
| F1-MAN-7  | Aucun arbre disponible                     | Manuel | message « aucun arbre disponible »                    | ✅ dans le code : « Aucun arbre n'est disponible pour le moment. » ; l'API renvoie `[]` (F1-INT-5, F1-INT-6)             |
| F1-MAN-8  | Affichage mobile                           | Manuel | lisible, pas de défilement horizontal                 | ✅ largeur de page = largeur d'écran (412 px)                                                                            |
| F1-MAN-9  | Navigation au clavier (touche Tab)         | Manuel | tous les liens et boutons atteignables, focus visible | ✅ le 30/10 : ordre logique, contour de 3 px                                                                             |
| F1-MAN-10 | Langue de la page                          | Manuel | `<html lang="fr">`                                    | ✅ `lang="fr"`                                                                                                           |
| F1-MAN-11 | Liens de l'en-tête et du pied de page      | Manuel | pas d'erreur 404                                      | ⏳ seul `/panier` répond encore 404 (page de la F4, carte #101)                                                          |

### Audit Lighthouse

Lighthouse 13.6.0, le 10/11/2026, en local. Objectif de la carte #45 : accessibilité et SEO à 90 ou plus.

| N°       | Catégorie        | Mobile | Bureau | Attendu | Obtenu                                                                                           |
| -------- | ---------------- | ------ | ------ | ------- | ------------------------------------------------------------------------------------------------ |
| F1-AUD-1 | Accessibilité    | 100    | 100    | ≥ 90    | ✅                                                                                               |
| F1-AUD-2 | SEO              | 100    | 100    | ≥ 90    | ✅ (82 le 30/10 : titre et description ajoutés depuis)                                           |
| F1-AUD-3 | Bonnes pratiques | 92     | 92     | —       | ✅                                                                                               |
| F1-AUD-4 | Performance      | 47     | 97     | —       | à mesurer sur le VPS : en local, le mode développement de Next.js ne compresse pas le JavaScript |

Corrigé depuis le 30/10 : titre et description de la page, `lang="fr"`, ordre et choix des arbres, catégorie et prix en euros sur les vignettes, messages d'erreur et de liste vide, bouton qui mène au catalogue.

Reste à corriger :

- **Accessibilité** — le lien du logo dans le pied de page a toujours `aria-label="Je m’appelle Graine, accueil"` (faute : « m’appelle ») : le nom lu par un lecteur d'écran ne correspond pas au texte affiché (`Footer.tsx`, ligne 21).
- **Accessibilité** — la grande image d'accueil a `alt="Pin maritime"`, alors qu'elle montre des mains qui plantent une jeune pousse : `alt=""` si elle est décorative, ou un texte qui la décrit.
- **HTML** — `<Link>` contient un `<button>` (« Voir nos arbres », et les liens vers le catalogue des messages d'erreur et de liste vide) : mettre la classe du bouton directement sur le `<Link>`.
- **Bonnes pratiques** — l'icône « Des arbres sélectionnés » (`arbres-selectionnes.png`) est toujours déformée ; `/favicon.ico` répond 404 (erreur dans la console sur toutes les pages).
- **Textes** — description de la page : « que vous avez choisis » → « choisi » ; messages : « Chercher votre bonheur » → « Cherchez votre bonheur ».
- **Test** — F1-INT-7 (format d'une vignette) reste à écrire.

## F3 · Authentification (US06, US07, US20, US21)

Critères d'acceptation : voir l'issue #3 ; contrat d'API : carte #83. Tests de la carte #88, branche `feat/tests-auth`, le 03/11/2026. Cas F3-INT-26 à 29 ajoutés depuis, vérifiés sur `DEV` le 06/11/2026.

### Tests d'intégration — inscription `POST /api/users`

Fichier : `src/api/src/controllers/userController.spec.test.ts`. Les 12 tests passent (F3-INT-5 en regroupe deux : prénom vide, email invalide).

| N°        | Cas                                                  | Type        | Attendu                                                                      | Obtenu |
| --------- | ---------------------------------------------------- | ----------- | ---------------------------------------------------------------------------- | ------ |
| F3-INT-1  | Inscription valide, sans type de compte ni structure | Intégration | `201`, `accountType: "particulier"`, `role: "customer"`, pas de mot de passe | ✅     |
| F3-INT-2  | Mot de passe de 11 caractères                        | Intégration | `400`, « Le mot de passe doit contenir au moins 12 caractères. »             | ✅     |
| F3-INT-3  | Email déjà utilisé                                   | Intégration | `409`, « Ce compte existe déjà. »                                            | ✅     |
| F3-INT-4  | Body envoyé comme un formulaire HTML (pas du JSON)   | Intégration | `415` (`validateContentType`, protection CSRF)                               | ✅     |
| F3-INT-5  | Prénom vide, email invalide                          | Intégration | `400`, « Prénom obligatoire. » / « Email invalide. »                         | ✅     |
| F3-INT-6  | Mot de passe enregistré                              | Intégration | haché en Argon2 en base (commence par `$argon2`, jamais en clair)            | ✅     |
| F3-INT-24 | Particulier qui envoie un nom de structure           | Intégration | `201`, `organizationName: null` (structure ignorée)                          | ✅     |
| F3-INT-25 | Association avec un nom de structure                 | Intégration | `201`, nom de structure enregistré                                           | ✅     |
| F3-INT-26 | Champs de la réponse                                 | Intégration | `201`, exactement les champs du contrat (carte #83)                          | ✅     |
| F3-INT-27 | Mot de passe d'exactement 12 caractères              | Intégration | `201` (la limite est acceptée)                                               | ✅     |
| F3-INT-28 | Nom vide                                             | Intégration | `400`, « Nom obligatoire. »                                                  | ✅     |

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

Fichier : `src/api/src/controllers/userController.spec.test.ts`. Les 4 cas passent.

| N°        | Cas                                 | Type        | Attendu                                                                                                        | Obtenu |
| --------- | ----------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------- | ------ |
| F3-INT-21 | Utilisateur connecté                | Intégration | `200`, exactement `id`, `firstname`, `lastname`, `email`, `address`, `accountType`, `organizationName`, `role` | ✅     |
| F3-INT-22 | Sans cookie                         | Intégration | `401`, « Vous devez être connecté. »                                                                           | ✅     |
| F3-INT-23 | Cookie avec un jeton faux           | Intégration | `401`, même message que sans cookie                                                                            | ✅     |
| F3-INT-29 | Compte désactivé après la connexion | Intégration | `403` (vérifié dans `getAuthenticatedUser`)                                                                    | ✅     |

### Tests d'intégration — droits

| N°        | Cas                                           | Type        | Attendu                                                                 | Obtenu |
| --------- | --------------------------------------------- | ----------- | ----------------------------------------------------------------------- | ------ |
| F3-INT-18 | Route `/api/admin/...` sans être connecté     | Intégration | `401`, « Vous devez être connecté. »                                    | ✅     |
| F3-INT-19 | Route `/api/admin/...` avec un client         | Intégration | `403`, « Accès réservé à l'administrateur. »                            | ✅     |
| F3-INT-20 | Route `/api/admin/...` avec un administrateur | Intégration | passe `isConnected` et `checkRoles` (aucune route admin encore : `404`) | ✅     |

Fichier : `src/api/src/controllers/userController.spec.test.ts`. Le routeur `adminRouter.ts` est vide en attendant F7, F8 et F9 : le test « administrateur » vérifie seulement que les deux middlewares le laissent passer.

### Tests unitaires — middleware `checkRoles`

Fichier : `src/api/src/middlewares/isConnectedMiddleware.unit.test.ts`. Les 3 cas passent. Ils couvrent le cas que les tests d'intégration ne peuvent pas déclencher : `checkRoles` placé sans `isConnected` devant lui.

| N°       | Cas                                                | Type     | Attendu                             | Obtenu |
| -------- | -------------------------------------------------- | -------- | ----------------------------------- | ------ |
| F3-UNI-1 | Rôle autorisé (`admin` sur une route admin)        | Unitaire | `next()` est appelé                 | ✅     |
| F3-UNI-2 | Rôle non autorisé (`customer` sur une route admin) | Unitaire | lance une `ForbiddenError` (403)    | ✅     |
| F3-UNI-3 | Aucun rôle dans la requête (`isConnected` oublié)  | Unitaire | lance une `UnauthorizedError` (401) | ✅     |

### Tests manuels — pages `/connexion`, `/inscription` et en-tête

| N°       | Cas                                                         | Type   | Attendu                                                                 | Obtenu                                       |
| -------- | ----------------------------------------------------------- | ------ | ----------------------------------------------------------------------- | -------------------------------------------- |
| F3-MAN-1 | Visiteur qui clique sur « Ajouter au panier » (US05)        | Manuel | redirigé vers `/connexion`, avec un lien vers l'inscription             | reporté à la F4                              |
| F3-MAN-2 | Connexion réussie après une redirection (US06)              | Manuel | retour sur la page d'origine                                            | ✅ à tester                                  |
| F3-MAN-3 | Mauvais identifiants, compte désactivé                      | Manuel | message d'erreur lisible, annoncé aux lecteurs d'écran (`role="alert"`) | ✅ à tester                                  |
| F3-MAN-4 | En-tête après connexion, puis après rechargement de la page | Manuel | « Bonjour <prénom> » et « Déconnexion »                                 | ✅ à tester (`GET /api/users/me` disponible) |
| F3-MAN-5 | Déconnexion depuis l'en-tête                                | Manuel | retour à l'état visiteur                                                | ✅ à tester                                  |
| F3-MAN-6 | Inscription depuis la page `/inscription`                   | Manuel | compte créé, messages 400 et 409 affichés                               | ✅ page en cours (carte #121)                |
| F3-MAN-7 | Formulaires au clavier et en mobile (375 px)                | Manuel | labels, focus visible, champs obligatoires indiqués en texte            | ✅ à tester (carte #87)                      |

## F2 · Catalogue et fiche arbre (US02 à US04, US08, US09)

Critères d'acceptation : voir l'issue #2 ; contrat d'API : carte #89. Tests de la carte #94, vérifiés sur `DEV` le 06/11/2026.

### Tests d'intégration — catalogue `GET /api/trees`

Fichier : `src/api/src/controllers/treeController.spec.test.ts`. Les 3 cas passent.

| N°       | Cas                                     | Type        | Attendu                                 | Obtenu |
| -------- | --------------------------------------- | ----------- | --------------------------------------- | ------ |
| F2-INT-1 | Arbres disponibles, en rupture, retirés | Intégration | `200`, tous les arbres sauf les retirés | ✅     |
| F2-INT-2 | Ordre du catalogue                      | Intégration | triés par `id` croissant                | ✅     |
| F2-INT-3 | Aucun arbre en base                     | Intégration | `200` et `[]`                           | ✅     |

### Tests d'intégration — recherche par nom `GET /api/trees?search=`

Même fichier. Les 7 cas passent.

| N°        | Cas                                        | Type        | Attendu                                                      | Obtenu |
| --------- | ------------------------------------------ | ----------- | ------------------------------------------------------------ | ------ |
| F2-INT-4  | Partie du nom, sans accent ni majuscule    | Intégration | l'arbre est trouvé (`erable` trouve « Érable »)              | ✅     |
| F2-INT-5  | Recherche et catégorie ensemble            | Intégration | seuls les arbres qui vérifient les deux                      | ✅     |
| F2-INT-6  | Arbre retiré qui correspond à la recherche | Intégration | exclu des résultats                                          | ✅     |
| F2-INT-7  | Aucun nom ne correspond                    | Intégration | `200` et `[]`                                                | ✅     |
| F2-INT-8  | Recherche `%`                              | Intégration | `%` cherché comme un caractère, pas comme « n'importe quoi » | ✅     |
| F2-INT-9  | Recherche vide (`?search=`)                | Intégration | tout le catalogue                                            | ✅     |
| F2-INT-10 | `search` répété (`?search=a&search=b`)     | Intégration | `400` (`validateSearchQuery`)                                | ✅     |

### Tests d'intégration — fiche arbre `GET /api/trees/:id`

Même fichier. Les 4 cas passent.

| N°        | Cas              | Type        | Attendu                         | Obtenu |
| --------- | ---------------- | ----------- | ------------------------------- | ------ |
| F2-INT-11 | Arbre disponible | Intégration | `200`, avec sa `description`    | ✅     |
| F2-INT-12 | Arbre retiré     | Intégration | `404`                           | ✅     |
| F2-INT-13 | Id inconnu       | Intégration | `404`                           | ✅     |
| F2-INT-14 | Id invalide      | Intégration | `400`, « Identifiant invalide » | ✅     |

## F4 · Panier (US05, US22, US23)

Critères d'acceptation : voir l'issue #4 ; contrat d'API : carte #99. Tests de la carte #102, vérifiés sur `DEV` le 06/11/2026. Seule la lecture du panier existe pour l'instant (ajout, modification et suppression : carte #100).

### Tests d'intégration — lire son panier `GET /api/cart`

Fichier : `src/api/src/controllers/cartController.spec.test.ts`. Les 6 cas passent.

| N°       | Cas                                 | Type        | Attendu                                                                                                    | Obtenu |
| -------- | ----------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------- | ------ |
| F4-INT-1 | Panier vide                         | Intégration | `200` et `[]`                                                                                              | ✅     |
| F4-INT-2 | Un arbre en 2 exemplaires           | Intégration | `200`, une ligne : `treeId`, `quantity`, `name`, `price` en nombre, `plantingLocation`, `availabilityName` | ✅     |
| F4-INT-3 | Paniers de deux clients             | Intégration | seulement le panier du compte connecté                                                                     | ✅     |
| F4-INT-4 | Sans être connecté                  | Intégration | `401`, « Vous devez être connecté. »                                                                       | ✅     |
| F4-INT-5 | Cookie avec un jeton faux           | Intégration | `401`, même message                                                                                        | ✅     |
| F4-INT-6 | Compte désactivé après la connexion | Intégration | `403`                                                                                                      | ✅     |

## F5 · Commande (US24, US25)

Critères d'acceptation : voir l'issue #5 ; contrat d'API : carte #103. Tests de la carte #108, écrits avec le back (#104, PR #191 et #194), sur `DEV` le 06/11/2026.

### Tests d'intégration — passer commande `POST /api/orders`

Fichier : `src/api/src/controllers/ordersController.spec.test.ts`. Les 14 cas passent.

| N°        | Cas                                                | Type        | Attendu                                                                                       | Obtenu |
| --------- | -------------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------- | ------ |
| F5-INT-1  | Commande valide                                    | Intégration | `201`, commande avec ses lignes, total recalculé par l'API, date limite = commande + 10 jours | ✅     |
| F5-INT-2  | Paiement par virement                              | Intégration | `paymentInstructions` avec IBAN, BIC et titulaire (config de l'API)                           | ✅     |
| F5-INT-3  | Paiement par chèque                                | Intégration | `paymentInstructions` avec l'ordre et l'adresse d'envoi                                       | ✅     |
| F5-INT-4  | Identité de l'acheteur et panier                   | Intégration | identité figée dans la commande, panier vidé                                                  | ✅     |
| F5-INT-5  | Prix de l'arbre modifié après la commande          | Intégration | la ligne garde le prix payé                                                                   | ✅     |
| F5-INT-6  | Mode de paiement invalide                          | Intégration | `400`, « Mode de paiement invalide. »                                                         | ✅     |
| F5-INT-7  | Engagement à payer sous 10 jours non coché         | Intégration | `400`, « Vous devez vous engager à payer sous 10 jours. »                                     | ✅     |
| F5-INT-8  | Adresse de facturation absente ou vide             | Intégration | `400`, « L'adresse de facturation est obligatoire. »                                          | ✅     |
| F5-INT-9  | Adresse de facturation de plus de 255 caractères   | Intégration | `400`, « L'adresse de facturation est trop longue. »                                          | ✅     |
| F5-INT-10 | Espaces autour de l'adresse de facturation         | Intégration | adresse enregistrée sans les espaces                                                          | ✅     |
| F5-INT-11 | Panier vide                                        | Intégration | `400`, « Votre panier est vide. »                                                             | ✅     |
| F5-INT-12 | Arbre du panier devenu indisponible                | Intégration | `409`, rien d'enregistré                                                                      | ✅     |
| F5-INT-13 | Échec au milieu de la transaction (erreur simulée) | Intégration | `500`, rien d'enregistré, panier intact                                                       | ✅     |
| F5-INT-14 | Sans être connecté                                 | Intégration | `401`                                                                                         | ✅     |

Le test F5-INT-13 affiche « Internal server error … échec simulé » dans la console : c'est l'erreur provoquée exprès, pas un échec du test.

### Tests d'intégration — relire une commande `GET /api/orders/:id`

Même fichier. Les 10 cas passent.

| N°        | Cas                                                           | Type        | Attendu                                                               | Obtenu |
| --------- | ------------------------------------------------------------- | ----------- | --------------------------------------------------------------------- | ------ |
| F5-INT-15 | Commande du client connecté                                   | Intégration | `200`, même contenu que la réponse de `POST /api/orders`              | ✅     |
| F5-INT-16 | Adresse saisie différente de celle du compte                  | Intégration | `billingAddress` = l'adresse saisie à la commande                     | ✅     |
| F5-INT-17 | Clients européens (Royaume-Uni, Belgique, Allemagne, Espagne) | Intégration | adresse rendue intacte (accents, `ß`, code postal britannique), 4 cas | ✅     |
| F5-INT-18 | Commande d'un autre client                                    | Intégration | `404` (pas `403`, pour ne pas révéler qu'elle existe)                 | ✅     |
| F5-INT-19 | Commande inconnue                                             | Intégration | `404`, « Commande introuvable. »                                      | ✅     |
| F5-INT-20 | Id qui n'est pas un entier positif                            | Intégration | `400`                                                                 | ✅     |
| F5-INT-21 | Sans être connecté                                            | Intégration | `401`                                                                 | ✅     |

### Tests d'intégration — email de confirmation (US25)

Même fichier. Les 3 cas passent. En test, `SMTP_HOST` est absent : l'email est affiché avec `console.log` au lieu d'être envoyé ; le test remplace `console.log` (`mock.method`) pour lire son contenu, ou pour simuler un échec d'envoi.

| N°        | Cas                                        | Type        | Attendu                                                                                                                               | Obtenu |
| --------- | ------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| F5-INT-22 | Email préparé à la création de la commande | Intégration | destinataire, « Bonjour prénom nom », n° de commande, montant TTC, adresse de facturation, IBAN et référence à mettre dans le libellé | ✅     |
| F5-INT-23 | Échec de l'envoi de l'email                | Intégration | `201`, commande gardée, panier vidé, échec noté dans les logs (`console.error`)                                                       | ✅     |
| F5-INT-24 | Email d'une commande payée par chèque      | Intégration | « Paiement par chèque : » sans « n° », ordre du chèque, référence à écrire au dos, pas d'IBAN                                         | ✅     |

### Tests manuels — pages `/commandes/nouvelle`, `/commandes/nouvelle/paiement`, `/commandes/[id]/confirmation`

| N°       | Cas                                                       | Type   | Attendu                                                                         | Obtenu                        |
| -------- | --------------------------------------------------------- | ------ | ------------------------------------------------------------------------------- | ----------------------------- |
| F5-MAN-1 | Parcours panier → récapitulatif → paiement → confirmation | Manuel | commande créée, page de confirmation affichée                                   | ⏳ pages à faire (carte #107) |
| F5-MAN-2 | Valider sans cocher l'engagement ou sans adresse          | Manuel | message d'erreur lisible, annoncé aux lecteurs d'écran (`role="alert"`)         | ⏳ pages à faire (carte #107) |
| F5-MAN-3 | Page de confirmation                                      | Manuel | référence (n° de commande), montant TTC, date limite, IBAN ou adresse du chèque | ⏳ pages à faire (carte #107) |
| F5-MAN-4 | Formulaires au clavier et en mobile (375 px)              | Manuel | labels, focus visible, champs obligatoires indiqués en texte                    | ⏳ pages à faire (carte #107) |

## F6 · Espace client (US26 à US30)

Contrat d'API : carte #159. Tests de la carte #162 (compte), vérifiés sur `feat/f6-compte-back` le 06/11/2026. Tests de la carte #199 (commandes), vérifiés sur `feat/f6-commandes-back` le 09/11/2026.

### Tests d'intégration — modifier son compte `PATCH /api/users/me`

Fichier : `src/api/src/controllers/userController.spec.test.ts`. Les 8 cas passent.

| N°       | Cas                                    | Type        | Attendu                                                         | Obtenu |
| -------- | -------------------------------------- | ----------- | --------------------------------------------------------------- | ------ |
| F6-INT-1 | Modification valide                    | Intégration | `200`, champs de `GET /api/users/me`, sans mot de passe, en BDD | ✅     |
| F6-INT-2 | Particulier avec une structure envoyée | Intégration | `200`, `organizationName` à `null`                              | ✅     |
| F6-INT-3 | `role` et `isActive` envoyés           | Intégration | `200`, rôle et état du compte inchangés en BDD                  | ✅     |
| F6-INT-4 | Email d'un autre compte                | Intégration | `409` « Cet email est déjà utilisé. »                           | ✅     |
| F6-INT-5 | Garder son propre email                | Intégration | `200`                                                           | ✅     |
| F6-INT-6 | `accountType` absent                   | Intégration | `400` « Type de compte invalide. »                              | ✅     |
| F6-INT-7 | Prénom composé d'espaces               | Intégration | `400` « Prénom obligatoire. »                                   | ✅     |
| F6-INT-8 | Sans connexion                         | Intégration | `401` « Vous devez être connecté. »                             | ✅     |

### Tests d'intégration — changer son mot de passe `PATCH /api/users/me/password`

Même fichier. Les 5 cas passent.

| N°        | Cas                      | Type        | Attendu                                                   | Obtenu |
| --------- | ------------------------ | ----------- | --------------------------------------------------------- | ------ |
| F6-INT-9  | Changement valide        | Intégration | `204`, ancien mot de passe refusé, nouveau accepté        | ✅     |
| F6-INT-10 | Stockage du nouveau      | Intégration | hash argon2 en BDD, jamais le mot de passe en clair       | ✅     |
| F6-INT-11 | Mot de passe actuel faux | Intégration | `400` « Le mot de passe actuel est incorrect. », inchangé | ✅     |
| F6-INT-12 | Nouveau trop court       | Intégration | `400`, 12 caractères minimum                              | ✅     |
| F6-INT-13 | Sans connexion           | Intégration | `401` « Vous devez être connecté. »                       | ✅     |

### Tests d'intégration — supprimer son compte `DELETE /api/users/me`

Même fichier. Les 7 cas passent.

| N°        | Cas                                  | Type        | Attendu                                                           | Obtenu |
| --------- | ------------------------------------ | ----------- | ----------------------------------------------------------------- | ------ |
| F6-INT-14 | Suppression d'un client              | Intégration | `204`, cookie effacé, compte retiré de la BDD                     | ✅     |
| F6-INT-15 | Jeton réutilisé après la suppression | Intégration | `401` « Vous devez être connecté. »                               | ✅     |
| F6-INT-16 | Client avec une commande             | Intégration | `204`, commande conservée, identité gardée, `account_id` à `NULL` | ✅     |
| F6-INT-17 | Dernier admin actif                  | Intégration | `409` « Impossible de supprimer le dernier administrateur. »      | ✅     |
| F6-INT-18 | Autre admin désactivé                | Intégration | `409` : un compte désactivé ne compte pas                         | ✅     |
| F6-INT-19 | Un autre admin actif reste           | Intégration | `204`                                                             | ✅     |
| F6-INT-20 | Sans connexion                       | Intégration | `401` « Vous devez être connecté. »                               | ✅     |

### Tests d'intégration — textes trop longs (inscription et modification du compte)

Même fichier. Les 10 cas passent. Les limites sont les tailles des colonnes de la table `account`.

| N°        | Cas                                                                             | Type        | Attendu                        | Obtenu |
| --------- | ------------------------------------------------------------------------------- | ----------- | ------------------------------ | ------ |
| F6-INT-21 | `POST /api/users` : prénom, nom, email ou structure trop longs (4)              | Intégration | `400` avec le message du champ | ✅     |
| F6-INT-22 | `PATCH /api/users/me` : prénom, nom, email, adresse ou structure trop longs (5) | Intégration | `400` avec le message du champ | ✅     |
| F6-INT-23 | `PATCH /api/users/me` : champs à la taille maximale                             | Intégration | `200`                          | ✅     |

### Tests d'intégration — historique des commandes `GET /api/orders`

Fichier : `src/api/src/controllers/ordersController.spec.test.ts`. Les 3 cas passent.

| N°        | Cas                         | Type        | Attendu                                                                       | Obtenu |
| --------- | --------------------------- | ----------- | ----------------------------------------------------------------------------- | ------ |
| F6-INT-24 | Client avec deux commandes  | Intégration | `200`, la plus récente d'abord, `id`, `purchaseDate`, `status`, `totalAmount` | ✅     |
| F6-INT-25 | Commandes d'un autre client | Intégration | `200`, liste vide : jamais les commandes d'un autre                           | ✅     |
| F6-INT-26 | Sans connexion              | Intégration | `401`                                                                         | ✅     |

### Tests d'intégration — annuler une commande `PATCH /api/orders/:id/status`

Même fichier. Les 7 cas passent.

| N°        | Cas                            | Type        | Attendu                                                                           | Obtenu |
| --------- | ------------------------------ | ----------- | --------------------------------------------------------------------------------- | ------ |
| F6-INT-27 | Commande en attente            | Intégration | `200`, la commande avec le statut `annulée`, date enregistrée dans `cancelled_at` | ✅     |
| F6-INT-28 | Commande déjà payée            | Intégration | `409` « Seule une commande en attente de paiement peut être annulée. », inchangée | ✅     |
| F6-INT-29 | Commande déjà annulée          | Intégration | `409`                                                                             | ✅     |
| F6-INT-30 | Statut autre que `annulée`     | Intégration | `400` « Statut invalide. », commande toujours en attente                          | ✅     |
| F6-INT-31 | Commande d'un autre client     | Intégration | `404` « Commande introuvable. », commande inchangée                               | ✅     |
| F6-INT-32 | Id qui n'est pas un entier > 0 | Intégration | `400`                                                                             | ✅     |
| F6-INT-33 | Sans connexion                 | Intégration | `401`                                                                             | ✅     |

### Tests manuels — pages `/commandes` et `/commandes/[id]` (carte #200)

Vérifiés sur `feat/f6-commandes-front` le 09/11/2026. Les 11 cas passent.

| N°        | Cas                                                             | Type   | Attendu                                                                                                               | Obtenu |
| --------- | --------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------- | ------ |
| F6-MAN-1  | `/commandes` sans être connecté                                 | Manuel | redirection vers `/connexion`, puis retour sur `/commandes` après la connexion                                        | ✅     |
| F6-MAN-2  | Client sans commande                                            | Manuel | message « Vous n’avez pas encore passé de commande. » et lien vers les arbres                                         | ✅     |
| F6-MAN-3  | Client avec plusieurs commandes                                 | Manuel | la plus récente d’abord ; numéro, date, statut en français, montant TTC ; chaque carte mène au détail                 | ✅     |
| F6-MAN-4  | Détail d’une commande en attente                                | Manuel | date, statut, mode de paiement, date limite, adresse, arbres, total ; bouton « Annuler la commande »                  | ✅     |
| F6-MAN-5  | Annuler, puis choisir « Annuler » dans la confirmation          | Manuel | rien n’est envoyé, la commande reste en attente                                                                       | ✅     |
| F6-MAN-6  | Annuler et confirmer                                            | Manuel | statut « Annulée », bouton masqué, message annoncé ; « Annulée » aussi dans la liste                                  | ✅     |
| F6-MAN-7  | Commande payée pendant que la page est ouverte                  | Manuel | message « Votre paiement a déjà été reçu… », statut « Payée », bouton masqué                                          | ✅     |
| F6-MAN-8  | Détail d’une commande payée, plantée ou annulée                 | Manuel | ni bouton d’annulation ni date limite                                                                                 | ✅     |
| F6-MAN-9  | `/commandes/abc`, `/commandes/9999`, commande d’un autre client | Manuel | « Cette commande est introuvable. »                                                                                   | ✅     |
| F6-MAN-10 | Mobile (360 px) et clavier                                      | Manuel | rien ne déborde ; Tab atteint les cartes, le lien de retour et le bouton, focus visible ; Échap ferme la confirmation | ✅     |
| F6-MAN-11 | Lighthouse sur les deux pages                                   | Manuel | accessibilité ≥ 90 ; SEO sous 90 attendu : `noindex` volontaire, page privée                                          | ✅     |

### Tests manuels — page `/compte` et lien « Bonjour X » (carte #161)

| N°        | Cas                                          | Type   | Attendu                                                                                                                                                                       | Obtenu |
| --------- | -------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| F6-MAN-12 | « Bonjour X » dans l'en-tête                 | Manuel | mène à `/compte`, lien mis en avant sur cette page ; sur mobile, le menu burger se ferme                                                                                      | ✅     |
| F6-MAN-13 | `/compte` sans être connecté                 | Manuel | redirection vers `/connexion`, puis retour sur `/compte` après la connexion                                                                                                   | ✅     |
| F6-MAN-14 | Menu de la page                              | Manuel | « Suivre mes commandes » mène à `/commandes` ; les trois autres entrées descendent jusqu'à leur bloc                                                                          | ✅     |
| F6-MAN-15 | Informations préremplies                     | Manuel | prénom, nom, email, adresse et type de compte du compte connecté ; structure affichée seulement hors particulier                                                              | ✅     |
| F6-MAN-16 | Modifier ses informations                    | Manuel | « Vos informations ont été enregistrées. », valeurs gardées après rechargement                                                                                                | ✅     |
| F6-MAN-17 | Email d'un autre compte                      | Manuel | « Cet email est déjà utilisé. »                                                                                                                                               | ✅     |
| F6-MAN-18 | Mot de passe actuel faux, nouveau trop court | Manuel | « Le mot de passe actuel est incorrect. » ; « Le mot de passe doit contenir au moins 12 caractères. »                                                                         | ✅     |
| F6-MAN-19 | Changer son mot de passe                     | Manuel | message de réussite, champs vidés ; connexion avec le nouveau mot de passe                                                                                                    | ✅     |
| F6-MAN-20 | Supprimer son compte (compte jetable)        | Manuel | confirmation qui prévient de la perte d'accès aux commandes ; « Votre compte a été supprimé… », puis la page de connexion au bout de 3 secondes, « Connexion » dans l'en-tête | ✅     |
| F6-MAN-21 | Supprimer le dernier admin actif             | Manuel | « Impossible de supprimer le dernier administrateur. »                                                                                                                        | ✅     |
| F6-MAN-22 | Mobile (360 px) et clavier                   | Manuel | rien ne déborde ; Tab atteint le menu, les champs et les boutons, focus visible                                                                                               | ✅     |
| F6-MAN-23 | Lighthouse                                   | Manuel | accessibilité ≥ 90 ; SEO sous 90 attendu : `noindex` volontaire, page privée                                                                                                  | ✅     |

## F7 à F9

À compléter au fil des sprints.
