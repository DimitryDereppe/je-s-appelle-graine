import type { CookieOptions, Request } from "express";
import { config } from "../../config.ts";

// --------------------------------
// définition des options du cookie panier
// --------------------------------
export const CART_COOKIE_NAME = "cartId";

export const cartCookieOptions: CookieOptions = {
  httpOnly: true, // non accessible aux scripts JS
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en ms
  sameSite: "lax", // protège du CSRF
  signed: true, // signature avec cookieSecret : anti-falsification
  secure: config.isProduction, // HTTPS uniquement en production
  path: "/",
};

// --------------------------------
// lit l'id du panier dans le cookie signé
// renvoie null si absent ou falsifié
// --------------------------------
export function getCartIdFromCookie(req: Request): number | null {
  const raw: unknown = req.signedCookies[CART_COOKIE_NAME];
  const cartId = typeof raw === "string" ? Number(raw) : NaN;
  return Number.isInteger(cartId) && cartId > 0 ? cartId : null;
}
