import jwt from "jsonwebtoken";
import { config } from "../../config.ts";
import type { CookieOptions } from "express";
import type { IAccessToken } from "../@types/index.d.ts";

// --------------------------------
// crée un token JWT qui contient le user id + role et une date d'expiration de 24 heures
// --------------------------------
export function createAccessToken(payload: IAccessToken): string {
  // calcul du token JWT (string)
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "24h" });
}

// --------------------------------
// définition des options du cookie
// --------------------------------
export const ACCESS_COOKIE_NAME = "accessToken";

export const accessCookieOptions: CookieOptions = {
  // instructions pour le navigateur (attributs définis par les spec des cookies : https://httpwg.org/http-extensions/draft-ietf-httpbis-rfc6265bis.html)
  httpOnly: true, // true : non accessible aux script JS, seul le navigateur y a accès
  maxAge: 24 * 60 * 60 * 1000, // durée de conservation du cookie en ms --> supprime le cookie passé ce délais --> attention, ce delais porte sur le cookie, pas le token qu'il contient !
  sameSite: "lax", // protège du CSRF (un autre site ne peut pas envoyer le cookie avec un POST)
  secure: config.isProduction, // renvois ce cookie uniquement en HTTPS (en local --> on est en HTTP)
  path: "/", // endpoint où renvoyer le cookie "/" --> racine de l'API
};
