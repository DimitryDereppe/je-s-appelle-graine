import { Router } from "express";
import { router as adminUserRouter } from "./adminUserRouter.ts";
import { router as adminTreeRouter } from "./adminTreeRouter.ts";
import { router as adminOrderRouter } from "./adminOrderRouter.ts";

// Routes /api/admin/... (F7, F8, F9)
// Elles sont protégées une seule fois dans indexRouter.ts (isConnected + checkRoles(["admin"]))
export const router = Router();

router.use(adminUserRouter);
// enregistrer le routeur des arbres admin
router.use(adminTreeRouter);
// enregistrer le routeur des commandes admin
router.use(adminOrderRouter);
