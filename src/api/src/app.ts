import express from "express";
import { router as apiRouter } from "./routers/index.router.ts";
import cors from "cors";
import { router as treeRouter } from "./routers/treeRouter.ts";

export const app = express();

app.use(cors());

app.use(express.json());
// je branche le middleware apiRouter sur la router "/api"
/// https://expressjs.com/fr/5x/guide/using-middleware/
app.use("/api", apiRouter);

app.use("/api", treeRouter);
