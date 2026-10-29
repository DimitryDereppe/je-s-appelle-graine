import type { Request, Response } from "express";
import { treeDatamapper } from "../datamappers/treeDatamapper.ts";
import { NotFoundError } from "../lib/errors.ts";

// la liste des arbres du catalogue
export async function getAllCatalog(_req: Request, res: Response) {
  const trees = await treeDatamapper.findAllCatalog();
  if (!trees) {
    throw new NotFoundError("Data not found");
  }
  res.status(200).json(trees);
}

// les 3 arbres mis en avant sur l'accueil
export async function getFeaturedTrees(_req: Request, res: Response) {
  const trees = await treeDatamapper.findFeatured();
  if (!trees) {
    throw new NotFoundError("Data not found");
  }
  res.status(200).json(trees);
}
