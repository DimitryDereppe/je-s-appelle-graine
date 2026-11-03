import type { Request, Response } from "express";
import { z } from "zod";

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
  const { firstname, lastname, email, accountType, organizationName } =
    await registerBodySchema.parseAsync(req.body);

  // provisoire : sera remplacé par la ligne créée en BDD (étapes 4 et 5)
  // le mot de passe n'est jamais renvoyé
  res.status(201).json({
    firstname,
    lastname,
    email,
    accountType,
    organizationName: organizationName ?? null,
  });
}
