import { Router } from "express";
import { router as treeRouter } from "./treeRouter.ts";
import { router as authRouter } from "./authRouter.ts";
import { router as userRouter } from "./userRouter.ts";
export const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).send({ message: "je s'appelle Graine" });
});

router.use(treeRouter);
router.use(authRouter);
router.use(userRouter);
