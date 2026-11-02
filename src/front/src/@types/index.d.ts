export interface IFeaturedTree {
  id: number;
  name: string;
  price: number;
  photoUrl: string | null;
  plantingLocation: string | null;
  categoryName: string;
  categoryId: number;
  availabilityName: string;
}

// Catalogue
// extends : reprend tous les champs de IFeaturedTree, et en ajoute un
export interface ICatalogueTree extends IFeaturedTree {
  availabilityName: "available" | "out_of_stock" | "withdrawn";
}

// Fiche
export interface ITree extends ICatalogueTree {
  description: string | null;
}
