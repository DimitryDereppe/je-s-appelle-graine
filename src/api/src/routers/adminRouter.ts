import { Router } from "express";
// TODO F7 : décommenter quand adminTreeRouter.ts sera prêt
// import { adminTreeRouter } from "./adminTreeRouter.ts";

// Routes /api/admin/... (F7, F8, F9)
// Elles sont protégées une seule fois dans indexRouter.ts (isConnected + checkRoles(["admin"]))
export const router = Router();

// TODO F7 : enregistrer le routeur des arbres admin
// router.use(adminTreeRouter);
