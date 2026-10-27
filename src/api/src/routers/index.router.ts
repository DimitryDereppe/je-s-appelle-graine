import { Router } from "express";
import { client } from "../data/db-client.ts";
export const router = Router();

router.get("/health",  (_req, res) => {
 res.status(200).json({status:"je s'appelle Graine"});
});


router.get("/", async (_req, res) => {

    const sql_query = "SELECT * FROM tree;";
    const tree = await client.query(sql_query);

console.log (tree.rows)
    res.status(200).send(tree.rows);

    
  });
