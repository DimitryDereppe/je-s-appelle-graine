import { pool } from "../data/db-client.ts";
import type { ITree, IFeaturedTree } from "../@types/index.d.ts";

export const treeDatamapper = {
  async findAllCatalog(): Promise<ITree[]> {
    // Colonnes listées une par une pour pouvoir convertir le prix :
    // PostgreSQL stocke price en NUMERIC, que pg renvoie en texte ("9.90") ;
    // CAST(... AS FLOAT) le transforme en nombre (9.9), comme annoncé dans ITree.
    // Colonnes préfixées par "tree." : availability a aussi des colonnes id et name,
    // sans préfixe PostgreSQL ne saurait pas laquelle prendre (erreur "ambiguous").
    const sqlQuery = `
            SELECT tree.id, tree.name, tree.description, CAST(tree.price AS FLOAT) AS price,
                   tree.photo_url AS "photoUrl", tree.planting_location AS "plantingLocation",
                   tree.category_id AS "categoryId", tree.availability_id AS "availabilityId"
            FROM tree
            -- On y associe leur statut de disponibilité
            -- (clé étrangère tree.availability_id → availability.id)
            JOIN availability ON tree.availability_id = availability.id
            -- On ne garde que les arbres en vente
            WHERE availability.name = 'available';
        `;
    const result = await pool.query(sqlQuery);
    return result.rows;
  },

  /**
   * Récupère les 3 arbres « mis en avant » sur la page d'accueil :
   * les 3 derniers ajoutés (id le plus grand) parmi ceux disponibles à la vente.
   *
   * @returns un tableau d'au plus 3 arbres (IFeaturedTree), vide si aucun ne correspond
   */
  async findFeatured(): Promise<IFeaturedTree[]> {
    // Requête SQL écrite entre backticks (template literal) pour pouvoir
    // l'écrire sur plusieurs lignes et la garder lisible.
    const sqlQuery = `
            -- Seulement les colonnes utiles à la carte d'accueil, préfixées par
            -- "tree." (availability a aussi des colonnes id et name : sans préfixe,
            -- PostgreSQL ne saurait pas laquelle prendre).
            -- CAST(... AS FLOAT) : le prix arrive en nombre (9.9) et plus en texte ("9.90")
            -- json_build_object : la catégorie arrive en objet { id, name }
            -- AS "photoUrl" : guillemets obligatoires, sinon PostgreSQL renvoie "photourl"
            SELECT tree.id, tree.name, CAST(tree.price AS FLOAT) AS price,
                   tree.photo_url AS "photoUrl",
                   tree.planting_location AS "plantingLocation",
                   json_build_object('id', category.id, 'name', category.name) AS category
            FROM tree
            -- On y associe leur catégorie (clé étrangère tree.category_id → category.id)
            JOIN category ON tree.category_id = category.id
            -- On y associe leur statut de disponibilité
            -- (clé étrangère tree.availability_id → availability.id)
            JOIN availability ON tree.availability_id = availability.id
            -- On ne garde que les arbres en vente
            WHERE availability.name = 'available'
            -- Du plus récent au plus ancien (id le plus grand en premier)
            ORDER BY tree.id DESC
            -- On n'en garde que 3
            LIMIT 3
        `;
    // pool.query envoie la requête à PostgreSQL ; "await" attend la réponse
    const result = await pool.query(sqlQuery);
    // result.rows contient les lignes renvoyées, sous forme de tableau d'objets
    return result.rows;
  },
};
