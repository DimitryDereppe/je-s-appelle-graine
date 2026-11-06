import type { Request, Response } from "express";
import type { IAuthenticatedRequest } from "../@types/index.d.ts";
import { getAuthenticatedUser } from "./utils.ts";
import { z } from "zod";
import {
  ConflictError,
  BadRequestError,
  ForbiddenError,
} from "../lib/errors.ts";
import { accountDatamapper } from "../datamappers/accountDatamapper.ts";
import argon2 from "argon2";
import { clearAccessCookie } from "../lib/token.ts";

export async function register(req: Request, res: Response) {
  // schéma attendu du body (contrat carte #83)
  // max : les tailles des colonnes de la table account, sinon la BDD répondrait une erreur 500
  const registerBodySchema = z.object({
    firstname: z
      .string({ error: "Prénom obligatoire." })
      .trim()
      .min(1, { error: "Prénom obligatoire." })
      .max(100, { error: "Le prénom est trop long." }),
    lastname: z
      .string({ error: "Nom obligatoire." })
      .trim()
      .min(1, { error: "Nom obligatoire." })
      .max(100, { error: "Le nom est trop long." }),
    email: z
      .email({ error: "Email invalide." })
      .max(255, { error: "L'email est trop long." }),
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
    organizationName: z
      .string()
      .trim()
      .max(150, { error: "Le nom de la structure est trop long." })
      .optional()
      .nullable(),
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
    throw new ConflictError("Ce compte existe déjà.");
  }

  // mot de passe haché avec argon2 : seul le hash sera enregistré en BDD
  const hashedPassword = await argon2.hash(password);

  // particulier → pas de structure (null), même si le front en envoie une (champ masqué mais encore rempli)
  const savedOrganizationName =
    accountType === "particulier" ? null : organizationName || null;

  const newAccount = await accountDatamapper.createAccount({
    firstname,
    lastname,
    email,
    password: hashedPassword,
    accountType,
    organizationName: savedOrganizationName,
  });
  res.status(201).json(newAccount);
}

// --------------------------------
// GET /api/users/me : le compte connecté
// --------------------------------
export async function getMe(req: IAuthenticatedRequest, res: Response) {
  const account = await getAuthenticatedUser(req);

  res.status(200).json({
    id: account.id,
    firstname: account.firstname,
    lastname: account.lastname,
    email: account.email,
    address: account.address,
    accountType: account.accountType,
    organizationName: account.organizationName,
    role: account.role,
  });
}

// --------------------------------
// PATCH /api/users/me : modifie le compte connecté et renvoie le compte à jour
// le rôle et isActive ne sont pas dans le schéma : le client ne peut pas les changer
// --------------------------------
export async function updateMe(req: IAuthenticatedRequest, res: Response) {
  // schéma attendu du body
  // max : les tailles des colonnes de la table account, sinon la BDD répondrait une erreur 500
  const updateBodySchema = z.object({
    firstname: z
      .string({ error: "Prénom obligatoire." })
      .trim()
      .min(1, { error: "Prénom obligatoire." })
      .max(100, { error: "Le prénom est trop long." }),
    lastname: z
      .string({ error: "Nom obligatoire." })
      .trim()
      .min(1, { error: "Nom obligatoire." })
      .max(100, { error: "Le nom est trop long." }),
    email: z
      .email({ error: "Email invalide." })
      .max(255, { error: "L'email est trop long." }),
    // trim retire les espaces autour ; null accepté si le client n'a pas d'adresse
    address: z
      .string({ error: "Adresse invalide." })
      .trim()
      .max(255, { error: "L'adresse est trop longue." })
      .nullable(),
    // mêmes valeurs que le CHECK de la table account
    // pas de .default ici : un oubli du front ne doit pas changer le type du compte
    accountType: z.enum(["particulier", "association", "entreprise"], {
      error: "Type de compte invalide.",
    }),
    // facultatif : peut être absent (optional) ou valoir null (nullable)
    organizationName: z
      .string()
      .trim()
      .max(150, { error: "Le nom de la structure est trop long." })
      .optional()
      .nullable(),
  });

  // validation du body par Zod : si invalide, erreur → 400 (errorMiddleware)
  const updateBody = await updateBodySchema.parseAsync(req.body);

  // le compte connecté (401 s'il n'existe plus, 403 s'il est désactivé)
  const account = await getAuthenticatedUser(req);

  // email déjà pris par un AUTRE compte → 409 (garder son propre email reste permis)
  const sameEmailAccount = await accountDatamapper.findByEmail(
    updateBody.email,
  );
  if (sameEmailAccount && sameEmailAccount.id !== account.id) {
    throw new ConflictError("Cet email est déjà utilisé.");
  }

  // l'id vient du jeton (account.id = userId), jamais du body : un client ne modifie que son propre compte
  const updated = await accountDatamapper.updateProfile(account.id, {
    ...updateBody,
    // champ vide → null ; un particulier n'a pas de structure
    address: updateBody.address || null,
    organizationName:
      updateBody.accountType === "particulier"
        ? null
        : updateBody.organizationName || null,
  });

  // même réponse que GET /api/users/me : isActive reste côté serveur
  res.status(200).json({
    id: updated.id,
    firstname: updated.firstname,
    lastname: updated.lastname,
    email: updated.email,
    address: updated.address,
    accountType: updated.accountType,
    organizationName: updated.organizationName,
    role: updated.role,
  });
}

// --------------------------------
// PATCH /api/users/me/password : change le mot de passe du compte connecté
// --------------------------------
export async function changePassword(
  req: IAuthenticatedRequest,
  res: Response,
) {
  // schéma attendu du body : le mot de passe actuel, et le nouveau (12 caractères minimum)
  const passwordBodySchema = z.object({
    currentPassword: z
      .string({ error: "Veuillez saisir votre mot de passe actuel." })
      .min(1, { error: "Veuillez saisir votre mot de passe actuel." }),
    newPassword: z
      .string({ error: "Veuillez saisir le nouveau mot de passe." })
      .min(12, {
        error: "Le mot de passe doit contenir au moins 12 caractères.",
      }),
  });

  // validation du body par Zod : si invalide, erreur → 400 (errorMiddleware)
  const { currentPassword, newPassword } = await passwordBodySchema.parseAsync(
    req.body,
  );

  // le compte connecté (401 s'il n'existe plus, 403 s'il est désactivé)
  const account = await getAuthenticatedUser(req);

  // trouver le hash enregistré en BDD
  const storedPassword = await accountDatamapper.findPasswordById(account.id);

  // on exige le mot de passe actuel : une session restée ouverte ne suffit pas pour le changer
  // argon2.verify compare le mot de passe actuel saisi au hash enregistré en BDD
  if (
    !storedPassword ||
    !(await argon2.verify(storedPassword, currentPassword))
  ) {
    throw new BadRequestError("Le mot de passe actuel est incorrect.");
  }

  // seul le hash du nouveau mot de passe est enregistré en BDD
  const newHashedPassword = await argon2.hash(newPassword);

  await accountDatamapper.updatePassword(account.id, newHashedPassword);

  // 204 : réussi, sans contenu ; le message de succès est écrit par le front
  res.status(204).end();
}

// --------------------------------
// DELETE /api/users/me : supprimer son compte (les commandes ne sont pas supprimées)
// --------------------------------
export async function deleteMe(req: IAuthenticatedRequest, res: Response) {
  // le compte connecté (401 s'il n'existe plus, 403 s'il est désactivé)
  const account = await getAuthenticatedUser(req);

  // un admin ne peut pas supprimer son compte s'il est le dernier admin actif → 403
  // on ne compte les admins que si le compte à supprimer est celui d'un admin
  if (
    account.role === "admin" &&
    (await accountDatamapper.countActiveAdmins()) <= 1
  ) {
    throw new ForbiddenError(
      "Impossible de supprimer le dernier administrateur.",
    );
  }

  await accountDatamapper.deleteById(account.id);

  // le compte n'existe plus : le navigateur n'a plus à garder le jeton
  clearAccessCookie(res);

  // 204 : réussi, sans contenu
  res.status(204).end();
}
