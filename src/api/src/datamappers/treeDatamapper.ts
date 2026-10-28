import { pool } from "../data/db-client.ts";
import type { ITree, IFeaturedTree } from "../@types/index.d.ts";

const treeDatamapper = {
  async findAll(): Promise<ITree[]> {
    const sql_query = "SELECT * FROM tree;";
    const result = await pool.query(sql_query);
    return result.rows;
  },

  async findFeatured(): Promise<IFeaturedTree[]> {
    const sql_query = `
            SELECT * FROM tree
            JOIN availability ON trees.id = availability.tree_id
            WHERE availability.is_available = true
            WHERE availability.start_date <= NOW() AND availability.end_date >= NOW()
        `;
    const result = await pool.query(sql_query);
    return result.rows;
  },
};

export default treeDatamapper;
