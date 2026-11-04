import { Router } from "express";
import { getMe, register } from "../controllers/userController.ts";
import { isConnected } from "../middlewares/isConnectedMiddleware.ts";

export const router = Router();

router.post("/users", register);
// GET /api/users/me → qui est connecté (l'en-tête du front l'appelle après un rechargement)
router.get("/users/me", isConnected, getMe);
// router.patch("/users/me")
// router.patch("/users/me/password")
// router.delete("/users/me")
