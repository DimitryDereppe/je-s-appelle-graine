import { Router } from "express";
import { validateId } from "../middlewares/commonMiddleware.ts";
import { createOrder, getOrder } from "../controllers/ordersController.ts";

export const router = Router();

// Le préfixe "/api/orders" et isConnected (sinon 401) sont déjà appliqués
// par router.use("/orders", isConnected, ordersRouter) dans indexRouter.ts :
// ici on n'écrit que la suite du chemin. Contrat de la carte #103.

// POST /api/orders → passe commande à partir du panier (transaction, carte #104)
router.post("/", createOrder);

// GET /api/orders/:id → détail d'une commande, pour la page de confirmation (carte #104, réutilisée par F6)
// 404 si la commande n'existe pas ou appartient à un autre client
router.get("/:id", validateId, getOrder);

// --- Routes d'autres cartes, à écrire plus tard ---

// GET /api/orders → historique des commandes du client (F6, carte #160)
// router.get("/");

// PATCH /api/orders/:id/status → changement de statut d'une commande (à préciser : F6 ou F8)
// router.patch("/:id/status", validateId);

// Les routes admin des commandes (F8) sont en commentaire dans adminRouter.ts
