import type { Request, Response } from "express";
import type { IAuthenticatedRequest } from "../@types/index.d.ts";
import { getAuthenticatedUser } from "./utils.ts";
import { z } from "zod";
import { ConflictError } from "../lib/errors.ts";
import { cartDatamapper } from "../datamappers/cartDatamapper.ts";

export async function getCart(req: IAuthenticatedRequest, res: Response) {
  const cartBodySchema = z.object({
    userId: z.number({ error: "userId obligatoire." }).int().positive(),
  });
    const user = await getAuthenticatedUser(req);

  const cart = await cartDatamapper.findCartByUserId(user.id);

  res.status(200).json(cart);
}