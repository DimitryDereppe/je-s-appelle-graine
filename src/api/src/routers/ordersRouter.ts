import { Router } from "express";
import { validateId } from "../middlewares/commonMiddleware.ts";
import { isConnected } from "../middlewares/isConnectedMiddleware.ts";
import { createOrder, getOrder } from "../controllers/ordersController.ts";

export const router = Router();

// Le préfixe "/api" est déjà ajouté par app.use("/api", ...) dans app.ts :
// ici on n'écrit que la suite du chemin.
// Routes réservées au client connecté (sinon 401), contrat de la carte #103.

// POST /api/orders → passe commande à partir du panier (transaction, carte #104)
router.post("/orders", isConnected, createOrder);

// GET /api/orders/:id → détail d'une commande, pour la page de confirmation (carte #104, réutilisée par F6)
// 404 si la commande n'existe pas ou appartient à un autre client
router.get("/orders/:id", isConnected, validateId, getOrder);

// --- Routes d'autres cartes, à écrire plus tard ---

// GET /api/orders → historique des commandes du client (F6, carte #160)
// router.get("/orders", isConnected);

// PATCH /api/orders/:id/status → changement de statut d'une commande (à préciser : F6 ou F8)
// router.patch("/orders/:id/status", isConnected, validateId);

// Les routes admin des commandes (F8) sont en commentaire dans adminRouter.ts
