import { Router } from "express";
import { login, logout } from "../controllers/authController.ts";

export const router = Router();

router.post("/auth", login);
router.delete("/auth", logout);
