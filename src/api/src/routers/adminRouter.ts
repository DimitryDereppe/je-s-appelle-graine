import { Router } from "express";

// Routes /api/admin/... (F7, F8, F9)
// Elles sont protégées une seule fois dans indexRouter.ts (isConnected + checkRoles(["admin"])) :
// une route ajoutée ici ne peut pas être exposée par oubli.
export const router = Router();
