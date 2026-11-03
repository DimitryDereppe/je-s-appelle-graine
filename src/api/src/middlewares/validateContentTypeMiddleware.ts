import type { NextFunction, Request, Response } from "express";
import { ContentTypeError } from "../lib/errors.ts";

// Middleware : le body des requêtes POST, PUT et PATCH doit être du JSON → sinon 415
export function validateContentType(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  // 1. Les autres méthodes (GET, DELETE...) n'envoient pas de body : rien à contrôler
  const methodsWithBody = ["POST", "PUT", "PATCH"];
  if (!methodsWithBody.includes(req.method)) {
    return next();
  }

  // 2. Lire l'en-tête Content-Type (undefined s'il est absent)
  const contentType = req.get("Content-Type");

  // 3. Accepter aussi "application/json; charset=utf-8" → startsWith
  if (contentType !== undefined && contentType.startsWith("application/json")) {
    return next();
  }

  // cas par défaut : body qui n'est pas du JSON
  throw new ContentTypeError("Le contenu doit être au format JSON.");
}
