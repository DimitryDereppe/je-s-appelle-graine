import type { Request, Response } from "express";
import { treeDatamapper } from "../datamappers/treeDatamapper.ts";

// la liste des arbres
export async function getAllTrees(_req: Request, res: Response) {
  const trees = await treeDatamapper.findAll();
  res.status(200).json(trees);
}

// les 3 arbres mis en avant sur l'accueil
export async function getFeaturedTrees(_req: Request, res: Response) {
  const trees = await treeDatamapper.findFeatured();
  res.status(200).json(trees);
}
