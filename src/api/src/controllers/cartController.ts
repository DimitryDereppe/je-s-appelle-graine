import type { Response } from "express";
import type { IAuthenticatedRequest } from "../@types/index.d.ts";
import { getAuthenticatedUser } from "./utils.ts";
import { cartDatamapper } from "../datamappers/cartDatamapper.ts";

export async function getCart(req: IAuthenticatedRequest, res: Response) {
  const user = await getAuthenticatedUser(req);

  const cart = await cartDatamapper.findCartByUserId(user.id);

  res.status(200).json(cart);
}
