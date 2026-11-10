import { Router } from "express";
import * as adminOrderController from "../controllers/adminOrderController.ts";
import { validateId } from "../middlewares/commonMiddleware.ts";

export const router = Router();

// GET /api/admin/orders : la liste des commandes
router.get("/orders", adminOrderController.getAllOrders);

// GET /api/admin/orders/:id : le détail d'une commande
router.get("/orders/:id", validateId, adminOrderController.getOrderById);

// PATCH /api/admin/orders/:id/status : modifier l'état d'une commande
router.patch(
  "/orders/:id/status",
  validateId,
  adminOrderController.updateOneOrder,
);
