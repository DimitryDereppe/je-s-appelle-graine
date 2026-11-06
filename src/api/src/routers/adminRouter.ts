import { Router } from "express";

// Routes /api/admin/... (F7, F8, F9)
// Elles sont protégées une seule fois dans indexRouter.ts (isConnected + checkRoles(["admin"]))
export const router = Router();

// --- Commandes (F8, contrat carte #167), à écrire plus tard ---
// le préfixe "/admin" est ajouté par indexRouter.ts : on n'écrit que la suite du chemin
// validateId est à importer depuis ../middlewares/commonMiddleware.ts au moment de les écrire

// GET /api/admin/orders → liste de toutes les commandes
// router.get("/orders");

// GET /api/admin/orders/:id → détail d'une commande
// router.get("/orders/:id", validateId);

// PATCH /api/admin/orders/:id/status → changer le statut d'une commande (ex. « payée »)
// router.patch("/orders/:id/status", validateId);
