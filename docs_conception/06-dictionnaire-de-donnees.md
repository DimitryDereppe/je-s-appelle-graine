# Dictionnaire de données — GreenRoots

> SGBD : **PostgreSQL** (conteneur Docker en développement, Neon pour la base distante).
> Nommage selon la [[Apothéose/doc_ext/CHARTE-NOMMAGE-GREENROOTS|charte de nommage]] : tables au singulier, `snake_case`, en anglais ; clé étrangère = `<table>_id`.
> Périmètre : MVP du [[Apothéose/doc_ext/CAHIER-DES-CHARGES-GREENROOTS - a valider avec la team|cahier des charges]].

## ⚠️ Point à trancher : `user` et `order` sont des mots réservés

En PostgreSQL, `user` et `order` (comme dans `ORDER BY`) sont des **mots réservés**. Une requête `SELECT * FROM user;` ne lit pas la table : elle renvoie l'utilisateur PostgreSQL connecté. Deux options :

1. garder les noms de la charte et les écrire **toujours entre guillemets doubles** : `SELECT * FROM "user";`, `INSERT INTO "order" ...` ;
2. faire évoluer la charte vers des noms non réservés (ex. `app_user` / `customer_order`), et noter l'exception dans le carnet de bord.

Ce dictionnaire garde les noms de la charte (`user`, `order`) en attendant la décision.

## role

*Entité **Rôle**.*

| Champ | Type | Spécificités | Description |
| --- | --- | --- | --- |
| id | INT | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY | Identifiant unique du rôle |
| name | VARCHAR(50) | NOT NULL, UNIQUE | Nom du rôle (`customer`, `admin`) |

> Les deux lignes `customer` et `admin` sont insérées dès la création de la base (données de départ), avant tout utilisateur.

## user

*Entité **Utilisateur** + relation **Avoir** (Utilisateur 1,1 — Rôle 0,N → clé étrangère côté `user`).*

| Champ | Type | Spécificités | Description |
| --- | --- | --- | --- |
| id | INT | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY | Identifiant unique de l'utilisateur |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Email, utilisé pour la connexion |
| password | VARCHAR(255) | NOT NULL | Mot de passe **haché** (Argon2), jamais en clair |
| firstname | VARCHAR(100) | | Prénom (facultatif à l'inscription) |
| lastname | VARCHAR(100) | | Nom (facultatif à l'inscription) |
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
| photo_url | VARCHAR(255) | | Chemin ou URL de la photo |
| is_available | BOOLEAN | NOT NULL, DEFAULT TRUE | Disponibilité : `FALSE` = retiré du catalogue (l'arbre n'est pas effacé) |
| category_id | INT | NOT NULL, FK(category.id) | Catégorie de l'arbre (relation **Appartenir**) |

## cart

*Entité **Panier** + relation **Posséder** (Utilisateur 0,1 — Panier 0,1 → clé étrangère côté `cart`, facultative et unique).*

| Champ | Type | Spécificités | Description |
| --- | --- | --- | --- |
| id | INT | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY | Identifiant unique du panier |
| user_id | INT | UNIQUE, FK(user.id) ON DELETE CASCADE | Propriétaire du panier ; `NULL` tant que c'est un panier visiteur |

> Le panier visiteur est retrouvé grâce à la **session** (cookie `httpOnly`) qui mémorise l'`id` du panier. À la connexion, l'API renseigne `user_id`. La façon exacte de stocker la session reste à préciser (cf. cahier des charges, risques).

## cart_item

*Table de liaison pour la relation **Contenir** (Panier 0,N — Arbre 0,N). Elle porte la quantité.*

| Champ | Type | Spécificités | Description |
| --- | --- | --- | --- |
| id | INT | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY | Identifiant de la ligne de panier (utilisé par `/api/panier/articles/:id`) |
| cart_id | INT | NOT NULL, FK(cart.id) ON DELETE CASCADE | Panier concerné |
| tree_id | INT | NOT NULL, FK(tree.id) | Arbre ajouté |
| quantity | INT | NOT NULL, DEFAULT 1, CHECK (quantity > 0) | Quantité de cet arbre dans le panier |
| | | UNIQUE (cart_id, tree_id) | Un même arbre n'apparaît qu'une fois par panier : on augmente sa quantité |

## order

*Entité **Commande** + relation **Passer** (Utilisateur 0,N — Commande 1,1 → clé étrangère côté `order`).*

| Champ | Type | Spécificités | Description |
| --- | --- | --- | --- |
| id | INT | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY | Identifiant unique de la commande |
| order_date | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Date de confirmation de la commande |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'confirmed' | Statut, géré par l'admin (MVP : `confirmed` ; d'autres comme `planted` viendront avec les évolutions) |
| total_amount | NUMERIC(10,2) | NOT NULL, CHECK (total_amount >= 0) | Montant total calculé à la confirmation |
| user_id | INT | NOT NULL, FK(user.id) | Client ayant passé la commande (relation **Passer**) |

> Suppression de compte : l'utilisateur est **anonymisé** plutôt qu'effacé, pour que `user_id` reste valide (voir [[04-relations-cardinalites|04-relations-cardinalites]], point à trancher).

## order_line

*Table de liaison pour la relation **Composer** (Commande 1,N — Arbre 0,N). Elle fige le nom et le prix au moment de l'achat.*

| Champ | Type | Spécificités | Description |
| --- | --- | --- | --- |
| id | INT | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY | Identifiant de la ligne de commande |
| order_id | INT | NOT NULL, FK(order.id) ON DELETE CASCADE | Commande concernée |
| tree_id | INT | FK(tree.id) ON DELETE SET NULL | Arbre commandé (peut devenir `NULL` si l'arbre est un jour réellement supprimé) |
| tree_name | VARCHAR(150) | NOT NULL | Nom de l'arbre **au moment de l'achat** |
| unit_price | NUMERIC(10,2) | NOT NULL, CHECK (unit_price >= 0) | Prix unitaire **au moment de l'achat** |
| quantity | INT | NOT NULL, CHECK (quantity > 0) | Quantité commandée |
