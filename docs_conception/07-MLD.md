# Modèle logique de données — GreenRoots

Le MLD traduit le [[05-mcd|MCD]] en tables, colonnes et clés.
Noms des tables et colonnes : ceux du [[06-dictionnaire-de-donnees|dictionnaire de données]] (charte de nommage : anglais, singulier, `snake_case`, clé étrangère = `<table>_id`).

Notation : `__id__` = clé primaire, `#` = clé étrangère.

## Schéma

![MLD GreenRoots](07b-MLD.drawio.svg)

> Le fichier [07b-MLD.drawio.svg](07b-MLD.drawio.svg) est à la fois une image et un schéma **Draw.io** : l'ouvrir dans VS Code (extension Draw.io) pour le modifier, l'image se met à jour à l'enregistrement.

## Tableau

| Table | Clé primaire | Colonnes | Clés étrangères | Vient de (MCD) | Règle de passage |
| --- | --- | --- | --- | --- | --- |
| **role** | `__id__` | name | — | Entité Rôle | Entité → table |
| **account** | `__id__` | email, password, firstname, lastname, address, account_type, organization_name | `#role_id` → role.id | Entité Utilisateur + **Avoir** (1,1 / 0,N) | Relation 1-N → FK côté **1,1** |
| **category** | `__id__` | name | — | Entité Catégorie | Entité → table |
| **tree** | `__id__` | name, description, price, photo_url, is_available | `#category_id` → category.id | Entité Arbre + **Appartenir** (1,1 / 0,N) | Relation 1-N → FK côté **1,1** |
| **cart** | `__id__` | — | `#account_id` → account.id (UNIQUE, peut être NULL) | Entité Panier + **Posséder** (0,1 / 0,1) | Relation 1-1 → FK d'un côté + `UNIQUE` |
| **cart_item** | `__id__` | quantity | `#cart_id` → cart.id, `#tree_id` → tree.id | Relation **Contenir** (0,N / 0,N) | Relation N-N → **table de liaison** |
| **purchase** | `__id__` | purchase_date, status, total_amount | `#account_id` → account.id (peut être NULL) | Entité Commande + **Passer** (0,N / 0,1) | Relation 1-N → FK côté **0,1** |
| **purchase_line** | `__id__` | tree_name, unit_price, quantity | `#purchase_id` → purchase.id, `#tree_id` → tree.id | Relation **Composer** (1,N / 0,N) | Relation N-N → **table de liaison** (avec ses attributs) |

## Notation texte

```text
role          ( __id__, name )
account       ( __id__, email, password, firstname, lastname, address, account_type, organization_name, #role_id )
category      ( __id__, name )
tree          ( __id__, name, description, price, photo_url, is_available, #category_id )
cart          ( __id__, #account_id )
cart_item     ( __id__, quantity, #cart_id, #tree_id )
purchase      ( __id__, purchase_date, status, total_amount, #account_id )
purchase_line ( __id__, tree_name, unit_price, quantity, #purchase_id, #tree_id )
```

## Règles de passage MCD → MLD

1. **Entité → table.** Le « code xxx » devient la colonne `id`, clé primaire.
2. **Relation 1-N → clé étrangère du côté où la cardinalité maximale est 1** (1,1 ou 0,1), pas de nouvelle table. Ex. *Appartenir* : un arbre a une seule catégorie, donc une seule colonne `tree.category_id` suffit.
3. **Relation N-N → table de liaison** avec les deux clés étrangères et les attributs portés par la relation (`quantity` pour *Contenir* ; `tree_name`, `unit_price`, `quantity` pour *Composer*).

## Notes de traduction

- **Posséder (0,1 / 0,1)** : la clé étrangère est placée dans `cart` et non dans `account`, car un panier visiteur existe sans utilisateur (`account_id` NULL). Le `UNIQUE` sur `account_id` garantit un seul panier par utilisateur.
- **Tables de liaison** : comme dans le projet Pokédex, on utilise un `id` auto-incrémenté en clé primaire plutôt qu'une clé composite (les deux FK). `cart_item` ajoute `UNIQUE (cart_id, tree_id)` : un même arbre n'apparaît qu'une fois par panier, on augmente sa quantité.
- **purchase_line** garde `tree_name` et `unit_price` en plus de `tree_id` : l'historique des commandes ne doit pas changer si l'arbre est modifié ou retiré du catalogue (cf. [[01-entites|01-entites]]).
- **Passer (0,N / 0,1)** : `purchase.account_id` peut être NULL. Si un compte est supprimé, ses commandes sont conservées sans propriétaire (cf. [[04-relations-cardinalites|04-relations-cardinalites]], décisions).
- **Statut d'une commande** (`pending`, `paid`, `planted`) : changé manuellement par l'admin. Le client ne peut supprimer une commande que si elle est `pending` : règle de gestion vérifiée par l'API, pas par le MLD.
- **`account` et `purchase`** : `user` et `order` sont des mots réservés en PostgreSQL, les tables ont été renommées (cf. [[06-dictionnaire-de-donnees|dictionnaire de données]]).
