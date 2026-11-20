import type { Request, Response } from "express";
import { treeDatamapper } from "../datamappers/treeDatamapper.ts";
import { NotFoundError } from "../lib/errors.ts";
import { categoryDatamapper } from "../datamappers/categoryDatamapper.ts";

// les 3 arbres mis en avant sur l'accueil
export async function getFeaturedTrees(_req: Request, res: Response) {
  const trees = await treeDatamapper.findFeatured();
  res.status(200).json(trees);
}

// la liste des arbres du catalogue et peut être filtré par ?category=, ?search= et ?location=
export async function getAllCatalog(req: Request, res: Response) {
  //Lecture de L'URL
  const { category, search, location } = req.query;
  //Conversion de la catégorie, seulement si elle est présente
  const categoryId = category === undefined ? undefined : Number(category);
  //Nettoyage de la recherche
  // trim : une recherche vide ou faite d'espaces revient à ne pas filtrer
  const name = typeof search === "string" ? search.trim() : undefined;

  // le middleware validateLocationQuery garantit un texte ou undefined
  const plantingLocation = typeof location === "string" ? location : undefined;

  const trees = await treeDatamapper.findAllCatalog(
    categoryId,
    name,
    plantingLocation,
  );
  res.status(200).json(trees);
}

// la liste des lieux de plantation, pour le filtre du catalogue
export async function getAllLocations(_req: Request, res: Response) {
  const locations = await treeDatamapper.findLocations();
  res.status(200).json(locations);
}

// un arbre selon son id
export async function getOneTree(req: Request, res: Response) {
  const id = Number(req.params.id);
  const tree = await treeDatamapper.findById(id);
  if (!tree || tree.availabilityName === "retiré") {
    throw new NotFoundError("Arbre introuvable");
  }
  res.status(200).json(tree);
}

// la liste des catégories, pour le filtre du catalogue
export async function getAllCategories(_req: Request, res: Response) {
  const categories = await categoryDatamapper.findAll();
  res.status(200).json(categories);
}
