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

## F2 à F9

À compléter au fil des sprints.
