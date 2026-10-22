# Modèle physique de données — Je s’appelle Graine

## Schéma

![MPD Je s’appelle Graine](07b-mpd.drawio.svg)

Notation : souligné = clé primaire, `#` = clé étrangère, `IDENTITY` = `GENERATED ALWAYS AS IDENTITY` (id numéroté automatiquement par PostgreSQL).

## Du MLD au MPD

| Ce que le MPD ajoute | Exemple dans Je s’appelle Graine | À quoi ça sert |
| --- | --- | --- |
| **Type** | `price NUMERIC(10,2)`, `purchase_date TIMESTAMPTZ` | Stocker la donnée au bon format (montant exact, date avec fuseau) |
| **NOT NULL** | `email VARCHAR(255) NOT NULL`, `cart_item.account_id INT NOT NULL` (pas de panier sans compte) | Rendre la colonne obligatoire |
| **UNIQUE** | `email`, `(account_id, tree_id)` dans `cart_item` | Interdire les doublons |
| **DEFAULT** | `status DEFAULT 'pending'`, `account_type DEFAULT 'individual'`, `is_active DEFAULT TRUE` | Valeur mise automatiquement si on n'en donne pas |
| **CHECK** | `quantity > 0`, `status IN ('pending', 'paid', 'planted', 'cancelled')`, `payment_method IN ('transfer', 'check')` | Refuser les valeurs incohérentes |
| **ON DELETE** | `CASCADE`, `SET NULL` | Dire ce que deviennent les lignes liées quand on supprime la ligne visée |

## Extension PostgreSQL

| Extension | Activation | À quoi ça sert |
| --- | --- | --- |
| `unaccent` | `CREATE EXTENSION IF NOT EXISTS unaccent;` (une fois par base, en tête du script de création, avant les tables) | Fournit la fonction `unaccent()`, qui retire les accents d'un texte. La recherche par nom (US03b, `GET /api/trees?search=`) l'applique des deux côtés : `unaccent(name) ILIKE unaccent('%' || $1 || '%')`, donc « chene » trouve « Chêne pédonculé » |

> L'extension ne crée ni table ni colonne : le schéma ci-dessus ne change pas.

## Comportements à la suppression

| Clé étrangère | Règle | Quand on supprime... | Résultat |
| --- | --- | --- | --- |
| `cart_item.account_id` | `ON DELETE CASCADE` | un compte | son panier (ses lignes `cart_item`) est supprimé aussi |
| `cart_item.tree_id` | `ON DELETE CASCADE` | un arbre jamais commandé | il est retiré des paniers qui le contiennent |
| `purchase.account_id` | `ON DELETE SET NULL` | un compte | ses commandes sont **conservées**, sans propriétaire ; l'identité de l'acheteur reste dans `buyer_*` |
| `purchase_line.purchase_id` | `ON DELETE CASCADE` | une commande | ses lignes de commande sont supprimées |
| `account.role_id`, `tree.category_id`, `tree.availability_id`, `purchase_line.tree_id` | aucune (par défaut) | un rôle, une catégorie ou un état de disponibilité encore utilisé, un arbre déjà commandé | PostgreSQL **refuse** la suppression |

> Un arbre déjà commandé n'est donc jamais supprimé : l'admin le passe à l'état « retiré du catalogue ». Le nom de l'arbre, le prix et le lieu de plantation sont copiés dans `purchase_line` à la création de la commande : l'historique ne dépend pas des modifications du catalogue.

## Règle de gestion non couverte par le MPD

Le client peut annuler une commande **uniquement si elle est `pending`** (`PATCH /api/orders/:id/status`) : elle passe à `cancelled`. Aucune commande n'est supprimée : les annulations restent tracées. Les autres changements de statut sont faits **manuellement par l'admin**.

Une contrainte `CHECK` ne connaît pas l'ancien statut : ces transitions sont donc vérifiées par l'**API**.

De même, l'**API** vérifie que le client a coché l'engagement de payer sous 10 jours avant de créer la commande. Passé ce délai sans paiement, l'admin passe la commande à `cancelled`.
