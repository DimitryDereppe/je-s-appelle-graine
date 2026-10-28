import { pool } from "../data/db-client.ts";

const treeDatamapper = {
  async findAll() {
    const sql_query = "SELECT * FROM tree;";
    const result = await pool.query(sql_query);
    return result.rows;
  },

  async findFeatured() {
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
