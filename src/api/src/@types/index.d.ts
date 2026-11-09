import type { Request } from "express";

// Rôles de la table role. Exception à la règle « interface » : une liste de valeurs ne peut pas être une interface
export type Role = "customer" | "admin";

// Accueil
export interface IFeaturedTree {
  id: number;
  name: string;
  price: number;
  photoUrl: string | null;
  plantingLocation: string | null;
  categoryName: string;
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

// Champs communs à tous les comptes
export interface IAccountBase {
  firstname: string;
  lastname: string;
  email: string;
  accountType: "particulier" | "association" | "entreprise";
  organizationName: string | null;
}

// Compte client
export interface IAccount extends IAccountBase {
  id: number;
  role: Role;
}

// Compte connecté renvoyé par GET /api/users/me : avec l'adresse (pour récapitulatif de la commande F5, espace client F6)
export interface IAccountProfile extends IAccount {
  address: string | null;
  // lu pour vérifier que le compte n'a pas été désactivé, mais pas renvoyé par getMe
  isActive: boolean;
}

// Compte client pour le login : avec le mot de passe haché et compte actif
export interface IAccountLogin extends IAccount {
  isActive: boolean;
  password: string;
}

// Compte à créer à l'inscription (createAccount) : pas encore d'id, rôle client ajouté par la requête SQL
export interface INewAccount extends IAccountBase {
  password: string; // déjà haché par argon2
}

export interface IUpdateProfile {
  firstname: string;
  lastname: string;
  email: string;
  address: string | null;
  accountType: INewAccount["accountType"]; // même type qu'à l'inscription
  organizationName: string | null;
}

// Contenu du jeton JWT : créé par createAccessToken (lib/token.ts), relu par isConnected
export interface IAccessToken {
  userId: number;
  userRole: Role;
}

// Requête d'un utilisateur connecté : isConnected y ajoute l'id et le rôle lus dans le JWT
// champs facultatifs (?) : avant isConnected, la requête ne les a pas encore
export interface IAuthenticatedRequest extends Request {
  userId?: number;
  userRole?: Role;
}

//Formulaire inscription client
export interface IRegister {
  firstname: string;
  lastname: string;
  accountType: IAccount["accountType"];
  organizationName: string | null;
  email: string;
  password: string;
}

//Panier
export interface ICartItem {
  id: number;
  accountId: number;
  treeId: number;
  quantity: number;
  name: string;
  price: number;
  photoUrl: string | null;
  // planting_location sans NOT NULL dans le schéma : peut valoir null
  plantingLocation: string | null;
  // availability.name est NOT NULL : toujours une chaîne
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

// Catégorie d'arbre (filtre du catalogue)
export interface ICategory {
  id: number;
  name: string;
}
