import type { Request, Response } from "express";
import { accountDatamapper } from "../datamappers/accountDatamapper.ts";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../lib/errors.ts";

//obtien la liste de tous les compte
export async function getAllUsers(_req: Request, res: Response) {
  const accounts = await accountDatamapper.findAllForAdmin();
  res.status(200).json(accounts);
}

// un compte selon son id
export async function getOneUser(req: Request, res: Response) {
  const id = Number(req.params.id);
  const account = await accountDatamapper.findById(id);
  if (!account) {
    throw new NotFoundError("Compte introuvable");
  }
  res.status(200).json(account);
}

// PATCH /api/admin/users/:id : activer ou désactiver un compte
export async function updateUserStatus(req: Request, res: Response) {
  const id = Number(req.params.id);

  // 1. on lit isActive dans le body : il doit être true ou false (sinon → 400)
  const isActive = req.body?.isActive;
  if (typeof isActive !== "boolean") {
    throw new BadRequestError("État du compte invalide.");
  }

  // 2. on cherche le compte (sinon → 404)
  const account = await accountDatamapper.findById(id);
  if (!account) {
    throw new NotFoundError("Compte introuvable");
  }

  // 3. on ne peut pas désactiver le dernier admin actif (→ 409)
  const disable =
    isActive === false && account.role === "admin" && account.isActive;

  if (disable) {
    const actifAdminsNumber = await accountDatamapper.countActiveAdmins();
    if (actifAdminsNumber <= 1) {
      throw new ConflictError(
        "Impossible de désactiver le dernier administrateur.",
      );
    }
  }

  // 4. on modifie et on renvoie le compte à jour
  const updatedAccount = await accountDatamapper.updateIsActive(id, isActive);
  res.status(200).json(updatedAccount);
}

// DELETE /api/admin/users/:id : supprimer un compte (ses commandes restent)
export async function deleteUser(req: Request, res: Response) {
  const id = Number(req.params.id);

  // le compte existe-t-il ? → sinon 404
  const account = await accountDatamapper.findById(id);
  if (!account) {
    throw new NotFoundError("Compte introuvable.");
  }

  // règle du dernier admin → 409
  if (
    account.role === "admin" &&
    account.isActive &&
    (await accountDatamapper.countActiveAdmins()) <= 1
  ) {
    throw new ConflictError(
      "Impossible de supprimer le dernier administrateur.",
    );
  }

  // panier supprimé (CASCADE), commandes conservées sans propriétaire (SET NULL)
  await accountDatamapper.deleteById(id);

  // 204 : réussi, sans contenu
  res.status(204).end();
}
