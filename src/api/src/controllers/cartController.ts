import type { Response } from "express";
import type { IAuthenticatedRequest } from "../@types/index.d.ts";
import { getAuthenticatedUser } from "./utils.ts";
import { cartDatamapper } from "../datamappers/cartDatamapper.ts";
import { z } from "zod";

// --------------------------------
// Schémas Zod : validés AVANT tout appel à la BDD
// coerce.number convertit "3" (string) en 3 (number)
// --------------------------------
const addCartItemSchema = z.object({
  treeId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
});

const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().positive(),
});

const treeIdParamSchema = z.coerce.number().int().positive();

export async function getCart(req: IAuthenticatedRequest, res: Response) {
  const user = await getAuthenticatedUser(req);

  const cart = await cartDatamapper.findCartByUserId(user.id);

  res.status(200).json(cart);
}

export async function addCartItem(req: IAuthenticatedRequest, res: Response) {
  const user = await getAuthenticatedUser(req);

  const { treeId, quantity } = addCartItemSchema.parse(req.body);

  const newCartItem = await cartDatamapper.addCartItem(
    user.id,
    treeId,
    quantity,
  );

  res.status(201).json(newCartItem);
}

export async function updateCartItem(
  req: IAuthenticatedRequest,
  res: Response,
) {
  const user = await getAuthenticatedUser(req);

  const treeId = treeIdParamSchema.parse(req.params.treeId);
  const { quantity } = updateCartItemSchema.parse(req.body);

  const updatedCartItem = await cartDatamapper.updateCartItemQuantity(
    user.id,
    treeId,
    quantity,
  );

  if (!updatedCartItem) {
    res.status(404).json({ error: "Ligne du panier introuvable" });
    return;
  }

  res.status(200).json(updatedCartItem);
}

export async function deleteCartItem(
  req: IAuthenticatedRequest,
  res: Response,
) {
  const user = await getAuthenticatedUser(req);

  const treeId = treeIdParamSchema.parse(req.params.treeId);

  await cartDatamapper.deleteCartItem(user.id, treeId);

  res.status(204).send();
}

export async function clearCart(req: IAuthenticatedRequest, res: Response) {
  const user = await getAuthenticatedUser(req);

  await cartDatamapper.clearCart(user.id);

  res.status(204).send();
}
