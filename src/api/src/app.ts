import express from "express";
import { router as apiRouter } from "./routers/index.router.ts";
import cors from "cors";
import {
  globalErrorHandler,
  notFoundMiddleware,
} from "./middlewares/errorMiddleware.ts";

export const app = express();

app.use(cors());

app.use(express.json());
// je branche le middleware apiRouter sur la router "/api"
/// https://expressjs.com/fr/5x/guide/using-middleware/
// (treeRouter y est déjà inclus via index.router.ts)
app.use("/api", apiRouter);

app.use(notFoundMiddleware); // middleware de gestion des routes non trouvées

app.use(globalErrorHandler); // middleware de gestion des erreurs globales
