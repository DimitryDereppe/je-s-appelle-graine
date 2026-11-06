import type { Request, Response } from "express";
import { accountDatamapper } from "../datamappers/accountDatamapper.ts";
import { NotFoundError } from "../lib/errors.ts";

//obtien la liste de tous les customer
export async function getAllUsers(_req: Request, res: Response) {
  const trees = await accountDatamapper.findAllCustomers();
  res.status(200).json(trees);
}

// un arbre selon son id
export async function getOneUser(req: Request, res: Response) {
  const id = Number(req.params.id);
  const account = await accountDatamapper.findById(id);
  if (!account) {
    throw new NotFoundError("compte introuvable");
  }
  res.status(200).json(account);
}
