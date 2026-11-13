import { Router } from "express";
import {
  getAllUsers,
  getOneUser,
  updateUserStatus,
  deleteUser,
} from "../controllers/adminUserController.ts";
import { validateId } from "../middlewares/commonMiddleware.ts";

// Routes admin des comptes (F9) : /api/admin/users...
// la protection (connecté + admin) est déjà dans indexRouter.ts
export const router = Router();

router.get("/users", getAllUsers);
router.get("/users/:id", validateId, getOneUser);
router.patch("/users/:id", validateId, updateUserStatus);
router.delete("/users/:id", validateId, deleteUser);
