import { Router } from "express";
import {
  getCart,
  addCartItem,
  updateCartItem,
  deleteCartItem,
} from "../controllers/cartController.ts";

export const router = Router();

// Le préfixe "/api" est déjà ajouté par app.use("/api", ...) dans app.ts :
// ici on n'écrit que la suite du chemin.

// Routes du panier : carte #100 (F4, Loïc), contrat de la carte #99.
// Toutes réservées au client connecté (sinon 401) ; l'id du client vient
// toujours du jeton (isConnected), jamais du body : un client ne touche
// jamais au panier d'un autre.

// GET /api/cart → panier du compte connecté (id lu dans le jeton par isConnected)
router.get("/", getCart);

// POST /api/cart/items → ajoute un arbre au panier ({ treeId, quantity } validé par Zod)
// un arbre déjà présent voit sa quantité augmenter (ON CONFLICT dans cartDatamapper)
router.post("/items", addCartItem);

// PATCH /api/cart/items/:id → change la quantité d'une ligne du panier (contrôleur à écrire)
router.patch("/items/:id", updateCartItem);

// DELETE /api/cart/items/:id → retire une ligne du panier (contrôleur à écrire)
router.delete("/items/:id", deleteCartItem);
