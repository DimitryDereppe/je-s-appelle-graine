import { Router } from "express";
import {
  getAllTrees,
  getFeaturedTrees,
} from "../controllers/treeController.ts";

export const router = Router();

// Le préfixe "/api" est déjà ajouté par app.use("/api", ...) dans app.ts :
// ici on n'écrit que la suite du chemin.

// GET /api/trees/featured → les arbres mis en avant sur l'accueil
router.get("/trees/featured", getFeaturedTrees);

// GET /api/trees → la liste de tous les arbres
router.get("/trees", getAllTrees);
