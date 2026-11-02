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

// Plus grande valeur d'une colonne INT de PostgreSQL
const MAX_ID = 2147483647;

// Middleware pour valider le filtre ?category=:id (facultatif)
export function validateCategoryQuery(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const { category } = req.query;

  // pas de filtre : rien à valider
  if (category === undefined) {
    return next();
  }
  const categoryId = Number(category);

  // un entier > 0 qui tient dans une colonne INT
  if (Number.isInteger(categoryId) && categoryId > 0 && categoryId <= MAX_ID) {
    return next();
  }

  // cas par défaut : catégorie invalide
  throw new BadRequestError("Catégorie invalide");
}

// Longueur maximale autorisée pour une recherche
const MAX_SEARCH_LENGTH = 100;

// Vérifie que ?search=... est un texte de longueur raisonnable
export function validateSearchQuery(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const { search } = req.query;

  // Pas de recherche : rien à valider
  if (search === undefined) {
    return next();
  }

  // Un texte (pas un tableau) qui ne dépasse pas la longueur maximale
  if (typeof search === "string" && search.trim().length <= MAX_SEARCH_LENGTH) {
    return next();
  }

  // Cas par défaut : recherche invalide
  throw new BadRequestError(
    `Recherche invalide : un seul texte de ${MAX_SEARCH_LENGTH} caractères maximum`,
  );
}
