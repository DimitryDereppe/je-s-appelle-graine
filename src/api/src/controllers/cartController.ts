import type { Response, NextFunction } from "express";
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

// --------------------------------
// Wrapper async → transmet les rejections au middleware d'erreur
// --------------------------------
const asyncHandler =
  (fn: (req: IAuthenticatedRequest, res: Response) => Promise<void>) =>
  (req: IAuthenticatedRequest, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

// --------------------------------
// Handlers
// --------------------------------
export const getCart = asyncHandler(
  async (req: IAuthenticatedRequest, res: Response) => {
    const user = await getAuthenticatedUser(req);

    const cart = await cartDatamapper.findCartByUserId(user.id);
    const items = (cart ?? []).map((item) => ({
      id: item.id,
      accountId: item.accountId,
      treeId: item.treeId,
      quantity: item.quantity,
      name: item.name,
      price: Number(item.price),
      photoUrl: item.photoUrl ?? null,
      plantingLocation: item.plantingLocation ?? null,
      availabilityName: item.availabilityName ?? null,
      lineTotal: Number(item.price) * item.quantity,
    }));

    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);

    res.status(200).json({ items, total });
  },
);

export const addCartItem = asyncHandler(
  async (req: IAuthenticatedRequest, res: Response) => {
    const user = await getAuthenticatedUser(req);

    const { treeId, quantity } = addCartItemSchema.parse(req.body);

    const newCartItem = await cartDatamapper.addCartItem(
      user.id,
      treeId,
      quantity,
    );

    res.status(201).json(newCartItem);
  },
);

export const updateCartItem = asyncHandler(
  async (req: IAuthenticatedRequest, res: Response) => {
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
  },
);

export const deleteCartItem = asyncHandler(
  async (req: IAuthenticatedRequest, res: Response) => {
    const user = await getAuthenticatedUser(req);

    const treeId = treeIdParamSchema.parse(req.params.treeId);

    await cartDatamapper.deleteCartItem(user.id, treeId);

    res.status(204).end();
  },
);

export const clearCart = asyncHandler(
  async (req: IAuthenticatedRequest, res: Response) => {
    const user = await getAuthenticatedUser(req);

    await cartDatamapper.clearCart(user.id);

    res.status(204).end();
  },
);
