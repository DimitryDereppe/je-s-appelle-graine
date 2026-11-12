export interface IFeaturedTree {
  id: number;
  name: string;
  price: number;
  photoUrl: string | null;
  plantingLocation: string | null;
  categoryName: string;
  categoryId: number;
}

// Catalogue
// extends : reprend tous les champs de IFeaturedTree, et en ajoute un
export interface ICatalogueTree extends IFeaturedTree {
  availabilityName: "disponible" | "en rupture de stock" | "retiré";
}

// Fiche
export interface ITree extends ICatalogueTree {
  description: string | null;
}

// Arbre utilisé dans l’administration, avec l’identifiant de sa disponibilité.
export interface IAdminTree extends ITree {
  availabilityId: number;
}

//Formulaire inscription client
export interface IRegister {
  firstname: string;
  lastname: string;
  accountType: AccountType;
  organizationName: string | null;
  email: string;
  password: string;
}

// Menu filtre catégorie (bouton radio)
export interface ICategory {
  id: number;
  name: string;
}

// --------------------------------
// Panier : une ligne renvoyée par GET /api/cart (même forme que côté API)
// --------------------------------
export interface ICartItem {
  id: number;
  accountId: number;
  treeId: number;
  quantity: number;
  name: string;
  price: number;
  photoUrl: string | null;
  plantingLocation: string | null;
  availabilityName: string;
}

// --------------------------------
// Commandes (F5, contrat carte #103) — table purchase ("order" est réservé en SQL)
// --------------------------------
export type PaymentMethod = "virement" | "chèque";

// ligne de commande : nom, prix et lieu figés au moment de l'achat
export interface IOrderLine {
  treeName: string;
  unitPrice: number;
  quantity: number;
  plantingLocation: string | null;
}

// commande telle que lue en BDD (sans les instructions de paiement, qui viennent de la config)
export interface IOrder {
  id: number;
  purchaseDate: string;
  dueDate: string; // "AAAA-MM-JJ" : date de commande + 10 jours
  status: string;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  billingAddress: string; // adresse de facturation saisie par le client
  lines: IOrderLine[];
}
// instructions de paiement, calculées par l'API à partir de sa config
// | : soit les coordonnées bancaires (virement), soit l'ordre et l'adresse (chèque)
export type PaymentInstructions =
  | { iban: string; bic: string; holder: string }
  | { payableTo: string; address: string };

// réponse de POST /api/orders et GET /api/orders/:id
// extends : reprend tous les champs de IOrder, et ajoute les instructions de paiement
export interface IOrderWithInstructions extends IOrder {
  paymentInstructions: PaymentInstructions;
}

// --------------------------------
// Commandes du client (F6, contrat carte #159)
// --------------------------------
export type OrderStatus = "en attente" | "payée" | "plantée" | "annulée";

// une commande dans l'historique (GET /api/orders) : sans les lignes
export interface IOrderSummary {
  id: number;
  purchaseDate: string;
  status: OrderStatus;
  totalAmount: number;
}

// une commande en détail (GET /api/orders/:id et réponse de l'annulation)
// extends + status : avec le statut limité aux 4 valeurs
export interface IOrderDetail extends IOrderWithInstructions {
  status: OrderStatus;
}

//---------------------------------
// Gestion des commandes (F8, contrat carte #167)
//---------------------------------
export interface IAdminOrderSummary extends IOrderSummary {
  buyerFirstname: string;
  buyerLastname: string;
  buyerEmail: string;
  isLate: boolean; // true si la commande est « en attente » depuis plus de 10 jours (calculé par l'API)
}

// une commande en détail pour l'admin (GET /api/admin/orders/:id et réponse du PATCH du statut)
// extends : les champs de la liste, plus ceux du détail
export interface IAdminOrderDetail extends IAdminOrderSummary {
  dueDate: string; // "AAAA-MM-JJ" : date de commande + 10 jours
  paymentMethod: PaymentMethod;
  buyerOrganization: string | null; // null si non renseignée
  billingAddress: string | null; // null si non renseignée
  // date et heure (ISO) de chaque changement de statut, null tant qu'il n'a pas eu lieu
  paidAt: string | null;
  plantedAt: string | null;
  cancelledAt: string | null;
  lines: IOrderLine[]; // même format que GET /api/orders/:id
}

// --------------------------------
// Compte du client (F6, contrat carte #159)
// --------------------------------
// mêmes valeurs que le CHECK de la table account (utilisé aussi par IRegister)
export type AccountType = "particulier" | "association" | "entreprise";

// réponse de GET et PATCH /api/users/me
export interface IAccount {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  address: string | null;
  accountType: AccountType;
  organizationName: string | null;
  role: string;
}
