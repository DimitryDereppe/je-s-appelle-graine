import { Router } from "express";
import { login, logout } from "../controllers/authController.ts";
import { isConnected } from "../middlewares/isConnectedMiddleware.ts";

export const router = Router();

router.post("/auth", login);
router.delete("/auth", isConnected, logout);
