import type { Request, Response } from "express";
import { z } from "zod";
import { ConflictError } from "../lib/errors.ts";
import { accountDatamapper } from "../datamappers/accountDatamapper.ts";
import argon2 from "argon2";

export async function register(req: Request, res: Response) {
  // schéma attendu du body (contrat carte #83)
  const registerBodySchema = z.object({
    firstname: z
      .string({ error: "Prénom obligatoire." })
      .min(1, { error: "Prénom obligatoire." }),
    lastname: z
      .string({ error: "Nom obligatoire." })
      .min(1, { error: "Nom obligatoire." }),
    email: z.email({ error: "Email invalide." }),
    password: z.string({ error: "Mot de passe obligatoire." }).min(12, {
      error: "Le mot de passe doit contenir au moins 12 caractères.",
    }),
    // mêmes valeurs que le CHECK de la table account
    accountType: z
      .enum(["particulier", "association", "entreprise"], {
        error: "Type de compte invalide.",
      })
      .default("particulier"),
    // facultatif : peut être absent (optional) ou valoir null (nullable)
    organizationName: z.string().optional().nullable(),
  });

  // validation du body par Zod : si invalide, erreur → 400 (errorMiddleware)
  const {
    firstname,
    lastname,
    email,
    password,
    accountType,
    organizationName,
  } = await registerBodySchema.parseAsync(req.body);

  // email unique : un compte existe déjà avec cet email → 409
  const existingAccount = await accountDatamapper.findByEmail(email);
  if (existingAccount) {
    throw new ConflictError("Cet email est déjà utilisé.");
  }

  // mot de passe haché avec argon2 : seul le hash sera enregistré en BDD
  const hashedPassword = await argon2.hash(password);

  const newAccount = await accountDatamapper.createAccount({
    firstname,
    lastname,
    email,
    password: hashedPassword,
    accountType,
    organizationName: organizationName ?? null,
  });
  res.status(201).json(newAccount);
}
