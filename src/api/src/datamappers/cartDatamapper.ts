import { pool } from "../data/db-client.ts";
import type { ICartItem } from "../@types/index.d.ts";

export const cartDatamapper = {
  async findCartByUserId(userId: number): Promise<ICartItem[]> {
    const sqlQuery = `
    -- colonnes de la ligne de panier, renommées en camelCase pour le JS
    SELECT cart_item.id, cart_item.account_id AS "accountId",
           cart_item.tree_id AS "treeId", cart_item.quantity,
           -- infos de l'arbre (nom, prix, photo) pour afficher le panier
           tree.name,
           -- NUMERIC arrive en texte dans Node ("16.90") : CAST le change en nombre
           CAST(tree.price AS FLOAT) AS price,
           tree.photo_url AS "photoUrl",
           -- lieu de plantation : copié dans purchase_line à la commande
           tree.planting_location AS "plantingLocation",
           -- nom de la disponibilité ('disponible', 'en rupture de stock', 'retiré')
           -- pour refuser la commande (409) si un arbre n'est plus disponible
           availability.name AS "availabilityName"
    FROM cart_item

    -- à chaque ligne du panier, on colle l'arbre correspondant
    JOIN tree ON cart_item.tree_id = tree.id

    -- à chaque arbre, on colle sa disponibilité
    -- (clé étrangère tree.availability_id → availability.id)
    JOIN availability ON tree.availability_id = availability.id

    -- seulement les lignes du panier de ce compte ($1 = userId)
    WHERE cart_item.account_id = $1;
    `;
    const result = await pool.query(sqlQuery, [userId]);
    return result.rows;
  },

  async addCartItem(userId: number, treeId: number, quantity: number) {
    const sqlQuery = `
    -- ajoute un arbre au panier ($1 = userId, $2 = treeId, $3 = quantité)
    INSERT INTO cart_item (account_id, tree_id, quantity) VALUES ($1, $2, $3)

    -- cet arbre est déjà dans le panier de ce compte (contrainte UNIQUE) :
    -- au lieu d'une erreur, on met à jour la ligne existante
    ON CONFLICT (account_id, tree_id)

    -- cart_item.quantity = quantité déjà dans le panier
    -- EXCLUDED.quantity = quantité qu'on voulait insérer ($3)
    -- on additionne les deux : 2 chênes + 3 chênes = 5 chênes
    DO UPDATE SET quantity = cart_item.quantity + EXCLUDED.quantity
    -- renvoie la ligne insérée ou mise à jour, pour que le contrôleur sache ce qui a été fait
    -- colonnes listées une par une pour les renommer en camelCase, comme dans treeDatamapper
    -- (guillemets obligatoires, sinon PostgreSQL renvoie "accountid" en minuscules)
    RETURNING id, account_id AS "accountId", tree_id AS "treeId", quantity;
    `;
    const result = await pool.query(sqlQuery, [userId, treeId, quantity]);
    // une seule ligne insérée ou mise à jour : rows[0]
    return result.rows[0];
  },
};
