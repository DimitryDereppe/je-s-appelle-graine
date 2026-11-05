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
