import type { Request, Response } from "express";
import { z } from "zod";
import { ordersDatamapper } from "../datamappers/ordersDatamapper.ts";
import { ConflictError, NotFoundError } from "../lib/errors.ts";

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
  // l'id a déjà été vérifié par validateId
  const id = Number(req.params.id);

  const order = await ordersDatamapper.findOrderByIdForAdmin(id);
  if (!order) {
    throw new NotFoundError("Commande introuvable.");
  }

  res.status(200).json(order);
}

//  PATCH /api/admin/orders/:id/status : l'administrateur modifie le statut d'une commande
export async function updateOneOrder(req: Request, res: Response) {
  const statusOrderSchema = z.object({
    status: z.enum(["payée", "plantée", "annulée"], {
      error: "Statut invalide.",
    }),
  });

  const { status } = statusOrderSchema.parse(req.body);

  const orderId = Number(req.params.id);

  const order = await ordersDatamapper.findOrderByIdForAdmin(orderId);
  if (!order) {
    throw new NotFoundError("Commande introuvable.");
  }
  // les 3 seuls changements autorisés, tout le reste → 409
  const isAllowed =
    (order.status === "en attente" &&
      (status === "payée" || status === "annulée")) ||
    (order.status === "payée" && status === "plantée");

  if (!isAllowed) {
    throw new ConflictError(
      `Une commande « ${order.status} » ne peut pas passer à « ${status} ».`,
    );
  }

  await ordersDatamapper.updateStatus(orderId, status);

  // relit la commande : nouveau statut et date du changement (paidAt, plantedAt ou cancelledAt)
  const updatedOrder = await ordersDatamapper.findOrderByIdForAdmin(orderId);
  res.status(200).json(updatedOrder);
}
