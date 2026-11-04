import { Router } from "express";
import {
  getAllCatalog,
  getFeaturedTrees,
  getOneTree,
} from "../controllers/treeController.ts";
import {
  validateId,
  validateCategoryQuery,
  validateSearchQuery,
} from "../middlewares/commonMiddleware.ts";

export const router = Router();

// Le préfixe "/api" est déjà ajouté par app.use("/api", ...) dans app.ts :
// ici on n'écrit que la suite du chemin.

// ROUTES PUBLIC
// GET /api/trees/featured → les arbres mis en avant sur l'accueil
router.get("/trees/featured", getFeaturedTrees);

// GET /api/trees → la liste de tous les arbres pour le catalogue
// GET /api/trees?category=:id → filtrée par catégorie
// GET /api/trees?search=:search → recherche par nom (combinable avec category)
router.get("/trees", validateCategoryQuery, validateSearchQuery, getAllCatalog);

// GET /api/trees/:id → un arbre pour la fiche arbre
router.get("/trees/:id", validateId, getOneTree);
