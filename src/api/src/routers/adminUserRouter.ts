import { Router } from "express";
import {
  getAllUsers,
  getOneUser,
  updateUserStatus,
  deleteUser,
} from "../controllers/adminUserController.ts";
import { validateId } from "../middlewares/commonMiddleware.ts";

// Routes /api/admin/... (F7, F8, F9)
// Elles sont protégées une seule fois dans indexRouter.ts (isConnected + checkRoles(["admin"]))
export const router = Router();

router.get("/users", getAllUsers);
router.get("/users/:id", validateId, getOneUser);
router.patch("/users/:id", validateId, updateUserStatus);
router.delete("/users/:id", validateId, deleteUser);
