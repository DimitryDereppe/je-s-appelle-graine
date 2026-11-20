import { Router } from "express";
import {
  getAllCatalog,
  getAllLocations,
  getFeaturedTrees,
  getOneTree,
} from "../controllers/treeController.ts";
import {
  validateId,
  validateCategoryQuery,
  validateSearchQuery,
  validateLocationQuery,
} from "../middlewares/commonMiddleware.ts";

import { getAllCategories } from "../controllers/treeController.ts";

export const router = Router();

// Le préfixe "/api" est déjà ajouté par app.use("/api", ...) dans app.ts :
// ici on n'écrit que la suite du chemin.

// ROUTES PUBLIC
// GET /api/trees/featured → les arbres mis en avant sur l'accueil
router.get("/trees/featured", getFeaturedTrees);

// GET /api/trees → la liste de tous les arbres pour le catalogue
// GET /api/trees?category=:id → filtrée par catégorie
// GET /api/trees?search=:search → recherche par nom (combinable avec category)
// GET /api/trees?location=:lieu → filtrée par lieu (combinable avec category et search)
router.get(
  "/trees",
  validateCategoryQuery,
  validateSearchQuery,
  validateLocationQuery,
  getAllCatalog,
);

// GET /api/trees/locations → la liste des lieux, pour le filtre du catalogue
// AVANT /trees/:id : sinon Express lirait "locations" comme un id
router.get("/trees/locations", getAllLocations);

// GET /api/trees/:id → un arbre pour la fiche arbre
router.get("/trees/:id", validateId, getOneTree);

//GET /api/categories : la liste des catégories
router.get("/categories", getAllCategories);
