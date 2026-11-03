import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import { router as apiRouter } from "./routers/index.router.ts";
import { validateContentType } from "./middlewares/validateContentTypeMiddleware.ts";

import cors from "cors";
import {
  globalErrorHandler,
  notFoundMiddleware,
} from "./middlewares/errorMiddleware.ts";

export const app = express();

app.use(cors());

app.use(express.json());

// Variables pour le dossier public (photos des arbres)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __public_dirname = `${__dirname}/public`;
app.use(express.static(__public_dirname));

app.use(validateContentType);

app.use(cookieParser());

// je branche le middleware apiRouter sur la router "/api"
/// https://expressjs.com/fr/5x/guide/using-middleware/
// (treeRouter y est déjà inclus via index.router.ts)
app.use("/api", apiRouter);

app.use(notFoundMiddleware); // middleware de gestion des routes non trouvées

app.use(globalErrorHandler); // middleware de gestion des erreurs globales
