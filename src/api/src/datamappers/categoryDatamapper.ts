import { pool } from "../data/db-client.ts";
import type { ICategory } from "../@types/index.d.ts";

export const categoryDatamapper = {
  // toutes les catégories, dans l'ordre des id (Résineux, Feuillage caduc, …)
  async findAll(): Promise<ICategory[]> {
    const sqlQuery = `
      SELECT id, name
      FROM category
      ORDER BY id;
    `;
    const result = await pool.query<ICategory>(sqlQuery);
    return result.rows;
  },
};
