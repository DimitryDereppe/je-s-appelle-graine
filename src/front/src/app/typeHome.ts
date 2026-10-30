import { StaticImport } from "next/dist/shared/lib/get-img-props";

export interface Tree {
  photo_url: string | StaticImport;
  id: number;
  name: string;
  scientific: string;
  price: string;
  description: string;
  photoUrl: string;
  plantingLocation: string;
  category_id: number;
  availability_id: number;
}

export interface Feature {
  id: number;
  title: string;
}

export interface Feature {
  id: number;
  title: string;
  icon: string;
}
