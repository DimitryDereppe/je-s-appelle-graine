# Dictionnaire de données — GreenRoots

> SGBD : **PostgreSQL** (conteneur Docker en développement, Neon pour la base distante).

## Décision : `account` et `purchase` au lieu de `user` et `order`

En PostgreSQL, `user` et `order` (comme dans `ORDER BY`) sont des **mots réservés**. Une requête `SELECT * FROM user;` ne lit pas la table : elle renvoie l'utilisateur PostgreSQL connecté.

Les tables sont donc renommées : `user` → `account`, `order` → `purchase`, `order_line` → `purchase_line` (exception à la charte de nommage, notée dans le carnet de bord).

## role

*Entité **Rôle**.*

| Champ | Type | Spécificités | Description |
| --- | --- | --- | --- |
| id | INT | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY | Identifiant unique du rôle |
| name | VARCHAR(50) | NOT NULL, UNIQUE | Nom du rôle (`customer`, `admin`) |

> Les deux lignes `customer` et `admin` sont insérées dès la création de la base (données de départ), avant tout utilisateur.

## account

*Entité **Utilisateur** + relation **Avoir** (Utilisateur 1,1 — Rôle 0,N → clé étrangère côté `account`).*

| Champ | Type | Spécificités | Description |
| --- | --- | --- | --- |
| id | INT | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY | Identifiant unique de l'utilisateur |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Email, utilisé pour la connexion |
| password | VARCHAR(255) | NOT NULL | Mot de passe **haché** (Argon2), jamais en clair |
| firstname | VARCHAR(100) | NOT NULL | Prénom (obligatoire à l'inscription) |
| lastname | VARCHAR(100) | NOT NULL | Nom (obligatoire à l'inscription) |
| address | VARCHAR(255) | | Adresse postale (facultative) |
| account_type | VARCHAR(20) | NOT NULL, DEFAULT 'individual', CHECK (account_type IN ('individual', 'association', 'company')) | Type de compte : `individual` (particulier), `association`, `company` (entreprise) |
| organization_name | VARCHAR(150) | | Nom de l'association ou de l'entreprise (facultatif, même si le compte n'est pas `individual`) |
| role_id | INT | NOT NULL, FK(role.id) | Rôle de l'utilisateur (relation **Avoir**) ; `customer` à l'inscription |

## category

*Entité **Catégorie**.*

| Champ | Type | Spécificités | Description |
| --- | --- | --- | --- |
| id | INT | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY | Identifiant unique de la catégorie |
| name | VARCHAR(100) | NOT NULL, UNIQUE | Nom (résineux, feuillage caduc, feuillage persistant) |

## tree

*Entité **Arbre** + relation **Appartenir** (Arbre 1,1 — Catégorie 0,N → clé étrangère côté `tree`).*

| Champ | Type | Spécificités | Description |
| --- | --- | --- | --- |
| id | INT | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY | Identifiant unique de l'arbre |
| name | VARCHAR(150) | NOT NULL | Nom de l'arbre |
| description | TEXT | | Description affichée sur la fiche |
| price | NUMERIC(10,2) | NOT NULL, CHECK (price >= 0) | Prix unitaire actuel |
| photo_url | VARCHAR(255) | | Chemin de la photo |
| planting_location | VARCHAR(150) | | Lieu de plantation (facultatif, affiché sur la fiche) |
| is_available | BOOLEAN | NOT NULL, DEFAULT TRUE | Disponibilité : `FALSE` = retiré du catalogue (l'arbre n'est pas effacé) |
| category_id | INT | NOT NULL, FK(category.id) | Catégorie de l'arbre (relation **Appartenir**) |

## cart

*Entité **Panier** + relation **Posséder** (Utilisateur 0,1 — Panier 1,1 → clé étrangère côté `cart`, obligatoire et unique).*

| Champ | Type | Spécificités | Description |
| --- | --- | --- | --- |
| id | INT | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY | Identifiant unique du panier |
| account_id | INT | NOT NULL, UNIQUE, FK(account.id) ON DELETE CASCADE | Propriétaire du panier (relation **Posséder**) : pas de panier sans compte |

> Le panier est **réservé aux comptes connectés** : l'API retrouve le panier grâce au compte de la session (`account_id`) et répond **401** si personne n'est connecté. Le panier (vide) est créé à l'inscription du client.

## cart_item

*Table de liaison pour la relation **Contenir** (Panier 0,N — Arbre 0,N). Elle porte la quantité.*

| Champ | Type | Spécificités | Description |
| --- | --- | --- | --- |
| id | INT | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY | Identifiant de la ligne de panier (utilisé par `/api/panier/articles/:id`) |
| cart_id | INT | NOT NULL, FK(cart.id) ON DELETE CASCADE | Panier concerné |
| tree_id | INT | NOT NULL, FK(tree.id) | Arbre ajouté |
| quantity | INT | NOT NULL, DEFAULT 1, CHECK (quantity > 0) | Quantité de cet arbre dans le panier |
| | | UNIQUE (cart_id, tree_id) | Un même arbre n'apparaît qu'une fois par panier : on augmente sa quantité |

## purchase

*Entité **Commande** + relation **Passer** (Utilisateur 0,N — Commande 0,1 → clé étrangère côté `purchase`, facultative).*

| Champ | Type | Spécificités | Description |
| --- | --- | --- | --- |
| id | INT | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY | Identifiant unique de la commande |
| purchase_date | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Date de confirmation de la commande |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending', CHECK (status IN ('pending', 'paid', 'planted')) | Statut, changé **manuellement par l'admin** : `pending` (en attente, à la création), `paid` (finalisée et payée), `planted` (arbre planté) |
| total_amount | NUMERIC(10,2) | NOT NULL, CHECK (total_amount >= 0) | Montant total calculé à la confirmation |
| account_id | INT | FK(account.id) ON DELETE SET NULL | Client ayant passé la commande (relation **Passer**) ; devient `NULL` si le compte est supprimé |

> Suppression de compte : le compte est supprimé, ses commandes sont **conservées** et leur `account_id` passe à `NULL`.
> Suppression d'une commande : autorisée **uniquement** si `status = 'pending'`. Une commande `paid` ou `planted` ne doit jamais être effacée. Règle vérifiée par l'API avant le `DELETE` : une contrainte de clé étrangère ne regarde pas la valeur du statut.

## purchase_line

*Table de liaison pour la relation **Composer** (Commande 1,N — Arbre 0,N). Elle fige le nom, le prix et le lieu de plantation au moment de l'achat.*

| Champ | Type | Spécificités | Description |
| --- | --- | --- | --- |
| id | INT | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY | Identifiant de la ligne de commande |
| purchase_id | INT | NOT NULL, FK(purchase.id) ON DELETE CASCADE | Commande concernée |
| tree_id | INT | FK(tree.id) ON DELETE SET NULL | Arbre commandé (peut devenir `NULL` si l'arbre est un jour réellement supprimé) |
| tree_name | VARCHAR(150) | NOT NULL | Nom de l'arbre **au moment de l'achat** |
| unit_price | NUMERIC(10,2) | NOT NULL, CHECK (unit_price >= 0) | Prix unitaire **au moment de l'achat** |
| planting_location | VARCHAR(150) | | Lieu de plantation **au moment de l'achat** (facultatif : `NULL` si l'arbre n'en avait pas) |
| quantity | INT | NOT NULL, CHECK (quantity > 0) | Quantité commandée |
