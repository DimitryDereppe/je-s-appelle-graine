import type { OrderStatus, PaymentMethod } from "../../@types";

// Écrit un montant en euros, à la française : 9.9 → « 9,90 € »
export function formatEuros(amount: number): string {
  return amount.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

// Écrit une date en français : « 5 novembre 2026 »
// Avec timeZone, le serveur et le navigateur affichent ainsi le même jour
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    dateStyle: "long",
    timeZone: "Europe/Paris",
  });
}

// Statut d'une commande, tel qu'on l'affiche au client
// pas de default : status ne peut valoir que ces 4 valeurs (type OrderStatus),
// TypeScript signale un case oublié
export function formatOrderStatus(status: OrderStatus): string {
  switch (status) {
    case "en attente":
      return "En attente de paiement";
    case "payée":
      return "Payée";
    case "plantée":
      return "Plantée";
    case "annulée":
      return "Annulée";
  }
}

// Mode de paiement, tel qu'on l'affiche (la base stocke "virement" ou "chèque")
export function formatPaymentMethod(method: PaymentMethod): string {
  return method === "virement" ? "Virement bancaire" : "Chèque";
}

// Rôle d'un compte, tel qu'on l'affiche (la base stocke "customer" ou "admin")
export function formatRole(role: string): string {
  return role === "admin" ? "Administrateur" : "Client";
}
