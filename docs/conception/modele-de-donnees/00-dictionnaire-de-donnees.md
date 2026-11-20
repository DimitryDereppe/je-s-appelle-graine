# Dictionnaire de données — Je s’appelle Graine

> SGBD : **PostgreSQL** (conteneur Docker, en développement et sur le VPS).

## Décision : `account` et `purchase` au lieu de `user` et `order`

En PostgreSQL, `user` et `order` (comme dans `ORDER BY`) sont des **mots réservés**. Une requête `SELECT * FROM user;` ne lit pas la table : elle renvoie l'utilisateur PostgreSQL connecté.

Les tables sont donc renommées : `user` → `account`, `order` → `purchase`, `order_line` → `purchase_line` (exception à la charte de nommage, notée dans le carnet de bord).

## role

_Entité **Rôle**._

| Champ | Type        | Spécificités                              | Description                       |
| ----- | ----------- | ----------------------------------------- | --------------------------------- |
| id    | INT         | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY | Identifiant unique du rôle        |
| name  | VARCHAR(50) | NOT NULL, UNIQUE                          | Nom du rôle (`customer`, `admin`) |

> Les deux lignes `customer` et `admin` sont insérées dès la création de la base (données de départ), avant tout utilisateur. Le premier compte administrateur est lui aussi créé dans les données de départ (mot de passe haché) : aucune route ne permet de créer un administrateur.

## account

_Entité **Utilisateur** + relation **Avoir** (Utilisateur 1,1 — Rôle 0,N → clé étrangère côté `account`)._

