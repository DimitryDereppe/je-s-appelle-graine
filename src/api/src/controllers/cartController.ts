import type { Response } from "express";
import type { IAuthenticatedRequest } from "../@types/index.d.ts";
import { getAuthenticatedUser } from "./utils.ts";
import { cartDatamapper } from "../datamappers/cartDatamapper.ts";
import { z } from "zod";

export async function getCart(req: IAuthenticatedRequest, res: Response) {
  const user = await getAuthenticatedUser(req);

  const cart = await cartDatamapper.findCartByUserId(user.id);

  res.status(200).json(cart);
}

export async function addCartItem(req: IAuthenticatedRequest, res: Response) {
  const user = await getAuthenticatedUser(req);
  const addCartItemSchema = z.object({
    treeId: z.number().int().positive(),
    quantity: z.number().int().positive(),
  });

  // body invalide → Zod lance une erreur (400) AVANT d'appeler la BDD
  const { treeId, quantity } = addCartItemSchema.parse(req.body);

  const newCartItem = await cartDatamapper.addCartItem(
    user.id,
    treeId,
    quantity,
  );

  res.status(201).json(newCartItem);
}

// export async function updateCartItem(req: IAuthenticatedRequest, res: Response) {
//   const user = await getAuthenticatedUser(req);

//   const { id } = req.params;
//   const { quantity } = req.body;

//   const updatedCartItem = await cartDatamapper.updateCartItem(user.id, parseInt(id), quantity);

//   res.status(200).json(updatedCartItem);
// }

// export async function deleteCartItem(req: IAuthenticatedRequest, res: Response) {
//   const user = await getAuthenticatedUser(req);

//   const { id } = req.params;

//   await cartDatamapper.deleteCartItem(user.id, parseInt(id));

//   res.status(204).send();
// }
