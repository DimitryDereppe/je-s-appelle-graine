import { Router } from "express";
import { router as treeRouter } from "./treeRouter.ts";
import { router as authRouter } from "./authRouter.ts";
import { router as userRouter } from "./userRouter.ts";
import { router as adminRouter } from "./adminRouter.ts";
import { router as cartRouter } from "./cartRouter.ts";
import { router as ordersRouter } from "./ordersRouter.ts";
import {
  checkRoles,
  isConnected,
} from "../middlewares/isConnectedMiddleware.ts";
export const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).send({ message: "je s'appelle Graine 🌲" });
});

router.use(treeRouter);
router.use(authRouter);
router.use(userRouter);
router.use(cartRouter);

// /api/admin/... : connecté (sinon 401) ET administrateur (sinon 403), pour toutes les routes du routeur
router.use("/admin", isConnected, checkRoles(["admin"]), adminRouter);

// /api/orders/... : connecté (sinon 401) pour toutes les routes du routeur
router.use("/cart", isConnected, cartRouter);

// /api/orders/... : connecté (sinon 401) pour toutes les routes du routeur
router.use("/orders", isConnected, ordersRouter);
