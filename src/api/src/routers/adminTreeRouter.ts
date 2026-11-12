import { Router } from "express";
import * as adminTreeController from "../controllers/adminTreeController.ts";

import { validateId } from "../middlewares/commonMiddleware.ts";

export const router = Router();

// GET /api/admin/trees
router.get("/trees", adminTreeController.findAll);

// GET /api/admin/trees/:id
router.get("/trees/:id", validateId, adminTreeController.findById);

// GET /api/admin/availabilities
router.get("/availabilities", adminTreeController.findAllAvailabilities);

// POST /api/admin/trees
router.post("/trees", adminTreeController.create);

// PATCH /api/admin/trees/:id
router.patch("/trees/:id", validateId, adminTreeController.update);

// DELETE /api/admin/trees/:id
router.delete("/trees/:id", validateId, adminTreeController.deleteById);
