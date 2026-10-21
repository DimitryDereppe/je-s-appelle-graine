# Modèle logique de données — Je s’appelle Graine

Notation : `__id__` = clé primaire, `#` = clé étrangère.

## Schéma

![MLD Je s’appelle Graine](06b-mld.drawio.svg)

## Tableau

| Table | Clé primaire | Colonnes | Clés étrangères | Vient de (MCD) | Règle de passage |
| --- | --- | --- | --- | --- | --- |
| **role** | `__id__` | name | — | Entité Rôle | Entité → table |
| **account** | `__id__` | email, password, firstname, lastname, address, account_type, organization_name, is_active | `#role_id` → role.id | Entité Utilisateur + **Avoir** (1,1 / 0,N) | Relation 1-N → FK côté **1,1** |
| **category** | `__id__` | name | — | Entité Catégorie | Entité → table |
| **availability** | `__id__` | name | — | Entité Disponibilité | Entité → table |
| **tree** | `__id__` | name, description, price, photo_url, planting_location | `#category_id` → category.id, `#availability_id` → availability.id | Entité Arbre + **Appartenir** (1,1 / 0,N) + **Être** (1,1 / 0,N) | Relation 1-N → FK côté **1,1** |
| **cart** | `__id__` | — | `#account_id` → account.id (UNIQUE, NOT NULL) | Entité Panier + **Posséder** (0,1 / 1,1) | Relation 1-1 → FK d'un côté + `UNIQUE` |
| **cart_item** | `__id__` | quantity | `#cart_id` → cart.id, `#tree_id` → tree.id | Relation **Contenir** (0,N / 0,N) | Relation N-N → **table de liaison** |
| **purchase** | `__id__` | purchase_date, status, total_amount, payment_method | `#account_id` → account.id (peut être NULL) | Entité Commande + **Passer** (0,N / 0,1) | Relation 1-N → FK côté **0,1** |
| **purchase_line** | `__id__` | unit_price, quantity | `#purchase_id` → purchase.id, `#tree_id` → tree.id (NOT NULL) | Relation **Composer** (1,N / 0,N) | Relation N-N → **table de liaison** (avec ses attributs) |

## Notation texte

```text
role          ( __id__, name )
account       ( __id__, email, password, firstname, lastname, address, account_type, organization_name, is_active, #role_id )
category      ( __id__, name )
availability  ( __id__, name )
tree          ( __id__, name, description, price, photo_url, planting_location, #category_id, #availability_id )
cart          ( __id__, #account_id )
cart_item     ( __id__, quantity, #cart_id, #tree_id )
purchase      ( __id__, purchase_date, status, total_amount, payment_method, #account_id )
purchase_line ( __id__, unit_price, quantity, #purchase_id, #tree_id )
```

## Règles de passage MCD → MLD

1. **Entité → table.** Le « code xxx » devient la colonne `id`, clé primaire.
2. **Relation 1-N → clé étrangère du côté où la cardinalité maximale est 1** (1,1 ou 0,1), pas de nouvelle table. Ex. *Appartenir* : un arbre a une seule catégorie, donc une seule colonne `tree.category_id` suffit.
3. **Relation N-N → table de liaison** avec les deux clés étrangères et les attributs portés par la relation (`quantity` pour *Contenir* ; `unit_price`, `quantity` pour *Composer*).

## Notes de traduction

- **Posséder (0,1 / 1,1)** : la clé étrangère est placée dans `cart`, du côté **1,1** : chaque panier a obligatoirement un propriétaire (`account_id` NOT NULL), alors qu'un utilisateur peut ne pas avoir de panier. Le `UNIQUE` sur `account_id` garantit un seul panier par utilisateur.
- **Tables de liaison** : on utilise un `id` auto-incrémenté en clé primaire plutôt qu'une clé composite (les deux FK). `cart_item` ajoute `UNIQUE (cart_id, tree_id)` : un même arbre n'apparaît qu'une fois par panier, on augmente sa quantité.
- **purchase_line** garde `unit_price` : le prix payé ne change pas si le prix de l'arbre change. Le nom et le lieu de plantation sont lus dans `tree` : `tree_id` est obligatoire et un arbre déjà commandé ne peut pas être supprimé (il passe à l'état « retiré du catalogue »).
- **Être (1,1 / 0,N)** : comme *Appartenir*, la clé étrangère `availability_id` est placée dans `tree`.
- **Passer (0,N / 0,1)** : `purchase.account_id` peut être NULL. Si un compte est supprimé, ses commandes sont conservées sans propriétaire.
- **Statut d'une commande** (`pending`, `paid`, `planted`, `cancelled`) : changé manuellement par l'admin (`paid` à réception du paiement, `cancelled` si le paiement n'est pas arrivé sous 10 jours). Le client ne peut supprimer une commande que si elle est `pending` : règle de gestion vérifiée par l'API, pas par le MLD.
- **`account` et `purchase`** : `user` et `order` sont des mots réservés en PostgreSQL, les tables ont été renommées.
