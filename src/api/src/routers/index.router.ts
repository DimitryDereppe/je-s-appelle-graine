import { Router } from "express";
import { router as treeRouter } from "../routers/treeRouter.ts";
// import { router as authRouter } from "../routers/authRouter.ts";
export const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).send({ message: "je s'appelle Graine" });
});

router.use(treeRouter);
// router.use(authRouter);
