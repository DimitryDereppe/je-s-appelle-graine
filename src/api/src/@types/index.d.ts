import type { Request } from "express";

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

// Compte client
export interface IAccount {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  accountType: "particulier" | "association" | "entreprise";
  organizationName: string | null;
  role: "admin" | "customer";
}

// Compte client pour le login : avec le mot de passe haché et compte actif
export interface IAccountLogin extends IAccount {
  isActive: boolean;
  password: string;
}

// Requête d'un utilisateur connecté : isConnected y ajoute l'id et le rôle lus dans le JWT
// champs facultatifs (?) : avant isConnected, la requête ne les a pas encore
export interface AuthenticatedRequest extends Request {
  userId?: number;
  userRole?: "customer" | "admin";
}
