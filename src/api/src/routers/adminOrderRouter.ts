import { Router } from "express";
import * as adminOrderController from "../controllers/adminOrderController.ts";
import { validateId } from "../middlewares/commonMiddleware.ts";

export const router = Router();

// GET /api/admin/orders : la liste des commandes
router.get("/orders", adminOrderController.getAllOrders);

// GET /api/admin/orders/:id : le détail d'une commande
// validateId : 400 si l'id n'est pas un entier > 0
router.get("/orders/:id", validateId, adminOrderController.getOrderById);
