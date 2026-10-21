# Modèle physique de données — Je s’appelle Graine

## Schéma

![MPD Je s’appelle Graine](07b-mpd.drawio.svg)

Notation : souligné = clé primaire, `#` = clé étrangère, `IDENTITY` = `GENERATED ALWAYS AS IDENTITY` (id numéroté automatiquement par PostgreSQL).

## Du MLD au MPD

| Ce que le MPD ajoute | Exemple dans Je s’appelle Graine | À quoi ça sert |
| --- | --- | --- |
| **Type** | `price NUMERIC(10,2)`, `purchase_date TIMESTAMPTZ` | Stocker la donnée au bon format (montant exact, date avec fuseau) |
| **NOT NULL** | `email VARCHAR(255) NOT NULL`, `cart.account_id INT NOT NULL` (pas de panier sans compte) | Rendre la colonne obligatoire |
| **UNIQUE** | `email`, `cart.account_id`, `(cart_id, tree_id)` | Interdire les doublons |
| **DEFAULT** | `status DEFAULT 'pending'`, `account_type DEFAULT 'individual'`, `is_active DEFAULT TRUE` | Valeur mise automatiquement si on n'en donne pas |
| **CHECK** | `quantity > 0`, `status IN ('pending', 'paid', 'planted', 'cancelled')`, `payment_method IN ('transfer', 'card', 'check', 'paypal')` | Refuser les valeurs incohérentes |
| **ON DELETE** | `CASCADE`, `SET NULL` | Dire ce que deviennent les lignes liées quand on supprime la ligne visée |

## Comportements à la suppression

| Clé étrangère | Règle | Quand on supprime... | Résultat |
| --- | --- | --- | --- |
| `cart.account_id` | `ON DELETE CASCADE` | un compte | son panier est supprimé aussi |
| `cart_item.cart_id` | `ON DELETE CASCADE` | un panier | ses lignes de panier sont supprimées |
| `purchase.account_id` | `ON DELETE SET NULL` | un compte | ses commandes sont **conservées**, sans propriétaire |
| `purchase_line.purchase_id` | `ON DELETE CASCADE` | une commande | ses lignes de commande sont supprimées |
| `account.role_id`, `tree.category_id`, `tree.availability_id`, `cart_item.tree_id`, `purchase_line.tree_id` | aucune (par défaut) | un rôle, une catégorie, un état de disponibilité, un arbre encore utilisé (dans un panier ou une commande) | PostgreSQL **refuse** la suppression |

> Un arbre déjà commandé n'est donc jamais supprimé : l'admin le passe à l'état « retiré du catalogue ». L'historique des commandes lit son nom et son lieu de plantation dans `tree`.

## Règle de gestion non couverte par le MPD

Le client **n'a pas le droit** de supprimer une commande. Le statut est changé **manuellement par l'admin**.

Une contrainte `ON DELETE` ne regarde pas la valeur du statut : cette règle est donc vérifiée par l'**API**, avant le `DELETE`.

De même, l'**API** vérifie que le client a coché l'engagement de payer sous 10 jours avant de créer la commande. Passé ce délai sans paiement, l'admin passe la commande à `cancelled`.
