import { Router } from "express";
import {
  getAllTrees,
  getFeaturedTrees,
} from "../controllers/treeController.ts";

export const router = Router();

// je branche le middleware treeController sur la router "/api/trees/featured"
router.get("/api/trees/featured", getFeaturedTrees);

// je branche le middleware treeController sur la router "/api/trees/"
router.get("/api/trees", getAllTrees);
