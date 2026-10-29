import { Router } from "express";
import { router as treeRouter } from "../routers/treeRouter.ts";

export const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).send({ message: "je s'appelle Graine" });
});

router.use(treeRouter);
