import { Router } from "express";
import { validateId } from "../middlewares/commonMiddleware.ts";
import { isConnected } from "../middlewares/isConnectedMiddleware.ts";
import { getCart, addCartItem } from "../controllers/cartController.ts";

export const router = Router();

// Le préfixe "/api" est déjà ajouté par app.use("/api", ...) dans app.ts :
// ici on n'écrit que la suite du chemin.

// Routes du panier : carte #100 (F4, Loïc), contrat de la carte #99.
// Toutes réservées au client connecté (sinon 401) ; l'id du client vient
// toujours du jeton (isConnected), jamais du body : un client ne touche
// jamais au panier d'un autre.

// GET /api/cart → panier du compte connecté (id lu dans le jeton par isConnected)
router.get("/cart", isConnected, getCart);

// POST /api/cart/items → ajoute un arbre au panier ({ treeId, quantity } validé par Zod)
// un arbre déjà présent voit sa quantité augmenter (ON CONFLICT dans cartDatamapper)
router.post("/cart/items", isConnected, addCartItem);

// PATCH /api/cart/items/:id → change la quantité d'une ligne du panier (contrôleur à écrire)
router.patch("/cart/items/:id", isConnected, validateId);

// DELETE /api/cart/items/:id → retire une ligne du panier (contrôleur à écrire)
router.delete("/cart/items/:id", isConnected, validateId);
