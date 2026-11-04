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
