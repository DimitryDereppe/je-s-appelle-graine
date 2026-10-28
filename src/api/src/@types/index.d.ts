export type ICategory = {
  id: number;
  name: string;
};

export type ITree = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  planting_location: string | null;
  category_id: number;
  availability_id: number;
};

// Correspond exactement aux colonnes renvoyées par treeDatamapper.findFeatured()
export type IFeaturedTree = {
  id: number;
  name: string;
  price: number;
  photo_url: string | null;
  category_id: number;
};
