import { Router } from "express";
import * as adminOrderController from "../controllers/adminOrderController.ts";

export const router = Router();

// GET /api/admin/orders : la liste des commandes
router.get("/orders", adminOrderController.getAllOrders);
