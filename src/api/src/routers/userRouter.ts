import { Router } from "express";
import { register } from "../controllers/userController.ts";

export const router = Router();

router.post("/users", register);
// router.get("/users/me")
// router.patch("/users/me")
// router.patch("/users/me/password")
// router.delete("/users/me")
