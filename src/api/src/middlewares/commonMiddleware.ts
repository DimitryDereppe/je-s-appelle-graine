import type { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../lib/errors.ts";

// Middleware commun pour valider un id dans l'URL
export function validateId(req: Request, _res: Response, next: NextFunction) {
  // 1. Récupérer l'id dans l'URL
  const id = Number(req.params.id);

  // 2. Si id est un entier et > 0
  if (Number.isInteger(id) && id > 0) {
    // ok appelle le middleware suivant
    // ne pas oublier le return !
    return next();
  }

  // cas par défaut : ID invalide
  throw new BadRequestError("Identifiant invalide");
}