| Champ             | Type         | Spécificités                                                                                          | Description                                                                                                                                                          |
| ----------------- | ------------ | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                | INT          | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY                                                             | Identifiant unique de l'utilisateur                                                                                                                                  |
| email             | VARCHAR(255) | NOT NULL, UNIQUE                                                                                      | Email, utilisé pour la connexion                                                                                                                                     |
| password          | VARCHAR(255) | NOT NULL                                                                                              | Mot de passe **haché** (Argon2), jamais en clair                                                                                                                     |
| firstname         | VARCHAR(100) | NOT NULL                                                                                              | Prénom (obligatoire à l'inscription)                                                                                                                                 |
| lastname          | VARCHAR(100) | NOT NULL                                                                                              | Nom (obligatoire à l'inscription)                                                                                                                                    |
| address           | VARCHAR(255) |                                                                                                       | Adresse postale (facultative)                                                                                                                                        |
| account_type      | VARCHAR(20)  | NOT NULL, DEFAULT 'particulier', CHECK (account_type IN ('particulier', 'association', 'entreprise')) | Type de compte : `particulier`, `association`, `entreprise`                                                                                                          |
| organization_name | VARCHAR(150) |                                                                                                       | Nom de l'association ou de l'entreprise (facultatif, même si le compte n'est pas `particulier`)                                                                      |
| is_active         | BOOLEAN      | NOT NULL, DEFAULT TRUE                                                                                | Compte actif : `TRUE` dès l'inscription ; seul l'admin peut le passer à `FALSE` (`PATCH /api/admin/users/:id`). Un compte désactivé reçoit un **403** à la connexion |
| role_id           | INT          | NOT NULL, FK(role.id)                                                                                 | Rôle de l'utilisateur (relation **Avoir**) ; `customer` à l'inscription                                                                                              |

## category

_Entité **Catégorie**._

| Champ | Type         | Spécificités                              | Description                                           |
| ----- | ------------ | ----------------------------------------- | ----------------------------------------------------- |
| id    | INT          | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY | Identifiant unique de la catégorie                    |
| name  | VARCHAR(100) | NOT NULL, UNIQUE                          | Nom (résineux, feuillage caduc, feuillage persistant) |

## availability

_Entité **Disponibilité**._

| Champ | Type        | Spécificités                              | Description                                                                                                                                                                  |
| ----- | ----------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id    | INT         | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY | Identifiant unique de l'état                                                                                                                                                 |
| name  | VARCHAR(50) | NOT NULL, UNIQUE                          | Nom de l'état : `disponible` (visible et commandable), `en rupture de stock` (visible, non commandable), `retiré` (retiré du catalogue : masqué, conservé pour l'historique) |

> Les trois lignes sont insérées dès la création de la base (données de départ), comme pour `role`.

## tree

_Entité **Arbre** + relations **Appartenir** (Arbre 1,1 — Catégorie 0,N) et **Être** (Arbre 1,1 — Disponibilité 0,N) → clés étrangères côté `tree`._

| Champ             | Type          | Spécificités                              | Description                                                                       |
| ----------------- | ------------- | ----------------------------------------- | --------------------------------------------------------------------------------- |
| id                | INT           | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY | Identifiant unique de l'arbre                                                     |
| name              | VARCHAR(150)  | NOT NULL                                  | Nom de l'arbre                                                                    |
| description       | TEXT          |                                           | Description affichée sur la fiche                                                 |
| price             | NUMERIC(10,2) | NOT NULL, CHECK (price >= 0)              | Prix unitaire actuel, TTC                                                         |
| photo_url         | VARCHAR(255)  |                                           | Chemin de la photo, stockée en dur dans le projet (ex. `/images/trees/chene.jpg`) |
| planting_location | VARCHAR(150)  |                                           | Lieu de plantation (facultatif, affiché sur la fiche)                             |
| category_id       | INT           | NOT NULL, FK(category.id)                 | Catégorie de l'arbre (relation **Appartenir**)                                    |
| availability_id   | INT           | NOT NULL, FK(availability.id)             | État de disponibilité (relation **Être**)                                         |

## cart_item

_Table de liaison pour la relation **Contenir** (Utilisateur 0,N — Arbre 0,N). Elle porte la quantité. Le panier d'un client, c'est l'ensemble de ses lignes `cart_item` : il n'y a pas de table « panier », car un panier n'a aucune information propre._

| Champ      | Type | Spécificités                               | Description                                                                                         |
| ---------- | ---- | ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| id         | INT  | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY  | Identifiant de la ligne de panier (utilisé par `/api/cart/items/:id`)                               |
| account_id | INT  | NOT NULL, FK(account.id) ON DELETE CASCADE | Client à qui appartient la ligne de panier : pas de panier sans compte                              |
| tree_id    | INT  | NOT NULL, FK(tree.id) ON DELETE CASCADE    | Arbre ajouté. Si un arbre jamais commandé est supprimé, il disparaît des paniers qui le contiennent |
| quantity   | INT  | NOT NULL, DEFAULT 1, CHECK (quantity > 0)  | Quantité de cet arbre dans le panier                                                                |
|            |      | UNIQUE (account_id, tree_id)               | Un même arbre n'apparaît qu'une fois dans le panier d'un client : on augmente sa quantité           |

> Le panier est **réservé aux comptes connectés** : l'API lit les lignes du compte contenu dans le jeton JWT (`WHERE account_id = …`) et répond **401** si personne n'est connecté. Rien n'est créé à l'inscription : le panier est vide tant que le client n'a ajouté aucun arbre.

## purchase

_Entité **Commande** + relation **Passer** (Utilisateur 0,N — Commande 0,1 → clé étrangère côté `purchase`, facultative). La commande fige l'identité de l'acheteur et garde la date de chaque changement de statut._

| Champ              | Type          | Spécificités                                                                                    | Description                                                                                                                                                                                                                                                                                               |
| ------------------ | ------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                 | INT           | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY                                                       | Identifiant unique de la commande                                                                                                                                                                                                                                                                         |
| purchase_date      | TIMESTAMPTZ   | NOT NULL, DEFAULT now()                                                                         | Date de confirmation de la commande                                                                                                                                                                                                                                                                       |
| status             | VARCHAR(20)   | NOT NULL, DEFAULT 'en attente', CHECK (status IN ('en attente', 'payée', 'plantée', 'annulée')) | Statut, changé **manuellement par l'admin** (le client peut seulement annuler) : `en attente` (paiement attendu, à la création), `payée` (paiement reçu), `plantée` (arbre planté), `annulée` (par le client tant qu'elle était en attente, ou par l'admin si le paiement n'est pas arrivé sous 10 jours) |
| total_amount       | NUMERIC(10,2) | NOT NULL, CHECK (total_amount >= 0)                                                             | Montant total TTC, calculé à la confirmation                                                                                                                                                                                                                                                              |
| payment_method     | VARCHAR(20)   | NOT NULL, CHECK (payment_method IN ('virement', 'chèque'))                                      | Mode de paiement choisi : `virement` ou `chèque`. Rien n'est encaissé en ligne ; la carte bancaire et PayPal arriveront avec le paiement en ligne (évolution)                                                                                                                                             |
| buyer_firstname    | VARCHAR(100)  | NOT NULL                                                                                        | Prénom de l'acheteur **au moment de la commande**, copié depuis `account.firstname`                                                                                                                                                                                                                       |
| buyer_lastname     | VARCHAR(100)  | NOT NULL                                                                                        | Nom de l'acheteur **au moment de la commande**, copié depuis `account.lastname`                                                                                                                                                                                                                           |
| buyer_email        | VARCHAR(255)  | NOT NULL                                                                                        | Email de l'acheteur **au moment de la commande**, copié depuis `account.email` : destinataire des emails de la commande, même si le compte est supprimé                                                                                                                                                   |
| buyer_organization | VARCHAR(150)  |                                                                                                 | Structure de l'acheteur (association ou entreprise), copiée depuis `account.organization_name` (facultatif)                                                                                                                                                                                               |
| buyer_street       | VARCHAR(255)  | NOT NULL                                                                                        | Rue de l'adresse de facturation, saisie par le client à la commande                                                                                                                                                                                                                                       |
| buyer_postal_code  | VARCHAR(10)   | NOT NULL                                                                                        | Code postal de facturation (format vérifié par l'API selon le pays)                                                                                                                                                                                                                                       |
| buyer_city         | VARCHAR(100)  | NOT NULL                                                                                        | Ville de facturation                                                                                                                                                                                                                                                                                      |
| buyer_country      | CHAR(2)       | NOT NULL, CHECK (buyer_country IN ('FR', 'BE', 'DE', 'ES', 'GB', 'LU', 'CH', 'IT', 'NL', 'PT')) | Pays de facturation, code ISO à 2 lettres (pays européens)                                                                                                                                                                                                                                                |
| paid_at            | TIMESTAMPTZ   |                                                                                                 | Date de réception du paiement : renseignée quand l'admin passe la commande à `payée`                                                                                                                                                                                                                      |
| planted_at         | TIMESTAMPTZ   |                                                                                                 | Date de plantation : renseignée quand l'admin passe la commande à `plantée`                                                                                                                                                                                                                               |
| cancelled_at       | TIMESTAMPTZ   |                                                                                                 | Date d'annulation : renseignée quand la commande passe à `annulée` (par le client ou par l'admin)                                                                                                                                                                                                         |
| account_id         | INT           | FK(account.id) ON DELETE SET NULL                                                               | Client ayant passé la commande (relation **Passer**) ; devient `NULL` si le compte est supprimé                                                                                                                                                                                                           |

> Suppression de compte : le compte est supprimé, ses commandes sont **conservées** et leur `account_id` passe à `NULL`. L'identité de l'acheteur reste dans la commande (`buyer_*`) : elle est nécessaire à la comptabilité et à la facturation (pièces conservées 10 ans), ce que le RGPD autorise au titre d'une obligation légale. Les autres données du compte (mot de passe, type de compte, état) sont effacées.
> Annulation d'une commande : le client peut annuler sa commande **uniquement** si `status = 'en attente'` ; elle passe à `annulée`. Aucune commande n'est supprimée : les annulations restent tracées. Règle vérifiée par l'API.
> Paiement : le client doit cocher l'engagement de payer sous 10 jours (vérifié par l'API, non stocké). La date limite se calcule à partir de `purchase_date` (+ 10 jours) ; passé ce délai sans paiement, l'admin passe la commande à `annulée`.

