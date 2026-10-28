export type ICategory = {
  id: number;
  name: string;
};

export type ITree = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  photoUrl: string | null;
  plantingLocation: string | null;
  categoryId: number;
  availabilityId: number;
};

// Correspond exactement aux colonnes renvoyées par treeDatamapper.findFeatured()
export type IFeaturedTree = {
  id: number;
  name: string;
  price: number;
  photoUrl: string | null;
  category: ICategory;
};
