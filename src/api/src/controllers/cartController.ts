import type { Response, NextFunction } from "express";
import type { IAuthenticatedRequest } from "../@types/index.d.ts";
import { getAuthenticatedUser } from "./utils.ts";
import { cartDatamapper } from "../datamappers/cartDatamapper.ts";
import { treeDatamapper } from "../datamappers/treeDatamapper.ts";
import {
  MAX_QUANTITY_PER_TREE,
  exceedsMaxQuantity,
  isTreeAvailable,
} from "../services/cartRules.ts";
import { computeTotal } from "../services/orderRules.ts";

import { z } from "zod";

// --------------------------------
// Schémas Zod : validés AVANT tout appel à la BDD
// coerce.number convertit "3" (string) en 3 (number)
// --------------------------------
const addCartItemSchema = z.object({
  treeId: z.coerce
    .number({
      error: "treeId doit être un nombre.",
    })
    .int({ error: "treeId doit être un entier." })
    .positive({ error: "treeId doit être supérieur à 0." }),

  quantity: z.coerce
    .number({
      error: "quantity doit être un nombre.",
    })
    .int({ error: "quantity doit être un entier." })
    .positive({ error: "quantity doit être supérieur à 0." })
    .max(100, { error: "quantity ne peut pas dépasser 100." })
    .default(1),
});

const updateCartItemSchema = z.object({
  quantity: z.coerce
    .number({
      error: "quantity doit être un nombre.",
    })
    .int({ error: "quantity doit être un entier." })
    .positive({ error: "quantity doit être supérieur à 0." })
    .max(100, { error: "quantity ne peut pas dépasser 100." }),
});

const treeIdParamSchema = z.coerce
  .number({
    error: "treeId doit être un nombre.",
  })
  .int({ error: "treeId doit être un entier." })
  .positive({ error: "treeId doit être supérieur à 0." });

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

    // même calcul que pour la commande (somme + arrondi au centime) : services/orderRules.ts
    const total = computeTotal(items);

    res.status(200).json({ items, total });
  },
);

export const addCartItem = asyncHandler(
  async (req: IAuthenticatedRequest, res: Response) => {
    const user = await getAuthenticatedUser(req);

    const { treeId, quantity } = addCartItemSchema.parse(req.body);

    const tree = await treeDatamapper.findById(treeId);
    if (!tree) {
      res.status(404).json({ error: "Arbre introuvable." });
      return;
    }

    if (!isTreeAvailable(tree.availabilityName)) {
      res.status(409).json({ error: "Cet arbre n'est pas disponible." });
      return;
    }

    // règle métier (services/cartRules.ts) : somme existant + nouveau ≤ 100
    const existingItem = await cartDatamapper.findCartItem(user.id, treeId);
    const currentQuantity = existingItem ? existingItem.quantity : 0;

    if (exceedsMaxQuantity(currentQuantity, quantity)) {
      res.status(400).json({
        error: `La quantité totale ne peut pas dépasser ${MAX_QUANTITY_PER_TREE} pour cet arbre.`,
        status: 400,
      });
      return;
    }

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
      res.status(404).json({ error: "Ligne introuvable." });
      return;
    }

    res.status(200).json(updatedCartItem);
  },
);

export const deleteCartItem = asyncHandler(
  async (req: IAuthenticatedRequest, res: Response) => {
    const user = await getAuthenticatedUser(req);

    const treeId = treeIdParamSchema.parse(req.params.treeId);

    const tree = await treeDatamapper.findById(treeId);
    if (!tree) {
      res.status(404).json({ error: "Ligne introuvable." });
      return;
    }

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
