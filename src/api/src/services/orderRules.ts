// --------------------------------
// Règles métier des commandes
// --------------------------------
// Couche métier : ces fonctions décrivent comment marche la boutique.
// Elles ne connaissent ni Express (pas de req/res) ni la BDD (pas de SQL) :
// elles reçoivent des valeurs et renvoient un résultat.
// Les contrôleurs les appellent, puis décident du code HTTP à renvoyer.

import type { OrderStatus, PaymentMethod } from "../@types/index.d.ts";
import { config } from "../../config.ts";

// --------------------------------
// Total d'une liste de lignes (panier ou commande), arrondi au centime
// --------------------------------
// le paramètre accepte tout objet qui a au moins price et quantity :
// une ligne de panier comme une ligne de commande conviennent
export function computeTotal(
  lines: { price: number; quantity: number }[],
): number {
  // reduce : additionne prix × quantité de chaque ligne, en partant de 0
  const total = lines.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );
  // les nombres à virgule de JS sont approximatifs (16.9 * 3 = 50.699999999999996) :
  // on arrondit au centime
  return Math.round(total * 100) / 100;
}

// --------------------------------
// Changements de statut autorisés pour l'administrateur
// --------------------------------
// en attente → payée ou annulée ; payée → plantée ; tout le reste est interdit
// Record<OrderStatus, OrderStatus[]> : pour chaque statut de départ, la liste des statuts d'arrivée possibles
// (TypeScript vérifie qu'aucun des 4 statuts n'est oublié)
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  "en attente": ["payée", "annulée"],
  payée: ["plantée"],
  plantée: [],
  annulée: [],
};

export function canChangeStatus(from: OrderStatus, to: OrderStatus): boolean {
  // includes : true si le statut d'arrivée fait partie de la liste autorisée
  return ALLOWED_TRANSITIONS[from].includes(to);
}

// --------------------------------
// Le client ne peut annuler que si la commande attend encore son paiement
// --------------------------------
export function canBeCancelledByClient(status: OrderStatus): boolean {
  return status === "en attente";
}

// --------------------------------
// Instructions de paiement selon le mode choisi (valeurs lues dans la config, contrat #103)
// --------------------------------
export function getPaymentInstructions(paymentMethod: PaymentMethod) {
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
