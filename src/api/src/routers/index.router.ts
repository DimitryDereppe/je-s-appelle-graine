import { Router } from "express";
import { pool } from "../data/db-client.ts";
export const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).send({ message: "je s'appelle Graine" });
});

router.get("/trees", async (_req, res) => {
  const sql_query = "SELECT * FROM tree;";
  const tree = await pool.query(sql_query);

  console.log(tree.rows);
  res.status(200).send(tree.rows);
});
