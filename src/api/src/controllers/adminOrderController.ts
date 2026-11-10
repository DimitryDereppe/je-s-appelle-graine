import type { Request, Response } from "express";
import { z } from "zod";
import { ordersDatamapper } from "../datamappers/ordersDatamapper.ts";
import { NotFoundError } from "../lib/errors.ts";

// GET /api/admin/orders?status=… : toutes les commandes, ou celles d'un statut
export async function getAllOrders(req: Request, res: Response) {
  // ?status= est facultatif ; s'il est là, une des 4 valeurs du CHECK de purchase.status → sinon 400
  const statusQuerySchema = z
    .enum(["en attente", "payée", "plantée", "annulée"], {
      error: "Statut invalide.",
    })
    .optional();

  const status = statusQuerySchema.parse(req.query.status);

  const orders = await ordersDatamapper.findAllOrdersForAdmin(status);
  res.status(200).json(orders);
}

// GET /api/admin/orders/:id : le détail d'une commande, de n'importe quel client
export async function getOrderById(req: Request, res: Response) {
  // l'id a déjà été vérifié par validateId (entier > 0)
  const id = Number(req.params.id);

  const order = await ordersDatamapper.findOrderByIdForAdmin(id);
  if (!order) {
    throw new NotFoundError("Commande introuvable.");
  }

  res.status(200).json(order);
}
