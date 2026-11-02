import argon2 from "argon2";
import type { Request, Response } from "express";
import { z } from "zod";
import { UnauthorizedError, ForbiddenError } from "../lib/errors.ts";
import { accountDatamapper } from "../datamappers/accountDatamapper.ts";
import {
  ACCESS_COOKIE_NAME,
  accessCookieOptions,
  createAccessToken,
} from "../lib/token.ts";

export async function login(req: Request, res: Response) {
  // schema attendu du body
  const loginBodySchema = z.object({
    email: z.email({ error: "Email invalide." }),
    password: z.string({ error: "Mot de passe obligatoire." }),
  });

  // validation du body par Zod
  const { email, password } = await loginBodySchema.parseAsync(req.body);

  const searchedUser = await accountDatamapper.findByEmail(email);
  if (!searchedUser) {
    throw new UnauthorizedError("Email ou mot de passe incorrect.");
  }

  // searchedUser.password --> mot de passe hashé et stocké dans la BDD
  // password --> mot de passe en clair reçu du body
  if (!(await argon2.verify(searchedUser.password, password))) {
    throw new UnauthorizedError("Email ou mot de passe incorrect.");
  }

  // vérification du compte (n'a pas été désactivé par l'admin)
  if (!searchedUser.isActive) {
    throw new ForbiddenError(
      "Ce compte est désactivé, veuillez contacter l'administrateur.",
    );
  }

  // Création du jeton JWT (id et role dans le payload)
  const accessToken = createAccessToken({
    userId: searchedUser.id,
    userRole: searchedUser.role,
  });

  // Intégration de accessToken et envoi du cookie (nom du cookie, l'accessToken et les options du cookie)
  res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions);

  res.status(200).json({
    id: searchedUser.id,
    firstname: searchedUser.firstname,
    lastname: searchedUser.lastname,
    email: searchedUser.email,
    role: searchedUser.role,
  });
}
