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
// middleware : l'utilisateur connecté a-t-il le bon rôle ? → sinon 403
// à placer APRÈS isConnected, qui a rempli req.userRole
// ex. : router.get("/admin/trees", isConnected, checkRoles(["admin"]), ...)
export function checkRoles(allowedRoles: Array<"customer" | "admin">) {
  // checkRoles n'est pas le middleware : elle FABRIQUE un middleware
  // qui se souvient de allowedRoles
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (req.userRole && allowedRoles.includes(req.userRole)) {
      return next();
    }
    // connecté, mais pas le droit : 403 (et non 401)
    // message du contrat #83 (seul le rôle admin est vérifié pour l'instant)
    throw new ForbiddenError("Accès réservé à l'administrateur.");
  };
}
