import { Router } from "express";
import { router as adminUserRouter } from "./adminUserRouter.ts";

// Routes /api/admin/... (F7, F8, F9)
// Elles sont protégées une seule fois dans indexRouter.ts (isConnected + checkRoles(["admin"]))
export const router = Router();

router.use(adminUserRouter);
