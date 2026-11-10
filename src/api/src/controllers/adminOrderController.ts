import type { Request, Response } from "express";
import { ordersDatamapper } from "../datamappers/ordersDatamapper.ts";

// GET /api/admin/orders : toutes les commandes, pour l'admin
export async function getAllOrders(_req: Request, res: Response) {
  const orders = await ordersDatamapper.findAllOrdersForAdmin();
  res.status(200).json(orders);
}
