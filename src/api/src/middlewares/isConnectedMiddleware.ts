import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { config } from "../../config.ts";
import type { AuthenticatedRequest } from "../@types/index.d.ts";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.ts";
import { ACCESS_COOKIE_NAME } from "../lib/token.ts";

// les rôles qui existent dans la table role
const ROLES = ["customer", "admin"];

// --------------------------------
// middleware : l'utilisateur est-il connecté ? (cookie avec un JWT valide) → sinon 401
export function isConnected(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) {
  // 1. récupérer l'accessToken dans le cookie (lu par cookie-parser)
  const accessToken = req.cookies?.[ACCESS_COOKIE_NAME];
  if (!accessToken || typeof accessToken !== "string") {
    throw new UnauthorizedError("Vous devez être connecté.");
  }

  // 2. vérifier le JWT : signature et date d'expiration
  // verify lance une erreur si le token est faux ou expiré :
  // on la transforme en 401 (sinon globalErrorHandler renverrait une 500)
  let payload: JwtPayload;
  try {
    payload = jwt.verify(accessToken, config.jwtSecret) as JwtPayload;
  } catch {
    throw new UnauthorizedError("Vous devez être connecté.");
  }

  // 3. le payload doit contenir userId (entier > 0) et userRole (un rôle connu)
  const { userId, userRole } = payload;
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new UnauthorizedError("Vous devez être connecté.");
  }
  if (!ROLES.includes(userRole)) {
    throw new UnauthorizedError("Vous devez être connecté.");
  }

  // 4. tout est bon : on range l'id et le rôle dans la requête
  // pour les middlewares et contrôleurs suivants (ex. req.userId dans /users/me)
  req.userId = userId;
  req.userRole = userRole;

  return next();
}

// --------------------------------
// vérifier les rôles des utilisateurs connectés (comme oQuiz)
// une fonction qui prend en argument la liste des rôles autorisés
export function checkRoles(allowedRoles: Array<"customer" | "admin">) {
  // exemple : allowedRoles contient : [ "admin" ]
  // req.userRole = "customer"
  // "customer" n'est pas dans le tableau allowedRoles --> rejette la requête

  // la fonction checkRoles retourne un middleware qui vérifie si le rôle est autorisé ou pas
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    // récupère le rôle injecté dans l'AuthenticatedRequest par isConnected
    const role = req.userRole;
    // si pas de rôle --> isConnected n'a pas été placé avant : pas identifié, 401
    if (!role) {
      throw new UnauthorizedError("Vous devez être connecté.");
    }

    // vérifie si le rôle est inclus dans la liste des rôles autorisés (allowedRoles)
    if (!allowedRoles.includes(role)) {
      // le rôle de l'utilisateur n'est pas dans la liste des rôles autorisés
      // connecté, mais pas le droit : 403 (oQuiz renvoie 401 ; notre contrat #83 prévoit 403)
      throw new ForbiddenError("Accès réservé à l'administrateur.");
    }

    // tout va bien, appelle le middleware suivant
    next();
  };
}
