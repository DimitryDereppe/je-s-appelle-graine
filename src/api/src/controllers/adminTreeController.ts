import type { Request, Response } from "express";
import { z } from "zod";
import type { ITreeInput } from "../@types/index.d.ts";
import { adminTreeDatamapper } from "../datamappers/adminTreeDatamapper.ts";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../lib/errors.ts";
import { readdir } from "node:fs/promises";

const treeBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Le nom est obligatoire." })
    .max(150, {
      error: "Le nom ne peut pas dépasser 150 caractères.",
    }),
  description: z.string().nullable(),
  price: z
    .number({ error: "Le prix doit être positif." })
    .min(0, { error: "Le prix doit être positif." }),
  photoUrl: z
    .string()
    .max(255, {
      error: "Le chemin de la photo ne peut pas dépasser 255 caractères.",
    })
    .startsWith("/images/trees/", {
      error: "Le chemin de la photo doit commencer par /images/trees/.",
    })
    .nullable(),
  plantingLocation: z
    .string()
    .max(150, {
      error: "Le lieu de plantation ne peut pas dépasser 150 caractères.",
    })
    .nullable(),
  categoryId: z.number().int({ error: "Catégorie invalide." }),
  availabilityId: z.number().int({ error: "Disponibilité invalide." }),
});
// Le dossier des photos, situé à côté du dossier controllers.
const treePhotosDirectory = new URL("../public/images/trees/", import.meta.url);

// Pour le PATCH, tous les champs deviennent facultatifs.
const patchTreeBodySchema = treeBodySchema.partial();

// GET /api/admin/trees
export async function findAll(_req: Request, res: Response): Promise<void> {
  const trees = await adminTreeDatamapper.findAll();
  res.status(200).json(trees);
}

// GET /api/admin/trees/:id
export async function findById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const tree = await adminTreeDatamapper.findById(id);

  if (!tree) {
    throw new NotFoundError("Arbre introuvable.");
  }

  res.status(200).json(tree);
}

// GET /api/admin/availabilities
export async function findAllAvailabilities(
  _req: Request,
  res: Response,
): Promise<void> {
  const availabilities = await adminTreeDatamapper.findAllAvailabilities();
  res.status(200).json(availabilities);
}
// GET /api/admin/tree-photos
export async function findAllPhotos(
  _req: Request,
  res: Response,
): Promise<void> {
  // Lit les fichiers du dossier des photos.
  const files = await readdir(treePhotosDirectory, { withFileTypes: true });

  // Garde les fichiers image et prépare le chemin enregistré pour chaque arbre.
  const photos = files
    .filter(
      (file) =>
        file.isFile() && /\.(avif|gif|jpe?g|png|webp)$/i.test(file.name),
    )
    .map((file) => ({
      name: file.name,
      photoUrl: `/images/trees/${encodeURIComponent(file.name)}`,
    }))
    .sort((first, second) => first.name.localeCompare(second.name, "fr"));

  res.status(200).json(photos);
}
// POST /api/admin/trees
export async function create(req: Request, res: Response): Promise<void> {
  // Vérifie les champs reçus dans le body.
  const treeInput = await treeBodySchema.parseAsync(req.body);

  // Vérifie que la catégorie choisie existe.
  const categoryExists = await adminTreeDatamapper.categoryExists(
    treeInput.categoryId,
  );

  if (!categoryExists) {
    throw new BadRequestError("Catégorie invalide.");
  }

  // Vérifie que la disponibilité choisie existe.
  const availabilityExists = await adminTreeDatamapper.availabilityExists(
    treeInput.availabilityId,
  );

  if (!availabilityExists) {
    throw new BadRequestError("Disponibilité invalide.");
  }

  // Enregistre l'arbre et récupère son identifiant.
  const newTreeId = await adminTreeDatamapper.create(treeInput);

  // Récupère l'arbre complet pour le renvoyer dans la réponse.
  const newTree = await adminTreeDatamapper.findById(newTreeId);

  res.status(201).json(newTree);
}

// PATCH /api/admin/trees/:id
export async function update(req: Request, res: Response): Promise<void> {
  // Vérifie les champs envoyés. Ils peuvent être absents si on ne les modifie pas.
  const changes = await patchTreeBodySchema.parseAsync(req.body);
  const id = Number(req.params.id);

  // Récupère l'arbre actuel pour garder ses champs non modifiés.
  const currentTree = await adminTreeDatamapper.findById(id);

  if (!currentTree) {
    throw new NotFoundError("Arbre introuvable.");
  }

  // Prépare l'arbre complet à enregistrer.
  const treeInput: ITreeInput = {
    name: changes.name ?? currentTree.name,
    description:
      changes.description !== undefined
        ? changes.description
        : currentTree.description,
    price: changes.price ?? currentTree.price,
    photoUrl:
      changes.photoUrl !== undefined ? changes.photoUrl : currentTree.photoUrl,
    plantingLocation:
      changes.plantingLocation !== undefined
        ? changes.plantingLocation
        : currentTree.plantingLocation,
    categoryId: changes.categoryId ?? currentTree.categoryId,
    availabilityId: changes.availabilityId ?? currentTree.availabilityId,
  };

  // Vérifie que la catégorie existe.
  const categoryExists = await adminTreeDatamapper.categoryExists(
    treeInput.categoryId,
  );

  if (!categoryExists) {
    throw new BadRequestError("Catégorie invalide.");
  }

  // Vérifie que la disponibilité existe.
  const availabilityExists = await adminTreeDatamapper.availabilityExists(
    treeInput.availabilityId,
  );

  if (!availabilityExists) {
    throw new BadRequestError("Disponibilité invalide.");
  }

  // Enregistre les modifications.
  const updatedTreeId = await adminTreeDatamapper.update(id, treeInput);

  if (updatedTreeId === undefined) {
    throw new NotFoundError("Arbre introuvable.");
  }

  // Récupère l'arbre modifié pour le renvoyer.
  const updatedTree = await adminTreeDatamapper.findById(updatedTreeId);

  res.status(200).json(updatedTree);
}

// DELETE /api/admin/trees/:id
export async function deleteById(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);

  // Vérifie que l'arbre existe.
  const tree = await adminTreeDatamapper.findById(id);

  if (!tree) {
    throw new NotFoundError("Arbre introuvable.");
  }

  // Vérifie si l'arbre apparaît dans une commande.
  const hasOrders = await adminTreeDatamapper.hasOrders(id);

  if (hasOrders) {
    throw new ConflictError(
      "Cet arbre a déjà été commandé : passez-le à « retiré ».",
    );
  }

  // Supprime l'arbre.
  const deletedTreeId = await adminTreeDatamapper.deleteById(id);

  if (deletedTreeId === undefined) {
    throw new NotFoundError("Arbre introuvable.");
  }

  // Confirme que l'arbre a été supprimé.
  res.status(204).send();
}
