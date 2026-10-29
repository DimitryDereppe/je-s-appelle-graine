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

| Élément                            | Convention                                 | Exemple                                              |
| ---------------------------------- | ------------------------------------------ | ---------------------------------------------------- |
| Dossiers                           | `kebab-case`                               | `tree-catalogue/`                                    |
| Fichiers TypeScript                | `camelCase` pour modules et utilitaires    | `treeController.ts`, `formatPrice.ts`                |
| Fichiers de composants UI et Class | `PascalCase`                               | `TreeCard.tsx`                                       |
| Types de l’API                     | un seul fichier de déclarations            | `src/api/src/@types/index.d.ts`                      |
| Fichiers HTML et CSS               | `kebab-case`                               | `tree-details.html`, `catalogue-layout.css`          |
| Documents Markdown                 | Majuscules pour les documents de référence | `README.md`, `CHARTE-NOMMAGE-JE-S-APPELLE-GRAINE.md` |
| Variables d’environnement          | `UPPER_SNAKE_CASE`                         | `DATABASE_URL`                                       |

Les conventions du framework priment lorsque celui-ci impose un format particulier.

## Code TypeScript

- Variables et fonctions : `camelCase`.
- Classes : `PascalCase`.
- Types et interfaces : `PascalCase` avec le préfixe `I` (par exemple `ITree`, `ICreateTreeInput`), pour les distinguer des composants et des classes.
- Enums et composants : `PascalCase`, sans préfixe (par exemple `TreeCard`).
- Constantes : `camelCase` par défaut ; `UPPER_SNAKE_CASE` pour les constantes globales immuables ou variables d’environnement.
- Booléens : utiliser un préfixe parlant comme `is`, `has` ou `can`.
- Fonctions : commencer par un verbe qui décrit l’action.
- Ajouter un nom de domaine suffisamment précis pour distinguer les concepts proches (par exemple, `userId` et `treeId`).
- Les types de l’API sont regroupés dans `src/api/src/@types/index.d.ts` et s’importent avec `import type` (obligatoire pour un fichier `.d.ts`).
- Donner des types explicites aux données échangées entre couches et éviter `any` ; utiliser `unknown` quand le type reçu n’est pas encore vérifié.
- Utiliser le suffixe `.tsx` pour les fichiers contenant du JSX et `.ts` pour les autres fichiers TypeScript.

```ts
const maxTreesPerPage = 20;
const isWateringDue = true;

type ITree = {
  id: number;
  name: string;
  price: number;
};

function findTreeById(treeId: number): ITree | undefined {
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
- Exception au pluriel : une ressource unique pour l’utilisateur connecté reste au singulier (`/api/cart`, `/api/users/me`, `/api/auth`, pages `/panier` et `/compte`).
- Pages web (en français) : les formulaires d’ajout et de modification suivent la convention habituelle `…/nouveau` et `…/:id/modifier` ; la règle « sans verbe » s’applique aux routes de l’API.
- Champs JSON des requêtes et des réponses : `camelCase`. La base reste en `snake_case` : la conversion se fait dans le `SELECT` du DataMapper, avec un alias entre guillemets (sinon PostgreSQL le passe en minuscules).

```text
GET    /api/trees
GET    /api/trees/:id
GET    /api/trees?category=2
POST   /api/admin/trees
PATCH  /api/admin/trees/:id
DELETE /api/admin/trees/:id
```

```sql
SELECT photo_url AS "photoUrl", category_id AS "categoryId" FROM tree;
-- Réponse : { "photoUrl": "...", "categoryId": 1 }
```

## Base de données

- Utiliser `snake_case` pour les tables, colonnes et contraintes.
- Choisir le singulier pour les tables.
- Nommer une clé étrangère avec le nom de la table référencée suivi de `_id`, par exemple `account_id` ou `tree_id`.
- Utiliser des noms précis et cohérents pour les dates et états, par exemple `purchase_date`, `paid_at` et `status`.
- Exception : `user` et `order` sont des mots réservés de PostgreSQL. Les tables correspondantes s’appellent `account`, `purchase` et `purchase_line`.
- Concevoir les nouvelles données en suivant la chaîne dictionnaire de données → MCD → MLD → MPD.

Exemples :

```text
tree
account
purchase
tree_id
purchase_date
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
- Nommer le carnet de bord de l’équipe `CARNET-DE-BORD-JE-S-APPELLE-GRAINE.md`. Il est tenu à jour par le Scrum Master.
- Chaque membre tient aussi son carnet de bord personnel, à la racine du dépôt, nommé `CARNET-DE-BORD-<PRÉNOM>.md` (prénom en majuscules, sans accent : `CARNET-DE-BORD-LOIC.md`). Chacun ne modifie que le sien.
- Dans un carnet personnel, chaque entrée reprend les rubriques « Travail réalisé », « Décisions (prises avec l’équipe) » et « À poursuivre » ; une rubrique « Ce que j’ai appris » peut s’y ajouter.
- Ajouter les nouvelles entrées des carnets en tête du fichier, en ordre anti-chronologique, sans créer plusieurs entrées pour une même date.

## Application de la charte

- Appliquer ces conventions à tout nouveau fichier, identifiant et élément de code.
- Lors d’une modification, suivre la convention déjà utilisée dans la partie concernée du projet, sauf décision d’équipe de la faire évoluer.
- Si une exception est nécessaire, la garder limitée et expliquer la raison dans la documentation ou le carnet de bord.
