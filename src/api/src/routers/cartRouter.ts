import { Router } from "express";
import { validateId } from "../middlewares/commonMiddleware.ts";
import { isConnected } from "../middlewares/isConnectedMiddleware.ts";
import { getCart } from "../controllers/cartController.ts";

export const router = Router();

// Le préfixe "/api" est déjà ajouté par app.use("/api", ...) dans app.ts :
// ici on n'écrit que la suite du chemin.

// GET /api/cart → panier du compte connecté (id lu dans le jeton par isConnected)
router.get("/cart", isConnected, getCart);
router.post("/cart/items", isConnected);
router.patch("/cart/items/:id", isConnected, validateId);
router.delete("/cart/items/:id", isConnected, validateId);
