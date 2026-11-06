import { Router } from "express";
import {
  getMe,
  register,
  updateMe,
  changePassword,
  deleteMe,
} from "../controllers/userController.ts";
import { isConnected } from "../middlewares/isConnectedMiddleware.ts";

export const router = Router();

// POST /api/users → créer le compte
router.post("/users", register);
// GET /api/users/me → qui est connecté (l'en-tête du front l'appelle après un rechargement)
router.get("/users/me", isConnected, getMe);
// PATCH /api/users/me → modifie le compte connecté
router.patch("/users/me", isConnected, updateMe);
// PATCH /api/users/me/password → change le mot de passe du compte connecté
router.patch("/users/me/password", isConnected, changePassword);
// DELETE /api/users/me → effacer le compte connecté
router.delete("/users/me", isConnected, deleteMe);
