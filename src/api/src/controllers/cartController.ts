import type { Response } from "express";
import type { IAuthenticatedRequest } from "../@types/index.d.ts";
import { getAuthenticatedUser } from "./utils.ts";
import { cartStore } from "../data/cartStore.ts";
import { z } from "zod";

// --------------------------------
// Schémas Zod : validés AVANT tout appel à la BDD
// (body invalide -> erreur 400 levée par Zod, aucune requête SQL inutile)
// --------------------------------
const addCartItemSchema = z.object({
  treeId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});

// req.params ne contient que du texte : coerce.number transforme "12" en 12
const idParamSchema = z.coerce.number().int().positive();

export async function getCart(req: IAuthenticatedRequest, res: Response) {
  const user = await getAuthenticatedUser(req);

  const cart = await cartStore.findCartByUserId(user.id);

  res.status(200).json(cart);
}

export async function addCartItem(req: IAuthenticatedRequest, res: Response) {
  const user = await getAuthenticatedUser(req);

  // body invalide -> Zod lance une erreur (400) AVANT d'appeler la BDD
  const { treeId, quantity } = addCartItemSchema.parse(req.body);

  const newCartItem = await cartStore.addCartItem(user.id, treeId, quantity);

  res.status(201).json(newCartItem);
}

export async function updateCartItem(
  req: IAuthenticatedRequest,
  res: Response,
) {
  const user = await getAuthenticatedUser(req);

  // validation du paramètre d'URL et du body par Zod
  const itemId = idParamSchema.parse(req.params.id);
  const { quantity } = updateCartItemSchema.parse(req.body);

  const updatedCartItem = await cartStore.updateCartItem(
    user.id,
    itemId,
    quantity,
  );

  res.status(200).json(updatedCartItem);
}

export async function deleteCartItem(
  req: IAuthenticatedRequest,
  res: Response,
) {
  const user = await getAuthenticatedUser(req);

  const itemId = idParamSchema.parse(req.params.id);

  await cartStore.deleteCartItem(user.id, itemId);

  res.status(204).send();
}
