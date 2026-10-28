import { pool } from "../data/db-client.ts";
import type { ITree, IFeaturedTree } from "../@types/index.d.ts";

const treeDatamapper = {
  async findAll(): Promise<ITree[]> {
    const sql_query = "SELECT * FROM tree;";
    const result = await pool.query(sql_query);
    return result.rows;
  },

  /**
   * Récupère les arbres « mis en avant » sur la page d'accueil :
   * ceux qui sont disponibles à la vente aujourd'hui.
   *
   * @returns un tableau d'arbres (IFeaturedTree), vide si aucun ne correspond
   */
  async findFeatured(): Promise<IFeaturedTree[]> {
    // Requête SQL écrite entre backticks (template literal) pour pouvoir
    // l'écrire sur plusieurs lignes et la garder lisible.
    const sql_query = `
            -- On part de la table des arbres
            SELECT * FROM tree
            -- On y associe leurs périodes de disponibilité
            -- (clé étrangère availability.tree_id → id de l'arbre)
            JOIN availability ON trees.id = availability.tree_id
            -- On ne garde que les disponibilités actives...
            WHERE availability.is_available = true
            -- ...dont la période englobe la date du jour (NOW())
            WHERE availability.start_date <= NOW() AND availability.end_date >= NOW()
        `;
    // pool.query envoie la requête à PostgreSQL ; "await" attend la réponse
    const result = await pool.query(sql_query);
    // result.rows contient les lignes renvoyées, sous forme de tableau d'objets
    return result.rows;
  },
};

export default treeDatamapper;
