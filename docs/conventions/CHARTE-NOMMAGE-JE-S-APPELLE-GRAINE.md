# Charte de nommage — Je s’appelle Graine

## Objectif

Cette charte définit les conventions de nommage du projet Je s’appelle Graine. Elle vise à rendre les fichiers, le code et les données faciles à comprendre et à maintenir par toute l’équipe.

## Règles générales

- Choisir des noms explicites qui décrivent le rôle ou le contenu de l’élément.
- Employer l’anglais pour le code et les identifiants techniques.
- Éviter les abréviations obscures, les accents et les caractères spéciaux dans les noms techniques.
- Ne pas utiliser d’espace dans les noms de fichiers et de dossiers.
- Réutiliser les conventions déjà établies par le framework et le projet.
- Utiliser les termes du domaine Je s’appelle Graine de façon constante : `tree`, `category`, `cart`, `order`, `user`.

## Fichiers et dossiers

| Élément                            | Convention                                 | Exemple                                     |
| ---------------------------------- | ------------------------------------------ | ------------------------------------------- |
| Dossiers                           | `kebab-case`                               | `tree-catalogue/`                           |
| Fichiers TypeScript                | `camelCase` pour modules et utilitaires    | `treeController.ts`, `formatPrice.ts`       |
| Fichiers de composants UI et Class | `PascalCase`                               | `TreeCard.tsx`                              |
| Fichiers de types dédiés           | `camelCase` avec suffixe explicite         | `tree.types.ts`                             |
| Fichiers HTML et CSS               | `kebab-case`                               | `tree-details.html`, `catalogue-layout.css` |
| Documents Markdown                 | Majuscules pour les documents de référence | `README.md`, `CHARTE-NOMMAGE-JE-S-APPELLE-GRAINE.md` |
| Variables d’environnement          | `UPPER_SNAKE_CASE`                         | `DATABASE_URL`                              |

Les conventions du framework priment lorsque celui-ci impose un format particulier.

## Code TypeScript

- Variables et fonctions : `camelCase`.
- Classes : `PascalCase`.
- Types, interfaces, enums et composants : `PascalCase`, sans préfixe `I` pour les interfaces (par exemple `Tree`, `CreateTreeInput`).
- Constantes : `camelCase` par défaut ; `UPPER_SNAKE_CASE` pour les constantes globales immuables ou variables d’environnement.
- Booléens : utiliser un préfixe parlant comme `is`, `has` ou `can`.
- Fonctions : commencer par un verbe qui décrit l’action.
- Ajouter un nom de domaine suffisamment précis pour distinguer les concepts proches (par exemple, `userId` et `treeId`).
- Donner des types explicites aux données échangées entre couches et éviter `any` ; utiliser `unknown` quand le type reçu n’est pas encore vérifié.
- Utiliser le suffixe `.tsx` pour les fichiers contenant du JSX et `.ts` pour les autres fichiers TypeScript.

```ts
const maxTreesPerPage = 20;
const isWateringDue = true;

type Tree = {
  id: number;
  name: string;
  price: number;
};

function findTreeById(treeId: number): Tree | undefined {
  // Recherche un arbre précis dans le service concerné.
  return undefined;
}

class TreeService {
  // Regroupe les opérations métier liées aux arbres.
}
```

## HTML et CSS

- Nommer les classes CSS en `kebab-case`.
- Décrire la fonction ou le contenu de l’élément, plutôt que son apparence seule.
- Privilégier les balises HTML sémantiques et réserver les classes aux besoins de présentation ou de comportement.
- Utiliser des noms cohérents pour les composants Je s’appelle Graine, par exemple `tree-card`, `tree-list` ou `order-summary`.

```html
<section class="tree-catalogue" aria-labelledby="catalogue-title">
  <h1 id="catalogue-title">Catalogue des arbres</h1>
</section>
```

## Routes et API

- Nommer les ressources au pluriel, en `kebab-case` et sans verbe.
- Laisser la méthode HTTP porter l’action : `GET`, `POST`, `PATCH` ou `DELETE`.
- Utiliser les paramètres d’URL pour identifier une ressource et la query string pour filtrer ou trier.
- Nommer le paramètre d’URL `:id` : le segment qui le précède indique déjà la ressource (`/api/trees/:id` = l’id d’un arbre).
- Regrouper les routes réservées à l’administrateur sous le préfixe `/api/admin/`, protégé par un seul middleware de rôle.

```text
GET    /api/trees
GET    /api/trees/:id
GET    /api/trees?category=:category
POST   /api/admin/trees
PATCH  /api/admin/trees/:id
DELETE /api/admin/trees/:id
```

## Base de données

- Utiliser `snake_case` pour les tables, colonnes et contraintes.
- Choisir le singulier pour les tables.
- Nommer une clé étrangère avec le nom de l’entité référencée suivi de `_id`, par exemple `user_id` ou `tree_id`.
- Utiliser des noms précis et cohérents pour les dates et états, par exemple `created_at`, `order_date` et `status`.
- Concevoir les nouvelles données en suivant la chaîne dictionnaire de données → MCD → MLD → MPD.

Exemples :

```text
tree
user
order
tree_id
order_date
```

## Git

- Nommer les branches en minuscules, avec des mots séparés par des tirets et un préfixe qui indique leur objectif.

```text
feat/tree-catalogue
fix/order-validation
docs/naming-charter
```

- Rédiger les messages de commit à l’impératif et les préfixer selon le type de changement.

```text
feat: ajouter le catalogue des arbres
fix: corriger la validation d’une commande
docs: rédiger la charte de nommage Je s’appelle Graine
```

## Documents du projet

- Utiliser des noms explicites et stables pour les documents de référence.
- Nommer le carnet de bord `CARNET-DE-BORD-JE-S-APPELLE-GRAINE.md`.
- Ajouter les nouvelles entrées du carnet en tête du fichier, en ordre anti-chronologique, sans créer plusieurs entrées pour une même date.

## Application de la charte

- Appliquer ces conventions à tout nouveau fichier, identifiant et élément de code.
- Lors d’une modification, suivre la convention déjà utilisée dans la partie concernée du projet, sauf décision d’équipe de la faire évoluer.
- Si une exception est nécessaire, la garder limitée et expliquer la raison dans la documentation ou le carnet de bord.
