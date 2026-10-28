import { pool } from "../data/db-client.ts";
import type { ITree, IFeaturedTree } from "../@types/index.d.ts";

export const treeDatamapper = {
  async findAll(): Promise<ITree[]> {
    // Colonnes listées une par une pour pouvoir convertir le prix :
    // PostgreSQL stocke price en NUMERIC, que pg renvoie en texte ("9.90") ;
    // CAST(... AS FLOAT) le transforme en nombre (9.9), comme annoncé dans ITree.
    const sql_query = `
            SELECT id, name, description, CAST(price AS FLOAT) AS price,
                   photo_url, planting_location, category_id, availability_id
            FROM tree;
        `;
    const result = await pool.query(sql_query);
    return result.rows;
  },

  /**
   * Récupère les 3 arbres « mis en avant » sur la page d'accueil :
   * les 3 premiers (par id) parmi ceux disponibles à la vente.
   *
   * @returns un tableau d'au plus 3 arbres (IFeaturedTree), vide si aucun ne correspond
   */
  async findFeatured(): Promise<IFeaturedTree[]> {
    // Requête SQL écrite entre backticks (template literal) pour pouvoir
    // l'écrire sur plusieurs lignes et la garder lisible.
    const sql_query = `
            -- Seulement les colonnes utiles à la carte d'accueil, préfixées par
            -- "tree." (availability a aussi des colonnes id et name : sans préfixe,
            -- PostgreSQL ne saurait pas laquelle prendre).
            -- CAST(... AS FLOAT) : le prix arrive en nombre (9.9) et plus en texte ("9.90")
            SELECT tree.id, tree.name, CAST(tree.price AS FLOAT) AS price,
                   tree.photo_url, tree.category_id
            FROM tree
            -- On y associe leur statut de disponibilité
            -- (clé étrangère tree.availability_id → availability.id)
            JOIN availability ON tree.availability_id = availability.id
            -- On ne garde que les arbres en vente
            WHERE availability.name = 'available'
            -- Sans ORDER BY, PostgreSQL ne garantit aucun ordre : on trie par id
            -- pour que ce soient toujours les 3 mêmes arbres
            ORDER BY tree.id
            -- On n'en garde que 3
            LIMIT 3
        `;
    // pool.query envoie la requête à PostgreSQL ; "await" attend la réponse
    const result = await pool.query(sql_query);
    // result.rows contient les lignes renvoyées, sous forme de tableau d'objets
    return result.rows;
  },
};
