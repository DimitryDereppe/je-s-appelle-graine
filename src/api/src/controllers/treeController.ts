import type { NextFunction, Request, Response } from "express";
import { treeDatamapper } from "../datamappers/treeDatamapper.ts";
import { NotFoundError } from "../lib/errors.ts";

// les 3 arbres mis en avant sur l'accueil
export async function getFeaturedTrees(_req: Request, res: Response) {
  const trees = await treeDatamapper.findFeatured();
  res.status(200).json(trees);
}

// la liste des arbres du catalogue
export async function getAllCatalog(_req: Request, res: Response) {
  const trees = await treeDatamapper.findAllCatalog();
  res.status(200).json(trees);
}

// les arbres d'une catégorie, si ?category=:id est dans l'URL
export async function getTreesByCategory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { category } = req.query;

  // pas de filtre : on passe la main à getAllCatalog
  if (category === undefined) {
    return next();
  }

  const trees = await treeDatamapper.findByCategory(Number(category));
  res.status(200).json(trees);
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

// Recherche d'arbres par nom (?search=...), combinable avec une catégorie (?category=:id)
export async function getTreesBySearch(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Récupère les paramètres de l'URL (ce sont toujours des chaînes)
  const { search, category } = req.query;

  // Pas de recherche valide : on passe la main au contrôleur suivant (getByCategory)
  if (typeof search !== "string" || !search.trim()) {
    return next();
  }

  // Convertit category en nombre seulement s'il est présent, sinon undefined
  const categoryId = category ? Number(category) : undefined;

  // Recherche en base par nom, et par catégorie si elle est fournie
  const trees = await treeDatamapper.findBySearch(search.trim(), categoryId);

  // Renvoie la liste des arbres trouvés
  res.status(200).json(trees);
}
