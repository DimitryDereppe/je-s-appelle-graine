import type { Response } from "express";
import { z } from "zod";
import type {
  IAuthenticatedRequest,
  PaymentMethod,
} from "../@types/index.d.ts";
import { getAuthenticatedUser } from "./utils.ts";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../lib/errors.ts";
import { cartDatamapper } from "../datamappers/cartDatamapper.ts";
import { ordersDatamapper } from "../datamappers/ordersDatamapper.ts";
import { config } from "../../config.ts";

// --------------------------------
// instructions de paiement selon le mode choisi (valeurs lues dans la config, contrat #103)
// --------------------------------
// la fonction n'est pas exportée : elle ne sert qu'aux deux contrôleurs de ce fichier
function getPaymentInstructions(paymentMethod: PaymentMethod) {
  // virement → coordonnées bancaires
  if (paymentMethod === "virement") {
    return {
      iban: config.payment.iban,
      bic: config.payment.bic,
      holder: config.payment.holder,
    };
  }
  // sinon (chèque) → à quel ordre et à quelle adresse l'envoyer
  return {
    payableTo: config.payment.payableTo,
    address: config.payment.address,
  };
}

// --------------------------------
// POST /api/orders → passe commande à partir du panier (contrat carte #103)
// --------------------------------
export async function createOrder(req: IAuthenticatedRequest, res: Response) {
  // isConnected (posé dans indexRouter) a déjà vérifié le token :
  // ici on récupère le compte du client connecté
  const account = await getAuthenticatedUser(req);

  // 1. body : mode de paiement et engagement à payer → 400 si invalide
  const createOrderSchema = z.object({
    // z.enum : une valeur parmi une liste (la même que le CHECK de purchase.payment_method)
    paymentMethod: z.enum(["virement", "chèque"], {
      error: "Mode de paiement invalide.",
    }),
    // z.literal(true) : seule la valeur true est acceptée (case cochée)
    paymentCommitment: z.literal(true, {
      error: "Vous devez vous engager à payer sous 10 jours.",
    }),
    // adresse de facturation saisie par le client : elle figure sur la facture
    // trim retire les espaces au début et à la fin, avant de vérifier la longueur
    // max(255) : la taille de la colonne purchase.buyer_address
    billingAddress: z
      .string({ error: "L'adresse de facturation est obligatoire." })
      .trim()
      .min(1, { error: "L'adresse de facturation est obligatoire." })
      .max(255, { error: "L'adresse de facturation est trop longue." }),
  });
  // parse lève une erreur si le body ne respecte pas le schéma :
  // le gestionnaire d'erreurs la transforme en réponse 400
  // on ne garde que paymentMethod et billingAddress : paymentCommitment vaut forcément true ici
  const { paymentMethod, billingAddress } = createOrderSchema.parse(req.body);

  // 2. le panier n'est pas une table : ce sont les lignes cart_item du compte
  const cart = await cartDatamapper.findCartByUserId(account.id);
  if (cart.length === 0) {
    throw new BadRequestError("Votre panier est vide.");
  }

  // 3. some : true si AU MOINS une ligne vérifie la condition → 409
  const hasUnavailableTree = cart.some(
    (line) => line.availabilityName !== "disponible",
  );
  if (hasUnavailableTree) {
    throw new ConflictError("Un arbre de votre panier n'est plus disponible.");
  }

  // 4. total recalculé ici, avec les prix de la BDD (jamais envoyé par le front)
  // reduce : additionne prix × quantité de chaque ligne, en partant de 0
  const total = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
  // les nombres à virgule de JS sont approximatifs (16.9 * 3 = 50.699999999999996) :
  // on arrondit au centime
  const totalAmount = Math.round(total * 100) / 100;

  // 5. la commande, ses lignes et le panier vidé, dans une seule transaction
  const orderId = await ordersDatamapper.createOrderFromCart(
    account,
    cart,
    paymentMethod,
    totalAmount,
    billingAddress,
  );

  // 6. relecture de la commande enregistrée : même format que GET /api/orders/:id
  const order = await ordersDatamapper.findOrderByIdAndAccountId(
    orderId,
    account.id,
  );

  // 201 Created : une nouvelle ressource (la commande) a été créée
  res.status(201).json({
    // ...order recopie toutes les propriétés de la commande dans la réponse,
    // à côté desquelles on ajoute les instructions de paiement
    ...order,
    paymentInstructions: getPaymentInstructions(paymentMethod),
  });
}

// --------------------------------
// GET /api/orders/:id → une commande du client connecté (page de confirmation, réutilisée par F6)
// --------------------------------
export async function getOrder(req: IAuthenticatedRequest, res: Response) {
  // compte du client connecté (isConnected l'a déjà vérifié)
  const account = await getAuthenticatedUser(req);
  // l'id a déjà été vérifié par validateId (entier > 0)
  // req.params contient toujours des chaînes : Number le convertit en nombre
  const orderId = Number(req.params.id);

  // on cherche avec l'id de la commande ET celui du compte :
  // un client ne peut lire que ses propres commandes
  const order = await ordersDatamapper.findOrderByIdAndAccountId(
    orderId,
    account.id,
  );
  // commande inconnue OU d'un autre client : même 404
  // (un 403 révélerait que la commande existe chez quelqu'un d'autre)
  if (!order) {
    throw new NotFoundError("Commande introuvable.");
  }

  res.status(200).json({
    ...order,
    paymentInstructions: getPaymentInstructions(order.paymentMethod),
  });
}