## purchase_line

_Table de liaison pour la relation **Composer** (Commande 1,N — Arbre 0,N). Elle fige le nom de l'arbre, le prix payé et le lieu de plantation au moment de l'achat._

| Champ             | Type          | Spécificités                                | Description                                                                                                        |
| ----------------- | ------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| id                | INT           | PRIMARY KEY, GENERATED ALWAYS AS IDENTITY   | Identifiant de la ligne de commande                                                                                |
| purchase_id       | INT           | NOT NULL, FK(purchase.id) ON DELETE CASCADE | Commande concernée                                                                                                 |
| tree_id           | INT           | NOT NULL, FK(tree.id)                       | Arbre commandé : PostgreSQL refuse de supprimer un arbre déjà commandé (il passe à l'état « retiré du catalogue ») |
| tree_name         | VARCHAR(150)  | NOT NULL                                    | Nom de l'arbre **au moment de l'achat**, copié depuis `tree.name`                                                  |
| unit_price        | NUMERIC(10,2) | NOT NULL, CHECK (unit_price >= 0)           | Prix unitaire TTC **au moment de l'achat**                                                                         |
| planting_location | VARCHAR(150)  |                                             | Lieu de plantation **au moment de l'achat**, copié depuis `tree` (facultatif : `NULL` si l'arbre n'en avait pas)   |
| quantity          | INT           | NOT NULL, CHECK (quantity > 0)              | Quantité commandée                                                                                                 |
