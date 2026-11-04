import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import { router as apiRouter } from "./routers/indexRouter.ts";
import { validateContentType } from "./middlewares/validateContentTypeMiddleware.ts";

import cors from "cors";
import { config } from "../config.ts";
import {
  globalErrorHandler,
  notFoundMiddleware,
} from "./middlewares/errorMiddleware.ts";

export const app = express();

// CORS : seul notre front peut lire les réponses de l'API ; credentials pour le cookie accessToken
app.use(cors({ origin: config.allowedOrigins, credentials: true }));

app.use(express.json());

// Variables pour le dossier public (photos des arbres)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __public_dirname = `${__dirname}/public`;
app.use(express.static(__public_dirname));

// Middleware pour valider le Content-Type des requêtes, la réponse doit être en JSON pour les routes de l'API
app.use(validateContentType);

app.use(cookieParser());

// je branche le middleware apiRouter sur la router "/api"
/// https://expressjs.com/fr/5x/guide/using-middleware/
// (treeRouter y est déjà inclus via index.router.ts)
app.use("/api", apiRouter);

app.use(notFoundMiddleware); // middleware de gestion des routes non trouvées

app.use(globalErrorHandler); // middleware de gestion des erreurs globales
